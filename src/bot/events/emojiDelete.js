const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "emojiDelete",
  async execute(emoji, client) {
    if (!emoji.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(emoji.guild.id);
    
    // Log emoji deletion
    if (settings?.logging?.enabled && settings.logging.events?.emojiDelete) {
      await logEmojiDelete(emoji, client, settings);
    }
  }
};

async function logEmojiDelete(emoji, client, settings) {
  try {
    const logChannel = emoji.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    // Try to get who deleted it
    let deleter = "Unknown";
    try {
      const auditLogs = await emoji.guild.fetchAuditLogs({
        limit: 1,
        type: 62 // Emoji Delete
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
      .setTitle("Emoji Deleted")
      .addFields(
        { name: "Name", value: emoji.name, inline: true },
        { name: "ID", value: `\`${emoji.id}\``, inline: true },
        { name: "Animated", value: emoji.animated ? "Yes" : "No", inline: true },
        { name: "Deleted By", value: deleter, inline: true }
      )
      .setFooter({ text: `Emoji deleted` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging emoji deletion:", error);
  }
}