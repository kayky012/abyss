const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "warnings",
  description: "View user warnings",
  category: "moderation",
  permissions: [PermissionsBitField.Flags.ModerateMembers],
  
  data: new SlashCommandBuilder()
    .setName("warnings")
    .setDescription("View user warnings")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("The user to view warnings for")
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName("page")
        .setDescription("Page number")
        .setRequired(false)
        .setMinValue(1)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser("user");
    const page = interaction.options.getInteger("page") || 1;
    const limit = 5;
    const skip = (page - 1) * limit;
    
    const member = interaction.guild.members.cache.get(user.id);
    
    if (!member) {
      return interaction.reply({
        content: "That user is not in this server.",
        ephemeral: true
      });
    }
    
    try {
      // Get warnings from database
      const warnings = await client.schemas?.warnSchema?.find({
        guildId: interaction.guild.id,
        userId: user.id,
        active: true
      }).sort({ createdAt: -1 }).skip(skip).limit(limit);
      
      const totalWarnings = await client.schemas?.warnSchema?.countDocuments({
        guildId: interaction.guild.id,
        userId: user.id,
        active: true
      });
      
      const totalPages = Math.ceil(totalWarnings / limit);
      
      if (!warnings || warnings.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(client.colors.success)
          .setTitle(`Warnings for ${user.tag}`)
          .setDescription("This user has no warnings.")
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `Total: 0 warnings` })
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed] });
      }
      
      const warningList = warnings.map((w, i) => {
        return `**#${skip + i + 1}** | ID: \`${w.warnId}\`\n` +
               `**Reason:** ${w.reason}\n` +
               `**Moderator:** ${w.moderatorTag}\n` +
               `**Date:** <t:${Math.floor(w.createdAt / 1000)}:R>`;
      }).join("\n\n");
      
      const embed = new EmbedBuilder()
        .setColor(client.colors.warning)
        .setTitle(`Warnings for ${user.tag}`)
        .setDescription(warningList)
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: "Total Warnings", value: totalWarnings.toString(), inline: true },
          { name: "Page", value: `${page}/${totalPages}`, inline: true }
        )
        .setFooter({ text: `Use /warnings page to view more` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error trying to fetch warnings.",
        ephemeral: true
      });
    }
  }
};