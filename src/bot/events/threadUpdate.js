const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "threadUpdate",
  async execute(oldThread, newThread, client) {
    if (!oldThread.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(oldThread.guild.id);
    
    // Log thread update
    if (settings?.logging?.enabled && settings.logging.events?.threadUpdate) {
      await logThreadUpdate(oldThread, newThread, client, settings);
    }
  }
};

async function logThreadUpdate(oldThread, newThread, client, settings) {
  try {
    const logChannel = oldThread.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    const changes = [];
    
    if (oldThread.name !== newThread.name) {
      changes.push(`**Name:** ${oldThread.name} → ${newThread.name}`);
    }
    
    if (oldThread.autoArchiveDuration !== newThread.autoArchiveDuration) {
      changes.push(`**Auto Archive:** ${oldThread.autoArchiveDuration}min → ${newThread.autoArchiveDuration}min`);
    }
    
    if (oldThread.archived !== newThread.archived) {
      changes.push(`**Archived:** ${oldThread.archived ? "Yes" : "No"} → ${newThread.archived ? "Yes" : "No"}`);
    }
    
    if (oldThread.locked !== newThread.locked) {
      changes.push(`**Locked:** ${oldThread.locked ? "Yes" : "No"} → ${newThread.locked ? "Yes" : "No"}`);
    }
    
    if (changes.length === 0) return;
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.warning)
      .setTitle("Thread Updated")
      .addFields(
        { name: "Thread", value: newThread.name, inline: true },
        { name: "ID", value: `\`${newThread.id}\``, inline: true },
        { name: "Parent", value: newThread.parent ? `${newThread.parent}` : "None", inline: true },
        { name: "Changes", value: changes.join("\n") }
      )
      .setFooter({ text: `Thread updated` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging thread update:", error);
  }
}