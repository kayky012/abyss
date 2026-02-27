const { Schema, model } = require("mongoose");

const autoModSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  
  enabled: { type: Boolean, default: true },
  
  // Invite filter
  invites: {
    enabled: { type: Boolean, default: true },
    action: { type: String, enum: ["delete", "warn", "mute"], default: "delete" },
    whitelist: { type: [String], default: [] }
  },
  
  // Link filter
  links: {
    enabled: { type: Boolean, default: true },
    action: { type: String, enum: ["delete", "warn", "mute"], default: "delete" },
    whitelist: { type: [String], default: [] }
  },
  
  // Caps filter
  caps: {
    enabled: { type: Boolean, default: true },
    threshold: { type: Number, default: 70 },
    minLength: { type: Number, default: 10 },
    action: { type: String, enum: ["delete", "warn"], default: "delete" }
  },
  
  // Bad words filter
  badWords: {
    enabled: { type: Boolean, default: true },
    words: { type: [String], default: [] },
    action: { type: String, enum: ["delete", "warn", "mute"], default: "delete" }
  },
  
  // Spam filter
  spam: {
    enabled: { type: Boolean, default: true },
    threshold: { type: Number, default: 5 },
    interval: { type: Number, default: 3000 },
    action: { type: String, enum: ["delete", "warn", "mute"], default: "delete" }
  },
  
  // Mention filter
  mentions: {
    enabled: { type: Boolean, default: true },
    max: { type: Number, default: 5 },
    action: { type: String, enum: ["delete", "warn", "mute"], default: "delete" }
  },
  
  // Emoji filter
  emojis: {
    enabled: { type: Boolean, default: true },
    max: { type: Number, default: 10 },
    action: { type: String, enum: ["delete", "warn"], default: "delete" }
  },
  
  // Punishments - FIXED: This was likely the problem
  punishments: {
    warnCount: {
      type: Map,
      of: new Schema({
        action: { type: String, enum: ["mute", "kick", "ban"] },
        duration: { type: Number }
      }, { _id: false }),
      default: {
        3: { action: "mute", duration: 3600000 },
        5: { action: "kick", duration: null },
        7: { action: "ban", duration: null }
      }
    }
  },
  
  // Ignored
  ignoredChannels: { type: [String], default: [] },
  ignoredRoles: { type: [String], default: [] },
  ignoredUsers: { type: [String], default: [] },
  
  // Logging
  logChannel: { type: String, default: null },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

autoModSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model("AutoMod", autoModSchema);