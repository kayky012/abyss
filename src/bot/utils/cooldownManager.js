const { Collection } = require("discord.js");

class CooldownManager {
  constructor() {
    this.cooldowns = new Collection();
  }

  set(userId, commandName, time) {
    const key = `${userId}-${commandName}`;
    const expires = Date.now() + time;
    
    this.cooldowns.set(key, expires);
    
    setTimeout(() => {
      this.cooldowns.delete(key);
    }, time);
    
    return expires;
  }

  get(userId, commandName) {
    const key = `${userId}-${commandName}`;
    return this.cooldowns.get(key) || null;
  }

  has(userId, commandName) {
    const key = `${userId}-${commandName}`;
    const expires = this.cooldowns.get(key);
    
    if (!expires) return false;
    if (Date.now() > expires) {
      this.cooldowns.delete(key);
      return false;
    }
    
    return true;
  }

  getRemaining(userId, commandName) {
    const key = `${userId}-${commandName}`;
    const expires = this.cooldowns.get(key);
    
    if (!expires) return 0;
    
    const remaining = expires - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  getFormattedRemaining(userId, commandName) {
    const remaining = this.getRemaining(userId, commandName);
    return this.formatTime(remaining);
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  clear(userId, commandName) {
    const key = `${userId}-${commandName}`;
    return this.cooldowns.delete(key);
  }

  clearAll(userId) {
    const keys = [...this.cooldowns.keys()].filter(key => key.startsWith(`${userId}-`));
    keys.forEach(key => this.cooldowns.delete(key));
    return keys.length;
  }

  clearGuild(guildId) {
    const keys = [...this.cooldowns.keys()].filter(key => key.includes(guildId));
    keys.forEach(key => this.cooldowns.delete(key));
    return keys.length;
  }

  getStats() {
    return {
      total: this.cooldowns.size,
      active: [...this.cooldowns.values()].filter(time => time > Date.now()).length,
      expired: [...this.cooldowns.values()].filter(time => time <= Date.now()).length
    };
  }

  addGlobalCooldown(userId, time) {
    return this.set(userId, "global", time);
  }

  hasGlobalCooldown(userId) {
    return this.has(userId, "global");
  }

  getGlobalRemaining(userId) {
    return this.getRemaining(userId, "global");
  }
}

module.exports = CooldownManager;