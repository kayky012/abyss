const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

module.exports = {
  // Bot Configuration
  token: process.env.TOKEN || "",
  clientId: process.env.CLIENT_ID || "",
  prefix: process.env.PREFIX || "!",
  embedColor: process.env.EMBED_COLOR || "6B4EFF",
  ownerIds: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(",").map(id => id.trim()) : [],
  
  // Database
  mongoUri: process.env.MONGO_URI || "",
  
  // Bot Status
  status: process.env.STATUS || "dnd",
  activity: process.env.ACTIVITY || "Securing Communities",
  
  // Security Settings
  security: {
    antiRaidEnabled: process.env.ANTI_RAID_ENABLED === "true",
    antiNukeEnabled: process.env.ANTI_NUKE_ENABLED === "true",
    antiSpamEnabled: process.env.ANTI_SPAM_ENABLED === "true",
    autoModEnabled: process.env.AUTO_MOD_ENABLED === "true",
    logChannel: process.env.LOG_CHANNEL || "logs",
    maxWarns: parseInt(process.env.MAX_WARNS) || 3,
    punishAction: process.env.PUNISH_ACTION || "mute"
  },
  
  // Anti-Raid Settings
  antiRaid: {
    joinThreshold: parseInt(process.env.RAID_JOIN_THRESHOLD) || 5,
    joinInterval: parseInt(process.env.RAID_JOIN_INTERVAL) || 10000,
    action: process.env.RAID_ACTION || "lockdown"
  },
  
  // Anti-Nuke Settings
  antiNuke: {
    channelDeleteThreshold: parseInt(process.env.NUKE_CHANNEL_DELETE_THRESHOLD) || 3,
    roleDeleteThreshold: parseInt(process.env.NUKE_ROLE_DELETE_THRESHOLD) || 3,
    banThreshold: parseInt(process.env.NUKE_BAN_THRESHOLD) || 3,
    kickThreshold: parseInt(process.env.NUKE_KICK_THRESHOLD) || 3,
    timeWindow: parseInt(process.env.NUKE_TIME_WINDOW) || 5000,
    action: process.env.NUKE_ACTION || "ban"
  },
  
  // Anti-Spam Settings
  antiSpam: {
    messageThreshold: parseInt(process.env.SPAM_MESSAGE_THRESHOLD) || 5,
    messageInterval: parseInt(process.env.SPAM_MESSAGE_INTERVAL) || 3000,
    mentionThreshold: parseInt(process.env.SPAM_MENTION_THRESHOLD) || 3,
    emojiThreshold: parseInt(process.env.SPAM_EMOJI_THRESHOLD) || 10,
    action: process.env.SPAM_ACTION || "mute",
    muteDuration: parseInt(process.env.SPAM_MUTE_DURATION) || 60000
  },
  
  // Auto-Mod Settings
  autoMod: {
    invites: process.env.AUTOMOD_BLOCK_INVITES !== "false",
    links: process.env.AUTOMOD_BLOCK_LINKS !== "false",
    caps: process.env.AUTOMOD_BLOCK_CAPS !== "false",
    capsThreshold: parseInt(process.env.AUTOMOD_CAPS_THRESHOLD) || 70,
    capsMinLength: parseInt(process.env.AUTOMOD_CAPS_MIN_LENGTH) || 10,
    badWords: process.env.AUTOMOD_BLOCK_BADWORDS !== "false",
    maxMentions: parseInt(process.env.AUTOMOD_MAX_MENTIONS) || 5,
    maxEmojis: parseInt(process.env.AUTOMOD_MAX_EMOJIS) || 10,
    autoPunish: process.env.AUTOMOD_AUTO_PUNISH !== "false"
  },
  
  // Verification Settings
  verification: {
    type: process.env.VERIFICATION_TYPE || "captcha",
    timeout: parseInt(process.env.VERIFICATION_TIMEOUT) || 300000,
    kickAfter: parseInt(process.env.VERIFICATION_KICK_AFTER) || 600000
  },
  
  // Captcha Settings
  captcha: {
    type: process.env.CAPTCHA_TYPE || "text"
  },
  
  // Welcome Settings
  welcome: {
    defaultCard: process.env.WELCOME_CARD_TEMPLATE || "classic",
    canvas: process.env.WELCOME_CANVAS === "true",
    dmOnJoin: process.env.WELCOME_DM === "true"
  },
  
  // Goodbye Settings
  goodbye: {
    defaultCard: process.env.GOODBYE_CARD_TEMPLATE || "classic",
    canvas: process.env.GOODBYE_CANVAS === "true"
  },
  
  // Logging Settings
  logging: {
    enabled: process.env.LOGGING_ENABLED !== "false",
    format: process.env.LOG_FORMAT || "embed"
  },
  
  // Support Links
  supportServer: process.env.SUPPORT_SERVER || "https://discord.gg/yAmED8qhXd",
  botInvite: process.env.BOT_INVITE || "https://discord.com/oauth2/authorize?client_id=1467842302260281427",
  website: process.env.WEBSITE || "https://abyssbot.xyz",
  
  // Development
  devMode: process.env.DEV_MODE === "true",
  debug: process.env.DEBUG === "true",
  logLevel: process.env.LOG_LEVEL || "info",
  
  // API Keys
  apiKeys: {
    weather: process.env.WEATHER_API_KEY || "",
    youtube: process.env.YOUTUBE_API_KEY || "",
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || ""
    },
    genius: process.env.GENIUS_API_KEY || ""
  }
};