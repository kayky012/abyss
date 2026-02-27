const Logger = require("../utils/logger.js");
const { EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "channelCreate",
  async execute(channel, client) {
    if (!channel.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(channel.guild.id);
    
    // Anti-nuke check
    if (client.antiNuke && client.config.security?.antiNukeEnabled) {
      await client.antiNuke.handleChannelCreate(channel);
    }
    
    // Log channel creation
    if (settings?.logging?.enabled && settings.logging.events?.channelCreate) {
      await logChannelCreate(channel, client, settings);
    }
  }
};

async function logChannelCreate(channel, client, settings) {
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
    
    // Try to get who created it
    let creator = "Unknown";
    try {
      const auditLogs = await channel.guild.fetchAuditLogs({
        limit: 1,
        type: 10 // Channel Create
      });
      const entry = auditLogs.entries.first();
      if (entry && entry.target.id === channel.id) {
        creator = entry.executor.tag;
      }
    } catch (error) {
      // No permissions for audit logs
    }
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.success)
      .setTitle("Channel Created")
      .addFields(
        { name: "Name", value: channel.name, inline: true },
        { name: "Type", value: channelType, inline: true },
        { name: "ID", value: `\`${channel.id}\``, inline: true },
        { name: "Category", value: channel.parent ? channel.parent.name : "None", inline: true },
        { name: "Created By", value: creator, inline: true }
      )
      .setFooter({ text: `Channel created` })
      .setTimestamp();
    
    if (channel.type === ChannelType.GuildText) {
      embed.addFields({ name: "NSFW", value: channel.nsfw ? "Yes" : "No", inline: true });
    }
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging channel creation:", error);
  }
}