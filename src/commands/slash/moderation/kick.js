const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "kick",
  description: "Kick a user from the server",
  category: "moderation",
  permissions: [PermissionsBitField.Flags.KickMembers],
  botPermissions: [PermissionsBitField.Flags.KickMembers],
  
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user from the server")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("The user to kick")
        .setRequired(true))
    .addStringOption(option => 
      option.setName("reason")
        .setDescription("Reason for the kick")
        .setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason provided";
    
    const member = interaction.guild.members.cache.get(user.id);
    
    // Validation checks
    if (!member) {
      return interaction.reply({
        content: "That user is not in this server.",
        ephemeral: true
      });
    }
    
    if (!member.kickable) {
      return interaction.reply({
        content: "I cannot kick that user. They may have higher permissions than me.",
        ephemeral: true
      });
    }
    
    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "You cannot kick an administrator.",
        ephemeral: true
      });
    }
    
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "You cannot kick yourself.",
        ephemeral: true
      });
    }
    
    try {
      await member.kick(`${interaction.user.tag}: ${reason}`);
      
      const embed = new EmbedBuilder()
        .setColor(client.colors.warning)
        .setTitle("User Kicked")
        .setDescription(`${user.tag} has been kicked from the server.`)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: interaction.user.tag, inline: true },
          { name: "Reason", value: reason, inline: false }
        )
        .setFooter({ text: `Kicked by ${interaction.user.tag}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
      // Log to moderation channel
      await logModAction(interaction.guild, client, {
        action: "KICK",
        user: user,
        moderator: interaction.user,
        reason: reason
      });
      
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error trying to kick that user.",
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
      .setColor(client.colors.warning)
      .setTitle(`👢 ${data.action}`)
      .addFields(
        { name: "User", value: `${data.user.tag} (${data.user.id})`, inline: true },
        { name: "Moderator", value: data.moderator.tag, inline: true },
        { name: "Reason", value: data.reason, inline: false }
      )
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (error) {
    console.error("Error logging mod action:", error);
  }
}