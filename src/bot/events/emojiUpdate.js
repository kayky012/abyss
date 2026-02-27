const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "emojiUpdate",
  async execute(oldEmoji, newEmoji, client) {
    if (!oldEmoji.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(oldEmoji.guild.id);
    
    // Log emoji update
    if (settings?.logging?.enabled && settings.logging.events?.emojiUpdate) {
      await logEmojiUpdate(oldEmoji, newEmoji, client, settings);
    }
  }
};

async function logEmojiUpdate(oldEmoji, newEmoji, client, settings) {
  try {
    const logChannel = oldEmoji.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    if (oldEmoji.name === newEmoji.name) return;
    
    // Try to get who updated it
    let updater = "Unknown";
    try {
      const auditLogs = await oldEmoji.guild.fetchAuditLogs({
        limit: 1,
        type: 61 // Emoji Update
      });
      const entry = auditLogs.entries.first();
      if (entry && entry.target.id === newEmoji.id) {
        updater = entry.executor.tag;
      }
    } catch (error) {
      // No permissions for audit logs
    }
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.warning)
      .setTitle("Emoji Updated")
      .setThumbnail(newEmoji.url)
      .addFields(
        { name: "Old Name", value: oldEmoji.name, inline: true },
        { name: "New Name", value: newEmoji.name, inline: true },
        { name: "ID", value: `\`${newEmoji.id}\``, inline: true },
        { name: "Updated By", value: updater, inline: true }
      )
      .setFooter({ text: `Emoji updated` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging emoji update:", error);
  }
}