const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "unmute",
  description: "Remove timeout from a user",
  category: "moderation",
  permissions: [PermissionsBitField.Flags.ModerateMembers],
  botPermissions: [PermissionsBitField.Flags.ModerateMembers],
  
  data: new SlashCommandBuilder()
    .setName("unmute")
    .setDescription("Remove timeout from a user")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("The user to unmute")
        .setRequired(true))
    .addStringOption(option => 
      option.setName("reason")
        .setDescription("Reason for unmuting")
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
    
    if (!member.moderatable) {
      return interaction.reply({
        content: "I cannot unmute that user.",
        ephemeral: true
      });
    }
    
    if (!member.communicationDisabledUntil) {
      return interaction.reply({
        content: "This user is not muted.",
        ephemeral: true
      });
    }
    
    try {
      await member.timeout(null, `${interaction.user.tag}: ${reason}`);
      
      const embed = new EmbedBuilder()
        .setColor(client.colors.success)
        .setTitle("User Unmuted")
        .setDescription(`${user.tag} has been unmuted.`)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: interaction.user.tag, inline: true },
          { name: "Reason", value: reason, inline: false }
        )
        .setFooter({ text: `Unmuted by ${interaction.user.tag}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
      // Update database
      if (client.schemas?.muteSchema) {
        await client.schemas.muteSchema.updateMany(
          { 
            userId: user.id, 
            guildId: interaction.guild.id,
            active: true 
          },
          { active: false }
        );
      }
      
      // Log to moderation channel
      await logModAction(interaction.guild, client, {
        action: "UNMUTE",
        user: user,
        moderator: interaction.user,
        reason: reason
      });
      
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error trying to unmute that user.",
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
      .setColor(client.colors.success)
      .setTitle(`🔊 ${data.action}`)
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