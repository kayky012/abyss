const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  name: "help",
  description: "Show all commands",
  category: "general",
  cooldown: 3,
  
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all commands")
    .addStringOption(option =>
      option.setName("command")
        .setDescription("Get help for a specific command")
        .setRequired(false)),
  
  async execute(interaction, client) {
    const commandName = interaction.options.getString("command");
    
    // Help for specific command
    if (commandName) {
      const command = client.slashCommands.get(commandName);
      
      if (!command) {
        return interaction.reply({
          content: `Command \`${commandName}\` not found.`,
          ephemeral: true
        });
      }
      
      const embed = new EmbedBuilder()
        .setColor(client.colors.primary)
        .setTitle(`📚 Help: /${command.name}`)
        .setDescription(command.description || "No description")
        .addFields(
          { name: "Category", value: command.category || "General", inline: true },
          { name: "Cooldown", value: `${command.cooldown || 3}s`, inline: true }
        );
      
      if (command.usage) {
        embed.addFields({ name: "Usage", value: `\`/${command.usage}\``, inline: false });
      }
      
      return await interaction.reply({ embeds: [embed] });
    }
    
    // General help - organize by category
    const categories = {};
    
    client.slashCommands.forEach(cmd => {
      const category = cmd.category || "uncategorized";
      if (!categories[category]) categories[category] = [];
      categories[category].push(cmd.name);
    });
    
    // Sort categories
    const sortedCategories = {
      general: categories.general || [],
      moderation: categories.moderation || [],
      anti: categories.anti || [],
      verification: categories.verification || [],
      welcome: categories.welcome || [],
      goodbye: categories.goodbye || [],
      logging: categories.logging || [],
      owner: categories.owner || []
    };
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle("📚 ABYSS Commands")
      .setDescription(`Total Commands: ${client.slashCommands.size}`)
      .setThumbnail(client.user.displayAvatarURL())
      .setFooter({ 
        text: `Requested by ${interaction.user.tag} • Use /help <command> for details`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    
    // Add fields for each category
    for (const [category, commands] of Object.entries(sortedCategories)) {
      if (commands.length > 0) {
        const commandList = commands.sort().map(c => `\`${c}\``).join(", ");
        embed.addFields({
          name: `📁 ${category.charAt(0).toUpperCase() + category.slice(1)} (${commands.length})`,
          value: commandList,
          inline: false
        });
      }
    }
    
    // Create select menu for categories
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("help_category")
      .setPlaceholder("Select a category")
      .addOptions(
        Object.keys(sortedCategories)
          .filter(cat => sortedCategories[cat].length > 0)
          .map(cat => ({
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            value: cat,
            description: `View ${cat} commands`
          }))
      );
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};