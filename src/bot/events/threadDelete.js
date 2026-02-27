const Logger = require("../utils/logger.js");
const { EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "threadDelete",
  async execute(thread, client) {
    if (!thread.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(thread.guild.id);
    
    // Log thread deletion
    if (settings?.logging?.enabled && settings.logging.events?.threadDelete) {
      await logThreadDelete(thread, client, settings);
    }
  }
};

async function logThreadDelete(thread, client, settings) {
  try {
    const logChannel = thread.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    const threadType = thread.type === ChannelType.PublicThread ? "Public" :
                      thread.type === ChannelType.PrivateThread ? "Private" :
                      thread.type === ChannelType.AnnouncementThread ? "Announcement" : "Unknown";
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.error)
      .setTitle("Thread Deleted")
      .addFields(
        { name: "Name", value: thread.name, inline: true },
        { name: "Type", value: threadType, inline: true },
        { name: "ID", value: `\`${thread.id}\``, inline: true },
        { name: "Parent Channel", value: thread.parent ? `${thread.parent}` : "None", inline: true }
      )
      .setFooter({ text: `Thread deleted` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging thread deletion:", error);
  }
}