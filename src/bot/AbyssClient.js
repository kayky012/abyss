const { Client, GatewayIntentBits, Partials, Collection } = require("discord.js");
const config = require("./config/config.js");
const Logger = require("./utils/logger.js");

class AbyssClient extends Client {
  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.GuildEmojisAndStickers
      ],
      partials: [
        Partials.Message,
        Partials.Channel,
        Partials.Reaction,
        Partials.User,
        Partials.GuildMember,
        Partials.ThreadMember,
        Partials.GuildScheduledEvent
      ],
      allowedMentions: {
        parse: ["users", "roles"],
        repliedUser: true
      }
    });

    // Collections
    this.commands = new Collection();
    this.prefixCommands = new Collection();
    this.slashCommands = new Collection();
    this.cooldowns = new Collection();
    
    // Security Collections
    this.antiRaid = new Map();
    this.antiNuke = new Map();
    this.antiSpam = new Map();
    this.messageCache = new Map();
    this.voiceTracker = new Map();
    this.inviteTracker = new Map();
    this.joinTracker = new Map();
    this.actionTracker = new Map();
    
    // Data Collections
    this.guildData = new Map();
    this.userData = new Map();
    this.verificationCache = new Map();
    this.captchaCache = new Map();
    
    // Config
    this.config = config;
    this.logger = Logger;
    
    // Colors (hex values only - no emojis)
    this.colors = {
      primary: 0x6B4EFF,
      secondary: 0x5865F2,
      success: 0x00C853,
      warning: 0xFF4D4D,
      error: 0xED4245,
      info: 0x2196F3
    };
    
    // Console Commands
    this.consoleCommands = null;
    
    // Schemas
    this.schemas = {};
    
    // Startup time
    this.startTime = Date.now();
  }

  async loadHandlers() {
    try {
      const eventHandler = require("./handlers/eventHandler.js");
      await eventHandler(this);
      
      const commandHandler = require("./handlers/commandHandler.js");
      await commandHandler(this);
      
      const antiHandler = require("./handlers/antiHandler.js");
      await antiHandler(this);
      
      const databaseHandler = require("./handlers/databaseHandler.js");
      await databaseHandler(this);
      
      Logger.success("All handlers loaded");
    } catch (error) {
      Logger.error("Error loading handlers:", error);
    }
  }

  async getGuildSettings(guildId) {
    try {
      if (this.guildData.has(guildId)) {
        return this.guildData.get(guildId);
      }
      
      if (this.schemas?.guildSchema) {
        const settings = await this.schemas.guildSchema.findOne({ id: guildId });
        if (settings) {
          this.guildData.set(guildId, settings);
          return settings;
        }
      }
      return null;
    } catch (error) {
      Logger.error(`Error getting guild settings for ${guildId}:`, error);
      return null;
    }
  }

  async getUserData(userId) {
    try {
      if (this.userData.has(userId)) {
        return this.userData.get(userId);
      }
      
      if (this.schemas?.userSchema) {
        const data = await this.schemas.userSchema.findOne({ id: userId });
        if (data) {
          this.userData.set(userId, data);
          return data;
        }
      }
      return null;
    } catch (error) {
      Logger.error(`Error getting user data for ${userId}:`, error);
      return null;
    }
  }

  isOwner(userId) {
    return this.config.ownerIds.includes(userId);
  }

  getUptime() {
    return Date.now() - this.startTime;
  }

  getFormattedUptime() {
    const uptime = this.getUptime();
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours % 24 > 0) parts.push(`${hours % 24}h`);
    if (minutes % 60 > 0) parts.push(`${minutes % 60}m`);
    if (seconds % 60 > 0 || parts.length === 0) parts.push(`${seconds % 60}s`);
    
    return parts.join(" ");
  }

  getBotStats() {
    return {
      guilds: this.guilds.cache.size,
      users: this.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0),
      channels: this.guilds.cache.reduce((acc, g) => acc + g.channels.cache.size, 0),
      commands: {
        slash: this.slashCommands.size,
        prefix: this.prefixCommands.size
      },
      uptime: this.getFormattedUptime(),
      ping: this.ws.ping,
      memory: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
      nodeVersion: process.version,
      discordVersion: require("discord.js").version
    };
  }

  async shutdown() {
    Logger.warn("Shutting down...");
    await this.destroy();
    Logger.success("Shutdown complete");
  }
}

module.exports = { AbyssClient };