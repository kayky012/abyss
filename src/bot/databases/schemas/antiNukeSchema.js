const { Schema, model } = require("mongoose");

const antiNukeSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  
  enabled: { type: Boolean, default: true },
  
  // Thresholds
  channelDeleteThreshold: { type: Number, default: 3 },
  channelCreateThreshold: { type: Number, default: 3 },
  roleDeleteThreshold: { type: Number, default: 3 },
  roleCreateThreshold: { type: Number, default: 3 },
  banThreshold: { type: Number, default: 3 },
  kickThreshold: { type: Number, default: 3 },
  
  timeWindow: { type: Number, default: 5000 }, // milliseconds
  
  // Actions
  action: { type: String, enum: ["ban", "kick", "lockdown", "notify"], default: "ban" },
  
  // Whitelist
  whitelist: {
    users: { type: [String], default: [] },
    roles: { type: [String], default: [] },
    channels: { type: [String], default: [] }
  },
  
  // Protected entities
  protectedChannels: { type: [String], default: [] },
  protectedRoles: { type: [String], default: [] },
  protectedCategories: { type: [String], default: [] },
  
  // Auto recovery
  autoRecovery: { type: Boolean, default: true },
  
  // Notification
  notifyChannel: { type: String, default: null },
  notifyRoles: { type: [String], default: [] },
  
  // Stats
  stats: {
    nukeAttempts: { type: Number, default: 0 },
    lastNuke: { type: Date, default: null },
    actionsTaken: { type: Number, default: 0 }
  },
  
  // History
  history: [{
    timestamp: { type: Date, default: Date.now },
    type: { type: String }, // channelDelete, roleDelete, ban, etc.
    count: { type: Number },
    executor: { type: String },
    action: { type: String }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

antiNukeSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model("AntiNuke", antiNukeSchema);