const Logger = require("./logger.js");

class AntiSpam {
  constructor(client) {
    this.client = client;
    this.messageTracker = new Map();
    this.mentionTracker = new Map();
    this.emojiTracker = new Map();
    this.duplicateTracker = new Map();
    
    this.messageThreshold = client.config.antiSpam.messageThreshold || 5;
    this.messageInterval = client.config.antiSpam.messageInterval || 3000;
    this.mentionThreshold = client.config.antiSpam.mentionThreshold || 3;
    this.emojiThreshold = client.config.antiSpam.emojiThreshold || 10;
    this.action = client.config.antiSpam.action || "mute";
    this.muteDuration = client.config.antiSpam.muteDuration || 60000;
  }

  async handleMessage(message) {
    const userId = message.author.id;
    const guildId = message.guild?.id;
    
    if (!guildId) return;
    
    // Check if user is whitelisted
    if (await this.isWhitelisted(userId, message.guild)) return;
    
    // Track messages
    const spamCheck = await this.checkMessageSpam(userId, guildId, message);
    if (spamCheck) return;
    
    // Track mentions
    const mentionCheck = await this.checkMentionSpam(message);
    if (mentionCheck) return;
    
    // Track emojis
    const emojiCheck = await this.checkEmojiSpam(message);
    if (emojiCheck) return;
    
    // Track duplicates
    const duplicateCheck = await this.checkDuplicateSpam(message);
    if (duplicateCheck) return;
  }

  async checkMessageSpam(userId, guildId, message) {
    const now = Date.now();
    const key = `${guildId}-${userId}`;
    
    if (!this.messageTracker.has(key)) {
      this.messageTracker.set(key, []);
    }
    
    const messages = this.messageTracker.get(key);
    messages.push({
      content: message.content,
      timestamp: now
    });
    
    // Clean old messages
    const recent = messages.filter(m => now - m.timestamp < this.messageInterval);
    this.messageTracker.set(key, recent);
    
    if (recent.length >= this.messageThreshold) {
      await this.handleSpam(message, "message", recent.length);
      return true;
    }
    
    return false;
  }

  async checkMentionSpam(message) {
    if (message.mentions.users.size === 0) return false;
    
    const userId = message.author.id;
    const now = Date.now();
    
    if (!this.mentionTracker.has(userId)) {
      this.mentionTracker.set(userId, []);
    }
    
    const mentions = this.mentionTracker.get(userId);
    mentions.push({
      count: message.mentions.users.size,
      timestamp: now
    });
    
    // Clean old mentions
    const recent = mentions.filter(m => now - m.timestamp < 10000);
    this.mentionTracker.set(userId, recent);
    
    const totalMentions = recent.reduce((acc, m) => acc + m.count, 0);
    
    if (totalMentions >= this.mentionThreshold) {
      await this.handleSpam(message, "mention", totalMentions);
      return true;
    }
    
    return false;
  }

  async checkEmojiSpam(message) {
    const emojiRegex = /<a?:[a-zA-Z0-9_]+:\d+>|:[\w]+:/g;
    const emojis = message.content.match(emojiRegex) || [];
    
    if (emojis.length === 0) return false;
    
    const userId = message.author.id;
    const now = Date.now();
    
    if (!this.emojiTracker.has(userId)) {
      this.emojiTracker.set(userId, []);
    }
    
    const emojiCounts = this.emojiTracker.get(userId);
    emojiCounts.push({
      count: emojis.length,
      timestamp: now
    });
    
    // Clean old emoji usage
    const recent = emojiCounts.filter(e => now - e.timestamp < 10000);
    this.emojiTracker.set(userId, recent);
    
    const totalEmojis = recent.reduce((acc, e) => acc + e.count, 0);
    
    if (totalEmojis >= this.emojiThreshold) {
      await this.handleSpam(message, "emoji", totalEmojis);
      return true;
    }
    
    return false;
  }

  async checkDuplicateSpam(message) {
    if (!message.content || message.content.length < 5) return false;
    
    const userId = message.author.id;
    const content = message.content.toLowerCase();
    const now = Date.now();
    
    if (!this.duplicateTracker.has(userId)) {
      this.duplicateTracker.set(userId, []);
    }
    
    const messages = this.duplicateTracker.get(userId);
    messages.push({
      content,
      timestamp: now
    });
    
    // Clean old messages
    const recent = messages.filter(m => now - m.timestamp < 10000);
    this.duplicateTracker.set(userId, recent);
    
    // Check for duplicates
    const duplicates = recent.filter(m => m.content === content);
    
    if (duplicates.length >= 3) {
      await this.handleSpam(message, "duplicate", duplicates.length);
      return true;
    }
    
    return false;
  }

  async handleSpam(message, type, count) {
    try {
      Logger.security("SPAM", message.author.id, `${type} spam: ${count}`, this.action);
      
      // Delete the message
      await message.delete().catch(() => {});
      
      // Apply punishment
      await this.applyPunishment(message.member, type);
      
      // Send warning
      const warning = await message.channel.send(`⚠️ ${message.author}, please do not spam.`).catch(() => {});
      setTimeout(() => warning?.delete().catch(() => {}), 3000);
      
    } catch (error) {
      Logger.error("Error handling spam:", error);
    }
  }

  async applyPunishment(member, type) {
    try {
      switch (this.action) {
        case "warn":
          await this.warnUser(member, type);
          break;
        case "mute":
          await member.timeout(this.muteDuration, `Spam: ${type}`).catch(() => {});
          break;
        case "kick":
          if (member.kickable) {
            await member.kick(`Spam: ${type}`).catch(() => {});
          }
          break;
      }
    } catch (error) {
      Logger.error("Error applying punishment:", error);
    }
  }

  async warnUser(member, type) {
    try {
      const settings = await this.client.getGuildSettings(member.guild.id);
      if (!settings) return;
      
      // Track warnings (would need warn schema implementation)
      Logger.security("WARN", member.id, `Spam warning: ${type}`);
      
      // Check if should auto-punish
      // This would check warning count from database
      
    } catch (error) {
      Logger.error("Error warning user:", error);
    }
  }

  async isWhitelisted(userId, guild) {
    const settings = await this.client.getGuildSettings(guild.id);
    return settings?.antiSpam?.whitelist?.includes(userId) || false;
  }
}

module.exports = AntiSpam;