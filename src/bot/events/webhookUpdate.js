const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "webhookUpdate",
  async execute(channel, client) {
    if (!channel.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(channel.guild.id);
    
    // Log webhook update
    if (settings?.logging?.enabled && settings.logging.events?.webhookUpdate) {
      await logWebhookUpdate(channel, client, settings);
    }
    
    // Anti-nuke check for webhook creation (webhooks can be dangerous)
    if (client.antiNuke && client.config.security?.antiNukeEnabled) {
      try {
        const auditLogs = await channel.guild.fetchAuditLogs({
          limit: 1,
          type: 50 // Webhook Create
        });
        const entry = auditLogs.entries.first();
        if (entry && entry.target) {
          await client.antiNuke.handleWebhookCreate(channel, entry.executor);
        }
      } catch (error) {
        // No permissions for audit logs
      }
    }
  }
};

async function logWebhookUpdate(channel, client, settings) {
  try {
    const logChannel = channel.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    // Try to get what happened
    let action = "Updated";
    let executor = "Unknown";
    
    try {
      // Check for webhook create
      let auditLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: 50 // Webhook Create
      });
      let entry = auditLogs.entries.first();
      if (entry && entry.target) {
        action = "Created";
        executor = entry.executor.tag;
      } else {
        // Check for webhook update
        auditLogs = await channel.guild.fetchAuditLogs({
          limit: 1,
          type: 51 // Webhook Update
        });
        entry = auditLogs.entries.first();
        if (entry && entry.target) {
          action = "Updated";
          executor = entry.executor.tag;
        } else {
          // Check for webhook delete
          auditLogs = await channel.guild.fetchAuditLogs({
            limit: 1,
            type: 52 // Webhook Delete
          });
          entry = auditLogs.entries.first();
          if (entry && entry.target) {
            action = "Deleted";
            executor = entry.executor.tag;
          }
        }
      }
    } catch (error) {
      // No permissions for audit logs
    }
    
    const embed = new EmbedBuilder()
      .setColor(action === "Deleted" ? client.colors.error : client.colors.warning)
      .setTitle(`Webhook ${action}`)
      .addFields(
        { name: "Channel", value: `${channel}`, inline: true },
        { name: "Channel ID", value: `\`${channel.id}\``, inline: true },
        { name: "Executor", value: executor, inline: true }
      )
      .setFooter({ text: `Webhook ${action.toLowerCase()}` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging webhook update:", error);
  }
}