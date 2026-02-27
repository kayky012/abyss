const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "stickerDelete",
  async execute(sticker, client) {
    if (!sticker.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(sticker.guild.id);
    
    // Log sticker deletion
    if (settings?.logging?.enabled && settings.logging.events?.stickerDelete) {
      await logStickerDelete(sticker, client, settings);
    }
  }
};

async function logStickerDelete(sticker, client, settings) {
  try {
    const logChannel = sticker.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    // Try to get who deleted it
    let deleter = "Unknown";
    try {
      const auditLogs = await sticker.guild.fetchAuditLogs({
        limit: 1,
        type: 92 // Sticker Delete
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
      .setTitle("Sticker Deleted")
      .addFields(
        { name: "Name", value: sticker.name, inline: true },
        { name: "ID", value: `\`${sticker.id}\``, inline: true },
        { name: "Format", value: sticker.format, inline: true },
        { name: "Deleted By", value: deleter, inline: true }
      )
      .setFooter({ text: `Sticker deleted` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging sticker deletion:", error);
  }
}