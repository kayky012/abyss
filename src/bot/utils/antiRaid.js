const Logger = require("./logger.js");

class AntiRaid {
  constructor(client) {
    this.client = client;
    this.joinTracker = new Map();
    this.actionTracker = new Map();
    this.joinThreshold = client.config.antiRaid.joinThreshold || 5;
    this.joinInterval = client.config.antiRaid.joinInterval || 10000;
    this.action = client.config.antiRaid.action || "lockdown";
  }

  async handleJoin(member) {
    const guildId = member.guild.id;
    const now = Date.now();
    
    // Initialize tracker for guild
    if (!this.joinTracker.has(guildId)) {
      this.joinTracker.set(guildId, []);
    }
    
    // Track join
    const joins = this.joinTracker.get(guildId);
    joins.push({
      userId: member.id,
      timestamp: now
    });
    
    // Clean old joins
    const recentJoins = joins.filter(j => now - j.timestamp < this.joinInterval);
    this.joinTracker.set(guildId, recentJoins);
    
    // Check if raid detected
    if (recentJoins.length >= this.joinThreshold) {
      await this.handleRaid(member.guild, recentJoins);
    }
  }

  async handleRaid(guild, joins) {
    try {
      Logger.security("RAID", guild.id, `Mass join detected: ${joins.length} joins`, this.action);
      
      // Get guild settings
      const settings = await this.client.getGuildSettings(guild.id);
      if (!settings?.antiRaid?.enabled) return;
      
      // Execute action based on settings
      switch (this.action) {
        case "lockdown":
          await this.lockdownGuild(guild);
          break;
        case "kick":
          await this.kickRecentJoins(guild, joins);
          break;
        case "ban":
          await this.banRecentJoins(guild, joins);
          break;
        case "notify":
          await this.notifyAdmins(guild, joins);
          break;
      }
      
      // Log to channel
      await this.logRaid(guild, joins);
      
    } catch (error) {
      Logger.error("Error handling raid:", error);
    }
  }

  async lockdownGuild(guild) {
    try {
      const channels = guild.channels.cache.filter(c => c.type === 0);
      
      for (const channel of channels.values()) {
        await channel.permissionOverwrites.edit(guild.id, {
          SendMessages: false
        }).catch(() => {});
      }
      
      Logger.security("LOCKDOWN", guild.id, "Server locked due to raid");
    } catch (error) {
      Logger.error("Error locking down guild:", error);
    }
  }

  async kickRecentJoins(guild, joins) {
    for (const join of joins) {
      try {
        const member = await guild.members.fetch(join.userId).catch(() => null);
        if (member) {
          await member.kick("Anti-raid: Mass join detected");
        }
      } catch (error) {
        Logger.error(`Error kicking user ${join.userId}:`, error);
      }
    }
  }

  async banRecentJoins(guild, joins) {
    for (const join of joins) {
      try {
        const member = await guild.members.fetch(join.userId).catch(() => null);
        if (member) {
          await member.ban({ reason: "Anti-raid: Mass join detected" });
        }
      } catch (error) {
        Logger.error(`Error banning user ${join.userId}:`, error);
      }
    }
  }

  async notifyAdmins(guild, joins) {
    const settings = await this.client.getGuildSettings(guild.id);
    const logChannel = settings?.security?.logChannel;
    
    if (logChannel) {
      const channel = guild.channels.cache.get(logChannel);
      if (channel) {
        await channel.send(`⚠️ **RAID DETECTED**\n${joins.length} joins in ${this.joinInterval/1000} seconds`);
      }
    }
  }

  async logRaid(guild, joins) {
    const settings = await this.client.getGuildSettings(guild.id);
    const logChannel = settings?.security?.logChannel;
    
    if (logChannel) {
      const channel = guild.channels.cache.get(logChannel);
      if (channel) {
        const userList = joins.map(j => `<@${j.userId}>`).join(", ");
        await channel.send(`🛡️ **Anti-Raid Action**\nAction: ${this.action}\nUsers: ${userList}`);
      }
    }
  }

  async handleAction(action, member) {
    const guildId = member.guild.id;
    const now = Date.now();
    
    if (!this.actionTracker.has(guildId)) {
      this.actionTracker.set(guildId, new Map());
    }
    
    const actions = this.actionTracker.get(guildId);
    if (!actions.has(action)) {
      actions.set(action, []);
    }
    
    const timestamps = actions.get(action);
    timestamps.push(now);
    
    const recent = timestamps.filter(t => now - t < 5000);
    actions.set(action, recent);
    
    if (recent.length >= 3) {
      await this.handleRapidAction(member.guild, action, recent.length);
    }
  }

  async handleRapidAction(guild, action, count) {
    Logger.security("RAPID ACTION", guild.id, `${count} ${action} actions detected`, "warn");
    
    const settings = await this.client.getGuildSettings(guild.id);
    const logChannel = settings?.security?.logChannel;
    
    if (logChannel) {
      const channel = guild.channels.cache.get(logChannel);
      if (channel) {
        await channel.send(`⚠️ **RAPID ACTIONS DETECTED**\n${count} ${action} actions in 5 seconds`);
      }
    }
  }
}

module.exports = AntiRaid;