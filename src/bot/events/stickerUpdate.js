const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "stickerUpdate",
  async execute(oldSticker, newSticker, client) {
    if (!oldSticker.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(oldSticker.guild.id);
    
    // Log sticker update
    if (settings?.logging?.enabled && settings.logging.events?.stickerUpdate) {
      await logStickerUpdate(oldSticker, newSticker, client, settings);
    }
  }
};

async function logStickerUpdate(oldSticker, newSticker, client, settings) {
  try {
    const logChannel = oldSticker.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    const changes = [];
    
    if (oldSticker.name !== newSticker.name) {
      changes.push(`**Name:** ${oldSticker.name} → ${newSticker.name}`);
    }
    
    if (oldSticker.description !== newSticker.description) {
      changes.push(`**Description:** ${oldSticker.description || "None"} → ${newSticker.description || "None"}`);
    }
    
    if (changes.length === 0) return;
    
    // Try to get who updated it
    let updater = "Unknown";
    try {
      const auditLogs = await oldSticker.guild.fetchAuditLogs({
        limit: 1,
        type: 91 // Sticker Update
      });
      const entry = auditLogs.entries.first();
      if (entry && entry.target.id === newSticker.id) {
        updater = entry.executor.tag;
      }
    } catch (error) {
      // No permissions for audit logs
    }
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.warning)
      .setTitle("Sticker Updated")
      .addFields(
        { name: "Sticker", value: newSticker.name, inline: true },
        { name: "ID", value: `\`${newSticker.id}\``, inline: true },
        { name: "Updated By", value: updater, inline: true },
        { name: "Changes", value: changes.join("\n") }
      )
      .setFooter({ text: `Sticker updated` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging sticker update:", error);
  }
}