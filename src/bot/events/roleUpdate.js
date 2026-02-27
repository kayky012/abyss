const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "roleUpdate",
  async execute(oldRole, newRole, client) {
    if (!oldRole.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(oldRole.guild.id);
    
    // Log role update
    if (settings?.logging?.enabled && settings.logging.events?.roleUpdate) {
      await logRoleUpdate(oldRole, newRole, client, settings);
    }
  }
};

async function logRoleUpdate(oldRole, newRole, client, settings) {
  try {
    const logChannel = oldRole.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    const changes = [];
    
    if (oldRole.name !== newRole.name) {
      changes.push(`**Name:** ${oldRole.name} → ${newRole.name}`);
    }
    
    if (oldRole.hexColor !== newRole.hexColor) {
      changes.push(`**Color:** ${oldRole.hexColor} → ${newRole.hexColor}`);
    }
    
    if (oldRole.mentionable !== newRole.mentionable) {
      changes.push(`**Mentionable:** ${oldRole.mentionable ? "Yes" : "No"} → ${newRole.mentionable ? "Yes" : "No"}`);
    }
    
    if (oldRole.hoist !== newRole.hoist) {
      changes.push(`**Hoisted:** ${oldRole.hoist ? "Yes" : "No"} → ${newRole.hoist ? "Yes" : "No"}`);
    }
    
    if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
      changes.push(`**Permissions:** Modified`);
    }
    
    if (changes.length === 0) return;
    
    // Try to get who updated it
    let updater = "Unknown";
    try {
      const auditLogs = await oldRole.guild.fetchAuditLogs({
        limit: 1,
        type: 31 // Role Update
      });
      const entry = auditLogs.entries.first();
      if (entry && entry.target.id === newRole.id) {
        updater = entry.executor.tag;
      }
    } catch (error) {
      // No permissions for audit logs
    }
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.warning)
      .setTitle("Role Updated")
      .addFields(
        { name: "Role", value: newRole.name, inline: true },
        { name: "ID", value: `\`${newRole.id}\``, inline: true },
        { name: "Updated By", value: updater, inline: true },
        { name: "Changes", value: changes.join("\n") }
      )
      .setFooter({ text: `Role updated` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging role update:", error);
  }
}