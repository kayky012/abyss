const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "roleCreate",
  async execute(role, client) {
    if (!role.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(role.guild.id);
    
    // Anti-nuke check
    if (client.antiNuke && client.config.security?.antiNukeEnabled) {
      await client.antiNuke.handleRoleCreate(role);
    }
    
    // Log role creation
    if (settings?.logging?.enabled && settings.logging.events?.roleCreate) {
      await logRoleCreate(role, client, settings);
    }
  }
};

async function logRoleCreate(role, client, settings) {
  try {
    const logChannel = role.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    // Try to get who created it
    let creator = "Unknown";
    try {
      const auditLogs = await role.guild.fetchAuditLogs({
        limit: 1,
        type: 30 // Role Create
      });
      const entry = auditLogs.entries.first();
      if (entry && entry.target.id === role.id) {
        creator = entry.executor.tag;
      }
    } catch (error) {
      // No permissions for audit logs
    }
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.success)
      .setTitle("Role Created")
      .addFields(
        { name: "Name", value: role.name, inline: true },
        { name: "Color", value: role.hexColor, inline: true },
        { name: "ID", value: `\`${role.id}\``, inline: true },
        { name: "Position", value: role.position.toString(), inline: true },
        { name: "Mentionable", value: role.mentionable ? "Yes" : "No", inline: true },
        { name: "Hoisted", value: role.hoist ? "Yes" : "No", inline: true },
        { name: "Created By", value: creator, inline: true }
      )
      .setFooter({ text: `Role created` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging role creation:", error);
  }
}