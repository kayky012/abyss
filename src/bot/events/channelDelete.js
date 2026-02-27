const Logger = require("../utils/logger.js");
const { EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "channelDelete",
  async execute(channel, client) {
    if (!channel.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(channel.guild.id);
    
    // Anti-nuke check
    if (client.antiNuke && client.config.security?.antiNukeEnabled) {
      await client.antiNuke.handleChannelDelete(channel);
    }
    
    // Log channel deletion
    if (settings?.logging?.enabled && settings.logging.events?.channelDelete) {
      await logChannelDelete(channel, client, settings);
    }
  }
};

async function logChannelDelete(channel, client, settings) {
  try {
    const logChannel = channel.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    const channelType = {
      [ChannelType.GuildText]: "Text Channel",
      [ChannelType.GuildVoice]: "Voice Channel",
      [ChannelType.GuildCategory]: "Category",
      [ChannelType.GuildAnnouncement]: "Announcement Channel",
      [ChannelType.AnnouncementThread]: "Announcement Thread",
      [ChannelType.PublicThread]: "Public Thread",
      [ChannelType.PrivateThread]: "Private Thread",
      [ChannelType.GuildStageVoice]: "Stage Channel",
      [ChannelType.GuildForum]: "Forum"
    }[channel.type] || "Unknown";
    
    // Try to get who deleted it
    let deleter = "Unknown";
    try {
      const auditLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: 12 // Channel Delete
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
      .setTitle("Channel Deleted")
      .addFields(
        { name: "Name", value: channel.name, inline: true },
        { name: "Type", value: channelType, inline: true },
        { name: "ID", value: `\`${channel.id}\``, inline: true },
        { name: "Category", value: channel.parent ? channel.parent.name : "None", inline: true },
        { name: "Deleted By", value: deleter, inline: true }
      )
      .setFooter({ text: `Channel deleted` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
    // Update stats
    if (client.schemas?.statsSchema) {
      await client.schemas.statsSchema.findOneAndUpdate(
        { type: "guild", targetId: channel.guild.id },
        { $inc: { "moderation.channelsDeleted": 1 } }
      );
    }
    
  } catch (error) {
    Logger.error("Error logging channel deletion:", error);
  }
}