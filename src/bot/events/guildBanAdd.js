const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildBanAdd",
  async execute(ban, client) {
    if (!ban.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(ban.guild.id);
    
    // Anti-nuke check
    if (client.antiNuke && client.config.security?.antiNukeEnabled) {
      await client.antiNuke.handleBanAdd(ban);
    }
    
    // Log ban
    if (settings?.logging?.enabled && settings.logging.events?.memberBan) {
      await logBanAdd(ban, client, settings);
    }
    
    // Update stats
    if (client.schemas?.statsSchema) {
      await client.schemas.statsSchema.findOneAndUpdate(
        { type: "guild", targetId: ban.guild.id },
        { $inc: { "moderation.bans": 1 } }
      );
    }
  }
};

async function logBanAdd(ban, client, settings) {
  try {
    const logChannel = ban.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    // Try to get who banned
    let banner = "Unknown";
    let reason = "No reason provided";
    
    try {
      const auditLogs = await ban.guild.fetchAuditLogs({
        limit: 1,
        type: 22 // Member Ban Add
      });
      const entry = auditLogs.entries.first();
      if (entry && entry.target.id === ban.user.id) {
        banner = entry.executor.tag;
        reason = entry.reason || "No reason provided";
      }
    } catch (error) {
      // No permissions for audit logs
    }
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.error)
      .setTitle("User Banned")
      .setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: "User", value: `${ban.user.tag} (${ban.user.id})`, inline: true },
        { name: "Moderator", value: banner, inline: true },
        { name: "Reason", value: reason, inline: false }
      )
      .setFooter({ text: `Ban recorded` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging ban:", error);
  }
}