const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "ban",
  description: "Ban a user from the server",
  category: "moderation",
  permissions: [PermissionsBitField.Flags.BanMembers],
  botPermissions: [PermissionsBitField.Flags.BanMembers],
  
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("The user to ban")
        .setRequired(true))
    .addStringOption(option => 
      option.setName("reason")
        .setDescription("Reason for the ban")
        .setRequired(false))
    .addIntegerOption(option => 
      option.setName("delete_messages")
        .setDescription("Delete messages from the last X days")
        .setRequired(false)
        .addChoices(
          { name: "Don't delete", value: 0 },
          { name: "Last 24 hours", value: 1 },
          { name: "Last 3 days", value: 3 },
          { name: "Last 7 days", value: 7 }
        )),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";
    const deleteDays = interaction.options.getInteger("delete_messages") || 0;
    
    const member = interaction.guild.members.cache.get(user.id);
    
    // Validation checks
    if (!member) {
      return interaction.reply({
        content: "That user is not in this server.",
        ephemeral: true
      });
    }
    
    if (!member.bannable) {
      return interaction.reply({
        content: "I cannot ban that user. They may have higher permissions than me.",
        ephemeral: true
      });
    }
    
    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "You cannot ban an administrator.",
        ephemeral: true
      });
    }
    
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "You cannot ban yourself.",
        ephemeral: true
      });
    }
    
    try {
      await interaction.guild.members.ban(user.id, { 
        reason: `${interaction.user.tag}: ${reason}`,
        deleteMessageSeconds: deleteDays * 86400
      });
      
      const embed = new EmbedBuilder()
        .setColor(client.colors.error)
        .setTitle("User Banned")
        .setDescription(`${user.tag} has been banned from the server.`)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: interaction.user.tag, inline: true },
          { name: "Reason", value: reason, inline: false },
          { name: "Messages Deleted", value: deleteDays === 0 ? "None" : `Last ${deleteDays} day(s)`, inline: true }
        )
        .setFooter({ text: `Banned by ${interaction.user.tag}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
      // Log to moderation channel
      await logModAction(interaction.guild, client, {
        action: "BAN",
        user: user,
        moderator: interaction.user,
        reason: reason,
        details: `Messages deleted: ${deleteDays} days`
      });
      
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error trying to ban that user.",
        ephemeral: true
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
      .setColor(client.colors.error)
      .setTitle(`🔨 ${data.action}`)
      .addFields(
        { name: "User", value: `${data.user.tag} (${data.user.id})`, inline: true },
        { name: "Moderator", value: data.moderator.tag, inline: true },
        { name: "Reason", value: data.reason, inline: false }
      );
    
    if (data.details) {
      embed.addFields({ name: "Details", value: data.details, inline: false });
    }
    
    embed.setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (error) {
    console.error("Error logging mod action:", error);
  }
}