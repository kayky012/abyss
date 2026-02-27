const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const ms = require("ms");

module.exports = {
  name: "mute",
  description: "Timeout a user",
  category: "moderation",
  permissions: [PermissionsBitField.Flags.ModerateMembers],
  botPermissions: [PermissionsBitField.Flags.ModerateMembers],
  
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Timeout a user")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("The user to mute")
        .setRequired(true))
    .addStringOption(option => 
      option.setName("duration")
        .setDescription("Mute duration (e.g., 10m, 1h, 1d)")
        .setRequired(true))
    .addStringOption(option => 
      option.setName("reason")
        .setDescription("Reason for the mute")
        .setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser("user");
    const duration = interaction.options.getString("duration");
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
        content: "I cannot mute that user. They may have higher permissions than me.",
        ephemeral: true
      });
    }
    
    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "You cannot mute an administrator.",
        ephemeral: true
      });
    }
    
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "You cannot mute yourself.",
        ephemeral: true
      });
    }
    
    // Parse duration
    const msDuration = ms(duration);
    if (!msDuration || msDuration > ms("28d")) {
      return interaction.reply({
        content: "Invalid duration. Maximum is 28 days. Use format: 1m, 1h, 1d",
        ephemeral: true
      });
    }
    
    try {
      await member.timeout(msDuration, `${interaction.user.tag}: ${reason}`);
      
      const expiresAt = new Date(Date.now() + msDuration);
      
      const embed = new EmbedBuilder()
        .setColor(client.colors.warning)
        .setTitle("User Muted")
        .setDescription(`${user.tag} has been timed out.`)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: interaction.user.tag, inline: true },
          { name: "Duration", value: duration, inline: true },
          { name: "Reason", value: reason, inline: false },
          { name: "Expires", value: `<t:${Math.floor(expiresAt / 1000)}:R>`, inline: true }
        )
        .setFooter({ text: `Muted by ${interaction.user.tag}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
      // Save to database
      if (client.schemas?.muteSchema) {
        await new client.schemas.muteSchema({
          muteId: `mute_${Date.now()}_${user.id}`,
          userId: user.id,
          userTag: user.tag,
          guildId: interaction.guild.id,
          moderatorId: interaction.user.id,
          moderatorTag: interaction.user.tag,
          reason: reason,
          duration: msDuration,
          expiresAt: expiresAt
        }).save();
      }
      
      // Log to moderation channel
      await logModAction(interaction.guild, client, {
        action: "MUTE",
        user: user,
        moderator: interaction.user,
        reason: reason,
        details: `Duration: ${duration}`
      });
      
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error trying to mute that user.",
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
      .setTitle(`🔇 ${data.action}`)
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