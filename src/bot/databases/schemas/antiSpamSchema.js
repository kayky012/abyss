const { Schema, model } = require("mongoose");

const antiSpamSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  
  enabled: { type: Boolean, default: true },
  
  // Message spam
  messageThreshold: { type: Number, default: 5 },
  messageInterval: { type: Number, default: 3000 }, // milliseconds
  
  // Mention spam
  mentionThreshold: { type: Number, default: 3 },
  mentionInterval: { type: Number, default: 5000 },
  
  // Emoji spam
  emojiThreshold: { type: Number, default: 10 },
  emojiInterval: { type: Number, default: 5000 },
  
  // Duplicate spam
  duplicateThreshold: { type: Number, default: 3 },
  duplicateInterval: { type: Number, default: 10000 },
  
  // Action
  action: { type: String, enum: ["warn", "mute", "kick", "ban"], default: "mute" },
  muteDuration: { type: Number, default: 60000 }, // 1 minute
  
  // Whitelist
  whitelist: {
    users: { type: [String], default: [] },
    roles: { type: [String], default: [] },
    channels: { type: [String], default: [] }
  },
  
  // Ignored channels
  ignoredChannels: { type: [String], default: [] },
  
  // Notification
  notifyChannel: { type: String, default: null },
  
  // Stats
  stats: {
    spamDetected: { type: Number, default: 0 },
    actionsTaken: { type: Number, default: 0 },
    lastSpam: { type: Date, default: null }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

antiSpamSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model("AntiSpam", antiSpamSchema);