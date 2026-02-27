const { Schema, model } = require("mongoose");

const guildSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  prefix: { type: String, default: "!" },
  
  // Settings
  settings: {
    language: { type: String, default: "en" },
    timezone: { type: String, default: "UTC" },
    disabledCommands: { type: [String], default: [] },
    disabledCategories: { type: [String], default: [] }
  },
  
  // Security Settings
  security: {
    antiRaid: {
      enabled: { type: Boolean, default: true },
      joinThreshold: { type: Number, default: 5 },
      joinInterval: { type: Number, default: 10000 },
      action: { type: String, enum: ["lockdown", "kick", "ban", "notify"], default: "lockdown" },
      whitelist: { type: [String], default: [] }
    },
    antiNuke: {
      enabled: { type: Boolean, default: true },
      channelDeleteThreshold: { type: Number, default: 3 },
      roleDeleteThreshold: { type: Number, default: 3 },
      banThreshold: { type: Number, default: 3 },
      kickThreshold: { type: Number, default: 3 },
      timeWindow: { type: Number, default: 5000 },
      whitelist: { type: [String], default: [] }
    },
    antiSpam: {
      enabled: { type: Boolean, default: true },
      messageThreshold: { type: Number, default: 5 },
      messageInterval: { type: Number, default: 3000 },
      mentionThreshold: { type: Number, default: 3 },
      emojiThreshold: { type: Number, default: 10 },
      action: { type: String, enum: ["warn", "mute", "kick"], default: "mute" },
      muteDuration: { type: Number, default: 60000 },
      whitelist: { type: [String], default: [] }
    }
  },
  
  // AutoMod Settings
  autoMod: {
    enabled: { type: Boolean, default: true },
    invites: { type: Boolean, default: true },
    links: { type: Boolean, default: true },
    caps: { type: Boolean, default: true },
    capsThreshold: { type: Number, default: 70 },
    capsMinLength: { type: Number, default: 10 },
    badWords: { type: Boolean, default: true },
    badWordsList: { type: [String], default: [] },
    spam: { type: Boolean, default: true },
    mentions: { type: Boolean, default: true },
    maxMentions: { type: Number, default: 5 },
    emojis: { type: Boolean, default: true },
    maxEmojis: { type: Number, default: 10 },
    autoPunish: { type: Boolean, default: true },
    whitelistedLinks: { type: [String], default: [] },
    whitelistedInvites: { type: [String], default: [] },
    ignoredChannels: { type: [String], default: [] },
    ignoredRoles: { type: [String], default: [] }
  },
  
  // Verification Settings
  verification: {
    enabled: { type: Boolean, default: false },
    type: { type: String, enum: ["captcha", "button", "none"], default: "captcha" },
    role: { type: String, default: null },
    channel: { type: String, default: null },
    logChannel: { type: String, default: null },
    timeout: { type: Number, default: 300000 },
    kickAfter: { type: Number, default: 600000 },
    captchaType: { type: String, enum: ["text", "math", "emoji"], default: "text" }
  },
  
  // Welcome Settings
  welcome: {
    enabled: { type: Boolean, default: false },
    channel: { type: String, default: null },
    message: { type: String, default: "Welcome {user} to {server}!" },
    image: { type: String, default: null },
    canvas: { type: Boolean, default: false },
    canvasTemplate: { type: String, enum: ["classic", "modern", "gaming", "minimal"], default: "classic" },
    color: { type: String, default: "#6B4EFF" },
    dm: { type: Boolean, default: false },
    dmMessage: { type: String, default: "Welcome to {server}!" }
  },
  
  // Goodbye Settings
  goodbye: {
    enabled: { type: Boolean, default: false },
    channel: { type: String, default: null },
    message: { type: String, default: "Goodbye {user}, we'll miss you!" },
    image: { type: String, default: null },
    canvas: { type: Boolean, default: false },
    canvasTemplate: { type: String, enum: ["classic", "modern", "gaming", "minimal"], default: "classic" },
    color: { type: String, default: "#ED4245" }
  },
  
  // Logging Settings
  logging: {
    enabled: { type: Boolean, default: false },
    channel: { type: String, default: null },
    events: { type: [String], default: [
      "guildMemberAdd",
      "guildMemberRemove",
      "messageDelete",
      "messageUpdate",
      "channelCreate",
      "channelDelete",
      "roleCreate",
      "roleDelete",
      "guildBanAdd",
      "guildBanRemove"
    ]},
    ignoredChannels: { type: [String], default: [] },
    ignoredUsers: { type: [String], default: [] }
  },
  
  // Moderation Settings
  moderation: {
    logChannel: { type: String, default: null },
    muteRole: { type: String, default: null },
    maxWarns: { type: Number, default: 3 },
    punishAction: { type: String, enum: ["mute", "kick", "ban"], default: "mute" }
  },
  
  // Whitelist
  whitelist: {
    users: { type: [String], default: [] },
    roles: { type: [String], default: [] },
    channels: { type: [String], default: [] }
  },
  
  // Premium
  premium: {
    enabled: { type: Boolean, default: false },
    expiresAt: { type: Date, default: null },
    tier: { type: String, enum: ["basic", "pro", "elite"], default: "basic" }
  },
  
  // Stats
  stats: {
    totalMembers: { type: Number, default: 0 },
    totalBans: { type: Number, default: 0 },
    totalKicks: { type: Number, default: 0 },
    totalMutes: { type: Number, default: 0 },
    totalWarns: { type: Number, default: 0 },
    messagesDeleted: { type: Number, default: 0 },
    securityActions: { type: Number, default: 0 }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

guildSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model("Guild", guildSchema);