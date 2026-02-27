const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "stickerCreate",
  async execute(sticker, client) {
    if (!sticker.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(sticker.guild.id);
    
    // Log sticker creation
    if (settings?.logging?.enabled && settings.logging.events?.stickerCreate) {
      await logStickerCreate(sticker, client, settings);
    }
  }
};

async function logStickerCreate(sticker, client, settings) {
  try {
    const logChannel = sticker.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    // Try to get who created it
    let creator = "Unknown";
    try {
      const auditLogs = await sticker.guild.fetchAuditLogs({
        limit: 1,
        type: 90 // Sticker Create
      });
      const entry = auditLogs.entries.first();
      if (entry && entry.target.id === sticker.id) {
        creator = entry.executor.tag;
      }
    } catch (error) {
      // No permissions for audit logs
    }
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.success)
      .setTitle("Sticker Created")
      .addFields(
        { name: "Name", value: sticker.name, inline: true },
        { name: "Description", value: sticker.description || "None", inline: true },
        { name: "ID", value: `\`${sticker.id}\``, inline: true },
        { name: "Format", value: sticker.format, inline: true },
        { name: "Created By", value: creator, inline: true }
      )
      .setFooter({ text: `Sticker created` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging sticker creation:", error);
  }
}