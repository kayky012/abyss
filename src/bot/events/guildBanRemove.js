const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildBanRemove",
  async execute(ban, client) {
    if (!ban.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(ban.guild.id);
    
    // Log unban
    if (settings?.logging?.enabled && settings.logging.events?.memberUnban) {
      await logBanRemove(ban, client, settings);
    }
    
    // Update stats
    if (client.schemas?.statsSchema) {
      await client.schemas.statsSchema.findOneAndUpdate(
        { type: "guild", targetId: ban.guild.id },
        { $inc: { "moderation.unbans": 1 } }
      );
    }
  }
};

async function logBanRemove(ban, client, settings) {
  try {
    const logChannel = ban.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    // Try to get who unbanned
    let unbanner = "Unknown";
    
    try {
      const auditLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 23 // Member Ban Remove
      });
      const entry = auditLogs.entries.first();
      if (entry && entry.target.id === ban.user.id) {
        unbanner = entry.executor.tag;
      }
    } catch (error) {
      // No permissions for audit logs
    }
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.success)
      .setTitle("User Unbanned")
      .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "User", value: `${ban.user.tag} (${ban.user.id})`, inline: true },
        { name: "Moderator", value: unbanner, inline: true }
      )
      .setFooter({ text: `Unban recorded` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging unban:", error);
  }
}