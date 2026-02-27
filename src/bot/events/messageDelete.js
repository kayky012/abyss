const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageDelete",
  async execute(message, client) {
    if (!message.guild) return;
    if (message.partial) return;
    
    // Get cached message
    const cached = client.messageCache?.get(message.id);
    
    // Get guild settings
    const settings = await client.getGuildSettings(message.guild.id);
    
    // Log to logging channel if enabled
    if (settings?.logging?.enabled && settings.logging.events?.messageDelete) {
      await logMessageDelete(message, cached, client, settings);
    }
    
    // Update stats
    if (client.schemas?.statsSchema) {
      await client.schemas.statsSchema.findOneAndUpdate(
        { type: "guild", targetId: message.guild.id },
        { $inc: { "moderation.messagesDeleted": 1 } }
      );
    }
    
    // Remove from cache
    client.messageCache?.delete(message.id);
  }
};

async function logMessageDelete(message, cached, client, settings) {
  try {
    const logChannel = message.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.error)
      .setAuthor({
        name: message.author?.tag || "Unknown User",
        iconURL: message.author?.displayAvatarURL({ dynamic: true })
      })
      .setTitle("Message Deleted")
      .addFields(
        { name: "Channel", value: `${message.channel}`, inline: true },
        { name: "Author", value: `${message.author} (${message.author?.id})`, inline: true }
      )
      .setFooter({ text: `Message ID: ${message.id}` })
      .setTimestamp();
    
    if (cached?.content) {
      embed.addFields({ 
        name: "Content", 
        value: cached.content.length > 1024 
          ? cached.content.substring(0, 1021) + "..." 
          : cached.content 
      });
    } else if (message.content) {
      embed.addFields({ 
        name: "Content", 
        value: message.content.length > 1024 
          ? message.content.substring(0, 1021) + "..." 
          : message.content 
      });
    }
    
    if (message.attachments?.size > 0) {
      const attachments = message.attachments.map(a => `[${a.name}](${a.url})`).join("\n");
      embed.addFields({ name: "Attachments", value: attachments });
    }
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging message deletion:", error);
  }
}