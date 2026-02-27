const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  discriminator: { type: String, default: "0" },
  avatar: { type: String, default: null },
  
  // Warnings (guild-specific)
  warnings: [{
    guildId: { type: String, required: true },
    reason: { type: String, required: true },
    moderatorId: { type: String, required: true },
    moderatorTag: { type: String, required: true },
    warnId: { type: String, required: true },
    points: { type: Number, default: 1 },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Mutes (guild-specific)
  mutes: [{
    guildId: { type: String, required: true },
    reason: { type: String, required: true },
    moderatorId: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    active: { type: Boolean, default: true }
  }],
  
  // Bans (guild-specific)
  bans: [{
    guildId: { type: String, required: true },
    reason: { type: String, required: true },
    moderatorId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Verification
  verification: {
    verified: { type: Boolean, default: false },
    verifiedAt: { type: Date, default: null },
    guilds: { type: [String], default: [] }
  },
  
  // Captcha
  captcha: {
    current: { type: String, default: null },
    attempts: { type: Number, default: 0 },
    lastAttempt: { type: Date, default: null }
  },
  
  // Blacklist
  blacklisted: {
    global: { type: Boolean, default: false },
    reason: { type: String, default: "" },
    expiresAt: { type: Date, default: null }
  },
  
  // Trust Score (0-100)
  trustScore: { type: Number, default: 100 },
  
  // Stats
  stats: {
    messagesSent: { type: Number, default: 0 },
    warningsReceived: { type: Number, default: 0 },
    timesMuted: { type: Number, default: 0 },
    timesKicked: { type: Number, default: 0 },
    timesBanned: { type: Number, default: 0 },
    securityFlags: { type: Number, default: 0 },
    lastSeen: { type: Date, default: Date.now }
  },
  
  // Joined Guilds
  joinedGuilds: { type: [String], default: [] },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: Date.now }
});

userSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for warning count
userSchema.virtual("warningCount").get(function() {
  return this.warnings.length;
});

// Virtual for active mutes
userSchema.virtual("activeMutes").get(function() {
  const now = new Date();
  return this.mutes.filter(m => m.active && m.expiresAt > now);
});

module.exports = model("User", userSchema);