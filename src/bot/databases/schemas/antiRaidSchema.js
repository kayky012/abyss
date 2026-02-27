const { Schema, model } = require("mongoose");

const antiRaidSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  
  enabled: { type: Boolean, default: true },
  
  // Join protection
  joinThreshold: { type: Number, default: 5 },
  joinInterval: { type: Number, default: 10000 }, // milliseconds
  action: { type: String, enum: ["lockdown", "kick", "ban", "notify"], default: "lockdown" },
  
  // Whitelist
  whitelist: {
    users: { type: [String], default: [] },
    roles: { type: [String], default: [] },
    channels: { type: [String], default: [] }
  },
  
  // Auto recovery
  autoRecovery: { type: Boolean, default: true },
  recoveryDelay: { type: Number, default: 300000 }, // 5 minutes
  
  // Notification
  notifyChannel: { type: String, default: null },
  notifyRoles: { type: [String], default: [] },
  
  // Stats
  stats: {
    raidsDetected: { type: Number, default: 0 },
    lastRaid: { type: Date, default: null },
    actionsTaken: { type: Number, default: 0 }
  },
  
  // Raid history
  history: [{
    timestamp: { type: Date, default: Date.now },
    joinCount: { type: Number },
    action: { type: String },
    users: { type: [String] }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

antiRaidSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model("AntiRaid", antiRaidSchema);