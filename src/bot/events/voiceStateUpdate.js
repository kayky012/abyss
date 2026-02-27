const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "voiceStateUpdate",
  async execute(oldState, newState, client) {
    const member = newState.member || oldState.member;
    if (!member) return;
    
    const guild = member.guild;
    
    // Get guild settings
    const settings = await client.getGuildSettings(guild.id);
    
    // Handle auto-reject calls
    if (client.config.security?.antiRaidEnabled && client.antiRaid) {
      await client.antiRaid.handleVoiceState(oldState, newState);
    }
    
    // Log voice events
    if (settings?.logging?.enabled) {
      await logVoiceEvent(oldState, newState, member, client, settings);
    }
    
    // Track voice time for stats
    await trackVoiceTime(oldState, newState, member, client);
  }
};

async function logVoiceEvent(oldState, newState, member, client, settings) {
  try {
    const logChannel = member.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setAuthor({
        name: member.user.tag,
        iconURL: member.user.displayAvatarURL({ dynamic: true })
      })
      .setTimestamp();
    
    // User joined voice
    if (!oldState.channelId && newState.channelId) {
      if (!settings.logging.events?.voiceJoin) return;
      
      embed.setColor(client.colors.success)
        .setTitle("Voice Channel Joined")
        .addFields(
          { name: "User", value: `${member.user} (${member.id})` },
          { name: "Channel", value: `${newState.channel.name}` }
        );
      
      await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
    
    // User left voice
    else if (oldState.channelId && !newState.channelId) {
      if (!settings.logging.events?.voiceLeave) return;
      
      embed.setColor(client.colors.error)
        .setTitle("Voice Channel Left")
        .addFields(
          { name: "User", value: `${member.user} (${member.id})` },
          { name: "Channel", value: `${oldState.channel.name}` }
        );
      
      await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
    
    // User moved voice
    else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
      if (!settings.logging.events?.voiceMove) return;
      
      embed.setColor(client.colors.warning)
        .setTitle("Voice Channel Moved")
        .addFields(
          { name: "User", value: `${member.user} (${member.id})` },
          { name: "From", value: `${oldState.channel.name}` },
          { name: "To", value: `${newState.channel.name}` }
        );
      
      await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
    
    // Mute/Deafen events
    if (oldState.selfMute !== newState.selfMute && settings.logging.events?.voiceMute) {
      const action = newState.selfMute ? "Muted" : "Unmuted";
      embed.setColor(client.colors.warning)
        .setTitle(`Self ${action}`)
        .addFields(
          { name: "User", value: `${member.user} (${member.id})` },
          { name: "Action", value: action }
        );
      
      await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
    
  } catch (error) {
    Logger.error("Error logging voice event:", error);
  }
}

async function trackVoiceTime(oldState, newState, member, client) {
  // User joined voice
  if (!oldState.channelId && newState.channelId) {
    if (!client.voiceTracker) client.voiceTracker = new Map();
    
    client.voiceTracker.set(member.id, {
      joinedAt: Date.now(),
      channelId: newState.channelId,
      guildId: member.guild.id
    });
  }
  
  // User left voice
  else if (oldState.channelId && !newState.channelId) {
    const tracking = client.voiceTracker?.get(member.id);
    if (tracking) {
      const timeSpent = Date.now() - tracking.joinedAt;
      
      // Update stats (for future leveling system)
      if (client.schemas?.userSchema) {
        await client.schemas.userSchema.findOneAndUpdate(
          { id: member.id },
          { $inc: { "stats.voiceTime": timeSpent } }
        );
      }
      
      client.voiceTracker.delete(member.id);
    }
  }
}