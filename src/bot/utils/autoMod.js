const Logger = require("./logger.js");

class AutoMod {
  constructor(client) {
    this.client = client;
    this.inviteRegex = /(discord\.(gg|com\/invite|me)\/|discordapp\.com\/invite\/)[a-zA-Z0-9]+/gi;
    this.urlRegex = /(https?:\/\/[^\s]+)/g;
    this.capsRegex = /[A-Z]/g;
  }

  async checkMessage(message) {
    if (!message.guild) return;
    if (message.author.bot) return;
    
    const settings = await this.client.getGuildSettings(message.guild.id);
    if (!settings?.autoMod) return;
    
    const checks = [
      this.checkInvites(message, settings),
      this.checkLinks(message, settings),
      this.checkCaps(message, settings),
      this.checkBadWords(message, settings),
      this.checkSpam(message, settings),
      this.checkMentions(message, settings),
      this.checkEmojis(message, settings)
    ];
    
    const results = await Promise.all(checks);
    const violations = results.filter(r => r !== null);
    
    if (violations.length > 0) {
      await this.handleViolations(message, violations, settings);
    }
  }

  async checkInvites(message, settings) {
    if (!settings.autoMod.invites) return null;
    
    const content = message.content;
    const invites = content.match(this.inviteRegex);
    
    if (invites) {
      // Check whitelist
      const whitelist = settings.autoMod.whitelistedInvites || [];
      for (const invite of invites) {
        if (!whitelist.some(w => invite.includes(w))) {
          return { type: "invite", content: invite };
        }
      }
    }
    return null;
  }

  async checkLinks(message, settings) {
    if (!settings.autoMod.links) return null;
    
    const content = message.content;
    const links = content.match(this.urlRegex);
    
    if (links) {
      const whitelist = settings.autoMod.whitelistedLinks || [];
      for (const link of links) {
        if (!whitelist.some(w => link.includes(w))) {
          return { type: "link", content: link };
        }
      }
    }
    return null;
  }

  async checkCaps(message, settings) {
    if (!settings.autoMod.caps) return null;
    if (message.content.length < (settings.autoMod.capsMinLength || 10)) return null;
    
    const capsCount = (message.content.match(this.capsRegex) || []).length;
    const capsPercentage = (capsCount / message.content.length) * 100;
    
    if (capsPercentage > (settings.autoMod.capsThreshold || 70)) {
      return { type: "caps", percentage: capsPercentage };
    }
    return null;
  }

  async checkBadWords(message, settings) {
    if (!settings.autoMod.badWords) return null;
    
    const badWords = settings.autoMod.badWordsList || [];
    const content = message.content.toLowerCase();
    
    for (const word of badWords) {
      if (content.includes(word.toLowerCase())) {
        return { type: "badword", word };
      }
    }
    return null;
  }

  async checkSpam(message, settings) {
    if (!settings.autoMod.spam) return null;
    return this.client.antiSpam?.checkMessageSpam(message.author.id, message.guild.id, message) ? { type: "spam" } : null;
  }

  async checkMentions(message, settings) {
    if (!settings.autoMod.mentions) return null;
    
    const mentionCount = message.mentions.users.size + message.mentions.roles.size;
    if (mentionCount > (settings.autoMod.maxMentions || 5)) {
      return { type: "mentions", count: mentionCount };
    }
    return null;
  }

  async checkEmojis(message, settings) {
    if (!settings.autoMod.emojis) return null;
    
    const emojiRegex = /<a?:[a-zA-Z0-9_]+:\d+>|:[\w]+:/g;
    const emojis = message.content.match(emojiRegex) || [];
    
    if (emojis.length > (settings.autoMod.maxEmojis || 10)) {
      return { type: "emojis", count: emojis.length };
    }
    return null;
  }

  async handleViolations(message, violations, settings) {
    try {
      // Delete message
      await message.delete().catch(() => {});
      
      // Log violation
      Logger.security("AUTOMOD", message.author.id, violations.map(v => v.type).join(", "), "delete");
      
      // Send warning
      const warningMsg = this.getWarningMessage(violations);
      const warning = await message.channel.send(`⚠️ ${message.author}, ${warningMsg}`).catch(() => {});
      setTimeout(() => warning?.delete().catch(() => {}), 5000);
      
      // Track violations
      await this.trackViolation(message.author, message.guild, violations, settings);
      
      // Log to channel
      await this.logViolation(message, violations, settings);
      
    } catch (error) {
      Logger.error("Error handling automod violations:", error);
    }
  }

  getWarningMessage(violations) {
    const messages = {
      invite: "sending invite links is not allowed.",
      link: "sending links is not allowed.",
      caps: "excessive caps are not allowed.",
      badword: "inappropriate language is not allowed.",
      spam: "spamming is not allowed.",
      mentions: "mass mentions are not allowed.",
      emojis: "excessive emojis are not allowed."
    };
    
    const types = violations.map(v => messages[v.type] || v.type);
    return types.join(" Also, ");
  }

  async trackViolation(user, guild, violations, settings) {
    try {
      const userData = await this.client.getUserData(user.id);
      if (!userData) return;
      
      if (!userData.warnings) userData.warnings = [];
      
      for (const violation of violations) {
        userData.warnings.push({
          type: violation.type,
          reason: violation.content || violation.word || "AutoMod violation",
          moderatorId: this.client.user.id,
          timestamp: new Date()
        });
      }
      
      await userData.save();
      
      // Check if should auto-punish
      if (settings.autoMod.autoPunish && userData.warnings.length >= (settings.security?.maxWarns || 3)) {
        await this.autoPunish(guild, user, settings);
      }
      
    } catch (error) {
      Logger.error("Error tracking violation:", error);
    }
  }

  async autoPunish(guild, user, settings) {
    try {
      const member = await guild.members.fetch(user.id).catch(() => null);
      if (!member) return;
      
      const action = settings.security?.punishAction || "mute";
      
      switch (action) {
        case "mute":
          await member.timeout(3600000, "AutoMod: Max warnings reached").catch(() => {});
          Logger.security("AUTOPUNISH", user.id, "Auto-muted", "mute");
          break;
        case "kick":
          await member.kick("AutoMod: Max warnings reached").catch(() => {});
          Logger.security("AUTOPUNISH", user.id, "Auto-kicked", "kick");
          break;
        case "ban":
          await member.ban({ reason: "AutoMod: Max warnings reached" }).catch(() => {});
          Logger.security("AUTOPUNISH", user.id, "Auto-banned", "ban");
          break;
      }
      
    } catch (error) {
      Logger.error("Error auto-punishing user:", error);
    }
  }

  async logViolation(message, violations, settings) {
    const logChannelId = settings.security?.logChannel;
    if (!logChannelId) return;
    
    const channel = message.guild.channels.cache.get(logChannelId);
    if (!channel) return;
    
    const logMsg = [
      `**AUTOMOD VIOLATION**`,
      `User: ${message.author.tag} (${message.author.id})`,
      `Channel: ${message.channel}`,
      `Violations: ${violations.map(v => v.type).join(", ")}`,
      `Content: ${message.content.substring(0, 500)}`
    ].join("\n");
    
    await channel.send(`\`\`\`${logMsg}\`\`\``).catch(() => {});
  }
}

module.exports = AutoMod;