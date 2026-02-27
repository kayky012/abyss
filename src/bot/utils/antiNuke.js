const Logger = require("./logger.js");

class AntiNuke {
  constructor(client) {
    this.client = client;
    this.channelDeleteTracker = new Map();
    this.roleDeleteTracker = new Map();
    this.banTracker = new Map();
    this.kickTracker = new Map();
    
    this.channelThreshold = client.config.antiNuke.channelDeleteThreshold || 3;
    this.roleThreshold = client.config.antiNuke.roleDeleteThreshold || 3;
    this.banThreshold = client.config.antiNuke.banThreshold || 3;
    this.kickThreshold = client.config.antiNuke.kickThreshold || 3;
    this.timeWindow = client.config.antiNuke.timeWindow || 5000;
  }

  async handleChannelDelete(channel) {
    if (!channel.guild) return;
    
    const guildId = channel.guild.id;
    const executor = await this.getExecutor(channel.guild, "CHANNEL_DELETE");
    
    if (!executor) return;
    
    // Check if executor is whitelisted
    if (await this.isWhitelisted(executor, channel.guild)) return;
    
    await this.trackAction(guildId, "channelDelete", executor, channel);
  }

  async handleChannelCreate(channel) {
    if (!channel.guild) return;
    
    const executor = await this.getExecutor(channel.guild, "CHANNEL_CREATE");
    if (!executor) return;
    
    if (await this.isWhitelisted(executor, channel.guild)) return;
    
    Logger.security("CHANNEL CREATE", executor.id, `Created #${channel.name}`);
  }

  async handleRoleDelete(role) {
    if (!role.guild) return;
    
    const executor = await this.getExecutor(role.guild, "ROLE_DELETE");
    if (!executor) return;
    
    if (await this.isWhitelisted(executor, role.guild)) return;
    
    await this.trackAction(role.guild.id, "roleDelete", executor, role);
  }

  async handleRoleCreate(role) {
    if (!role.guild) return;
    
    const executor = await this.getExecutor(role.guild, "ROLE_CREATE");
    if (!executor) return;
    
    if (await this.isWhitelisted(executor, role.guild)) return;
    
    Logger.security("ROLE CREATE", executor.id, `Created @${role.name}`);
  }

  async handleBanAdd(ban) {
    const executor = await this.getExecutor(ban.guild, "MEMBER_BAN_ADD");
    if (!executor) return;
    
    if (await this.isWhitelisted(executor, ban.guild)) return;
    
    await this.trackAction(ban.guild.id, "ban", executor, ban.user);
  }

  async handleKick(member) {
    const executor = await this.getExecutor(member.guild, "MEMBER_KICK");
    if (!executor) return;
    
    if (await this.isWhitelisted(executor, member.guild)) return;
    
    await this.trackAction(member.guild.id, "kick", executor, member.user);
  }

  async trackAction(guildId, actionType, executor, target) {
    const now = Date.now();
    const tracker = this[`${actionType}Tracker`];
    
    if (!tracker.has(guildId)) {
      tracker.set(guildId, []);
    }
    
    const actions = tracker.get(guildId);
    actions.push({
      executorId: executor.id,
      targetId: target.id,
      timestamp: now
    });
    
    // Clean old actions
    const recent = actions.filter(a => now - a.timestamp < this.timeWindow);
    tracker.set(guildId, recent);
    
    // Check threshold
    const threshold = this[`${actionType}Threshold`];
    if (recent.length >= threshold) {
      await this.handleNuke(guildId, actionType, recent, executor);
    }
  }

  async handleNuke(guildId, actionType, actions, primaryExecutor) {
    try {
      const guild = this.client.guilds.cache.get(guildId);
      if (!guild) return;
      
      Logger.security("NUKE DETECTED", guildId, `${actions.length} ${actionType} actions`, "ban");
      
      // Get guild settings
      const settings = await this.client.getGuildSettings(guildId);
      if (!settings?.antiNuke?.enabled) return;
      
      // Ban the primary executor
      try {
        const member = await guild.members.fetch(primaryExecutor.id).catch(() => null);
        if (member && member.bannable) {
          await member.ban({ reason: "Anti-nuke: Mass destructive actions" });
          Logger.security("NUKE ACTION", guildId, `Banned ${primaryExecutor.tag}`, "ban");
        }
      } catch (error) {
        Logger.error("Error banning nuke executor:", error);
      }
      
      // Lockdown server
      await this.lockdownServer(guild);
      
      // Log to channel
      await this.logNuke(guild, actionType, actions);
      
    } catch (error) {
      Logger.error("Error handling nuke:", error);
    }
  }

  async lockdownServer(guild) {
    try {
      const channels = guild.channels.cache.filter(c => c.type === 0);
      
      for (const channel of channels.values()) {
        await channel.permissionOverwrites.edit(guild.id, {
          SendMessages: false,
          AddReactions: false,
          CreateInstantInvite: false
        }).catch(() => {});
      }
      
      Logger.security("LOCKDOWN", guild.id, "Server locked due to nuke attempt");
    } catch (error) {
      Logger.error("Error locking down server:", error);
    }
  }

  async getExecutor(guild, action) {
    try {
      const auditLogs = await guild.fetchAuditLogs({ limit: 1, type: action });
      return auditLogs.entries.first()?.executor;
    } catch (error) {
      return null;
    }
  }

  async isWhitelisted(user, guild) {
    const settings = await this.client.getGuildSettings(guild.id);
    return settings?.antiNuke?.whitelist?.includes(user.id) || false;
  }

  async logNuke(guild, actionType, actions) {
    const settings = await this.client.getGuildSettings(guild.id);
    const logChannel = settings?.security?.logChannel;
    
    if (logChannel) {
      const channel = guild.channels.cache.get(logChannel);
      if (channel) {
        const userList = actions.map(a => `<@${a.executorId}>`).join(", ");
        await channel.send(`🛡️ **ANTI-NUKE TRIGGERED**\nAction: ${actionType}\nCount: ${actions.length}\nExecutors: ${userList}`);
      }
    }
  }
}

module.exports = AntiNuke;