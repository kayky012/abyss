class Validator {
  static isURL(string) {
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    return urlPattern.test(string);
  }

  static isDiscordInvite(string) {
    const invitePattern = /(discord\.(gg|com\/invite|me)\/|discordapp\.com\/invite\/)[a-zA-Z0-9]+/gi;
    return invitePattern.test(string);
  }

  static isMention(string) {
    const mentionPattern = /<@!?(\d+)>/g;
    return mentionPattern.test(string);
  }

  static isRoleMention(string) {
    const rolePattern = /<@&(\d+)>/g;
    return rolePattern.test(string);
  }

  static isChannelMention(string) {
    const channelPattern = /<#(\d+)>/g;
    return channelPattern.test(string);
  }

  static isEmoji(string) {
    const emojiPattern = /<a?:[a-zA-Z0-9_]+:\d+>|:[\w]+:/g;
    return emojiPattern.test(string);
  }

  static isID(string) {
    const idPattern = /^\d{17,19}$/;
    return idPattern.test(string);
  }

  static isHexColor(string) {
    const hexPattern = /^#?([0-9A-Fa-f]{6})$/;
    return hexPattern.test(string);
  }

  static isEmail(string) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(string);
  }

  static isIPAddress(string) {
    const ipPattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(string);
  }

  static isSnowflake(string) {
    return /^\d{17,19}$/.test(string);
  }

  static containsScamLinks(string) {
    const scamDomains = [
      "discord-nitro.com", 
      "discord.gift.free", 
      "steamcommunity.com/free",
      "free-nitros.com", 
      "nitro-gift.ru", 
      "discord-airdrop.com",
      "nitro-giveaway.com", 
      "discord.gift.hub", 
      "steam-nitro.com",
      "free-discord.com",
      "discord-nitro.ru"
    ];
    
    const lowerString = string.toLowerCase();
    
    for (const domain of scamDomains) {
      if (lowerString.includes(domain)) {
        return true;
      }
    }
    
    return false;
  }

  static containsExplicit(string) {
    const explicitWords = [
      "nsfw", "porn", "xxx", "sex", "nude", "onlyfans",
      "fuck", "shit", "asshole", "bitch", "cunt", "dick",
      "pussy", "whore", "slut", "bastard"
    ];
    
    const lowerString = string.toLowerCase();
    
    for (const word of explicitWords) {
      if (lowerString.includes(word)) {
        return true;
      }
    }
    
    return false;
  }

  static isSpam(messages, threshold, interval) {
    const now = Date.now();
    const recentMessages = messages.filter(t => now - t < interval);
    return recentMessages.length >= threshold;
  }

  static validatePrefix(prefix) {
    if (!prefix || prefix.length > 3) return false;
    if (prefix.match(/[^a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)) return false;
    return true;
  }

  static validateDuration(duration) {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) return null;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    let ms = 0;
    switch (unit) {
      case 's': ms = value * 1000; break;
      case 'm': ms = value * 60 * 1000; break;
      case 'h': ms = value * 60 * 60 * 1000; break;
      case 'd': ms = value * 24 * 60 * 60 * 1000; break;
    }
    
    return ms;
  }

  static validateCaptcha(input, expected) {
    return input.toUpperCase() === expected.toUpperCase();
  }

  static validateMath(answer, expected) {
    return answer.toString() === expected.toString();
  }

  static validateEmoji(input, expected) {
    return input === expected;
  }

  static sanitizeInput(input) {
    return input
      .replace(/@/g, '@\u200b')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  static extractIDFromMention(mention) {
    const match = mention.match(/<@!?(\d+)>/);
    return match ? match[1] : null;
  }

  static extractChannelID(mention) {
    const match = mention.match(/<#(\d+)>/);
    return match ? match[1] : null;
  }

  static extractRoleID(mention) {
    const match = mention.match(/<@&(\d+)>/);
    return match ? match[1] : null;
  }

  static extractEmojiID(emoji) {
    const match = emoji.match(/<a?:[a-zA-Z0-9_]+:(\d+)>/);
    return match ? match[1] : null;
  }

  static validateTime(timeString) {
    const units = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800
    };

    const match = timeString.match(/^(\d+)([smhdw])$/);
    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2];
    
    return value * units[unit];
  }

  static validateNumber(number, min, max) {
    const num = parseInt(number);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
  }

  static validateHexColor(color) {
    if (color.startsWith('#')) color = color.slice(1);
    return /^[0-9A-Fa-f]{6}$/.test(color);
  }
}

module.exports = Validator;