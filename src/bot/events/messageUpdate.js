const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageUpdate",
  async execute(oldMessage, newMessage, client) {
    if (!oldMessage.guild) return;
    if (oldMessage.partial) await oldMessage.fetch().catch(() => {});
    if (newMessage.partial) await newMessage.fetch().catch(() => {});
    
    // Ignore if content is the same
    if (oldMessage.content === newMessage.content) return;
    if (!oldMessage.content || !newMessage.content) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(oldMessage.guild.id);
    
    // Log to logging channel if enabled
    if (settings?.logging?.enabled && settings.logging.events?.messageEdit) {
      await logMessageEdit(oldMessage, newMessage, client, settings);
    }
    
    // Update cache
    if (client.messageCache) {
      client.messageCache.set(newMessage.id, {
        content: newMessage.content,
        authorId: newMessage.author.id,
        authorTag: newMessage.author.tag,
        channelId: newMessage.channel.id,
        timestamp: Date.now()
      });
    }
  }
};

async function logMessageEdit(oldMessage, newMessage, client, settings) {
  try {
    const logChannel = oldMessage.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    // Truncate long messages
    const oldContent = oldMessage.content?.length > 1024 
      ? oldMessage.content.substring(0, 1021) + "..." 
      : oldMessage.content || "No content";
      
    const newContent = newMessage.content?.length > 1024 
      ? newMessage.content.substring(0, 1021) + "..." 
      : newMessage.content || "No content";
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.warning)
      .setAuthor({
        name: oldMessage.author?.tag || "Unknown User",
        iconURL: oldMessage.author?.displayAvatarURL({ dynamic: true })
      })
      .setTitle("Message Edited")
      .addFields(
        { name: "Channel", value: `${oldMessage.channel}`, inline: true },
        { name: "Author", value: `${oldMessage.author} (${oldMessage.author?.id})`, inline: true },
        { name: "Message ID", value: `\`${oldMessage.id}\``, inline: true },
        { name: "Before", value: oldContent },
        { name: "After", value: newContent }
      )
      .setFooter({ text: `Message edited` })
      .setTimestamp();
    
    if (oldMessage.attachments?.size > 0) {
      const attachments = oldMessage.attachments.map(a => `[${a.name}](${a.url})`).join("\n");
      embed.addFields({ name: "Attachments", value: attachments });
    }
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging message edit:", error);
  }
}