const Logger = require("../utils/logger.js");
const { EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "threadCreate",
  async execute(thread, newlyCreated, client) {
    if (!thread.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(thread.guild.id);
    
    // Log thread creation
    if (settings?.logging?.enabled && settings.logging.events?.threadCreate) {
      await logThreadCreate(thread, newlyCreated, client, settings);
    }
    
    // Auto-join threads if configured
    if (settings?.logging?.autoJoinThreads) {
      try {
        await thread.join();
      } catch (error) {
        Logger.error("Error joining thread:", error);
      }
    }
  }
};

async function logThreadCreate(thread, newlyCreated, client, settings) {
  try {
    const logChannel = thread.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    const threadType = thread.type === ChannelType.PublicThread ? "Public" :
                      thread.type === ChannelType.PrivateThread ? "Private" :
                      thread.type === ChannelType.AnnouncementThread ? "Announcement" : "Unknown";
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.success)
      .setTitle(newlyCreated ? "Thread Created" : "Thread Archived")
      .addFields(
        { name: "Name", value: thread.name, inline: true },
        { name: "Type", value: threadType, inline: true },
        { name: "ID", value: `\`${thread.id}\``, inline: true },
        { name: "Parent Channel", value: thread.parent ? `${thread.parent}` : "None", inline: true },
        { name: "Owner", value: thread.ownerId ? `<@${thread.ownerId}>` : "Unknown", inline: true },
        { name: "Auto Archive", value: `${thread.autoArchiveDuration} minutes`, inline: true }
      )
      .setFooter({ text: newlyCreated ? "Thread created" : "Thread archived" })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging thread creation:", error);
  }
}