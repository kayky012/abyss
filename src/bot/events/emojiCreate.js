const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "emojiCreate",
  async execute(emoji, client) {
    if (!emoji.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(emoji.guild.id);
    
    // Log emoji creation
    if (settings?.logging?.enabled && settings.logging.events?.emojiCreate) {
      await logEmojiCreate(emoji, client, settings);
    }
  }
};

async function logEmojiCreate(emoji, client, settings) {
  try {
    const logChannel = emoji.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    // Try to get who created it
    let creator = "Unknown";
    try {
      const auditLogs = await emoji.guild.fetchAuditLogs({
        limit: 1,
        type: 60 // Emoji Create
      });
      const entry = auditLogs.entries.first();
      if (entry && entry.target.id === emoji.id) {
        creator = entry.executor.tag;
      }
    } catch (error) {
      // No permissions for audit logs
    }
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.success)
      .setTitle("Emoji Created")
      .setThumbnail(emoji.url)
      .addFields(
        { name: "Name", value: emoji.name, inline: true },
        { name: "ID", value: `\`${emoji.id}\``, inline: true },
        { name: "Animated", value: emoji.animated ? "Yes" : "No", inline: true },
        { name: "Created By", value: creator, inline: true }
      )
      .setFooter({ text: `Emoji created` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging emoji creation:", error);
  }
}