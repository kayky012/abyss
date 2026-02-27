const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "purge",
  description: "Delete multiple messages",
  category: "moderation",
  permissions: [PermissionsBitField.Flags.ManageMessages],
  botPermissions: [PermissionsBitField.Flags.ManageMessages],
  
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete multiple messages")
    .addIntegerOption(option => 
      option.setName("amount")
        .setDescription("Number of messages to delete (1-100)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(option => 
      option.setName("user")
        .setDescription("Only delete messages from this user")
        .setRequired(false))
    .addStringOption(option => 
      option.setName("contains")
        .setDescription("Only delete messages containing this text")
        .setRequired(false)),
  
  async execute(interaction, client) {
    const amount = interaction.options.getInteger("amount");
    const user = interaction.options.getUser("user");
    const contains = interaction.options.getString("contains");
    
    await interaction.deferReply({ ephemeral: true });
    
    try {
      let messages = await interaction.channel.messages.fetch({ limit: 100 });
      
      // Apply filters
      if (user) {
        messages = messages.filter(msg => msg.author.id === user.id);
      }
      
      if (contains) {
        messages = messages.filter(msg => msg.content.includes(contains));
      }
      
      // Take only the requested amount
      const toDelete = messages.first(amount);
      
      if (toDelete.length === 0) {
        return interaction.editReply("No messages found matching the criteria.");
      }
      
      const deleted = await interaction.channel.bulkDelete(toDelete, true);
      
      const embed = new EmbedBuilder()
        .setColor(client.colors.success)
        .setTitle("Messages Purged")
        .setDescription(`Successfully deleted ${deleted.size} messages.`)
        .addFields(
          { name: "Channel", value: `${interaction.channel}`, inline: true },
          { name: "Moderator", value: interaction.user.tag, inline: true }
        )
        .setFooter({ text: `Purged by ${interaction.user.tag}` })
        .setTimestamp();
      
      if (user) {
        embed.addFields({ name: "Filtered User", value: user.tag, inline: true });
      }
      
      if (contains) {
        embed.addFields({ name: "Filtered Text", value: `\`${contains}\``, inline: true });
      }
      
      await interaction.editReply({ embeds: [embed] });
      
      // Log to moderation channel
      await logModAction(interaction.guild, client, {
        action: "PURGE",
        moderator: interaction.user,
        details: `${deleted.size} messages deleted in #${interaction.channel.name}`
      });
      
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "There was an error trying to purge messages. Messages older than 14 days cannot be bulk deleted."
      });
    }
  }
};

async function logModAction(guild, client, data) {
  try {
    const settings = await client.getGuildSettings(guild.id);
    if (!settings?.moderation?.logChannel) return;
    
    const logChannel = guild.channels.cache.get(settings.moderation.logChannel);
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.success)
      .setTitle(`🧹 ${data.action}`)
      .addFields(
        { name: "Moderator", value: data.moderator.tag, inline: true },
        { name: "Details", value: data.details, inline: false }
      )
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (error) {
    console.error("Error logging mod action:", error);
  }
}