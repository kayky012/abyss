const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "roleDelete",
  async execute(role, client) {
    if (!role.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(role.guild.id);
    
    // Anti-nuke check
    if (client.antiNuke && client.config.security?.antiNukeEnabled) {
      await client.antiNuke.handleRoleDelete(role);
    }
    
    // Log role deletion
    if (settings?.logging?.enabled && settings.logging.events?.roleDelete) {
      await logRoleDelete(role, client, settings);
    }
  }
};

async function logRoleDelete(role, client, settings) {
  try {
    const logChannel = role.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    // Try to get who deleted it
    let deleter = "Unknown";
    try {
      const auditLogs = await role.guild.fetchAuditLogs({
        limit: 1,
        type: 32 // Role Delete
      });
      const entry = auditLogs.entries.first();
      if (entry) {
        deleter = entry.executor.tag;
      }
    } catch (error) {
      // No permissions for audit logs
    }
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.error)
      .setTitle("Role Deleted")
      .addFields(
        { name: "Name", value: role.name, inline: true },
        { name: "Color", value: role.hexColor, inline: true },
        { name: "ID", value: `\`${role.id}\``, inline: true },
        { name: "Position", value: role.position.toString(), inline: true },
        { name: "Deleted By", value: deleter, inline: true }
      )
      .setFooter({ text: `Role deleted` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
    // Update stats
    if (client.schemas?.statsSchema) {
      await client.schemas.statsSchema.findOneAndUpdate(
        { type: "guild", targetId: role.guild.id },
        { $inc: { "moderation.rolesDeleted": 1 } }
      );
    }
    
  } catch (error) {
    Logger.error("Error logging role deletion:", error);
  }
}