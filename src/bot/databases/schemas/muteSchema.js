const { Schema, model } = require("mongoose");

const muteSchema = new Schema({
  muteId: { type: String, required: true, unique: true },
  
  userId: { type: String, required: true },
  userTag: { type: String, required: true },
  guildId: { type: String, required: true },
  
  moderatorId: { type: String, required: true },
  moderatorTag: { type: String, required: true },
  
  reason: { type: String, required: true },
  
  type: { type: String, enum: ["text", "voice", "all"], default: "all" },
  
  // Role-based mute (for old systems)
  roleId: { type: String, default: null },
  
  // Timeout-based mute (new system)
  timeout: { type: Boolean, default: true },
  
  duration: { type: Number, required: true }, // in milliseconds
  expiresAt: { type: Date, required: true },
  
  active: { type: Boolean, default: true },
  
  // Appeal
  appealed: { type: Boolean, default: false },
  appealReason: { type: String, default: null },
  appealDate: { type: Date, default: null },
  appealApproved: { type: Boolean, default: false },
  
  // History
  history: [{
    action: { type: String, enum: ["created", "extended", "reduced", "expired", "removed"] },
    moderatorId: { type: String },
    reason: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

muteSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

muteSchema.index({ userId: 1, guildId: 1, active: 1 });
muteSchema.index({ expiresAt: 1 });

// Check if mute is expired
muteSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

// Get remaining time
muteSchema.methods.getRemaining = function() {
  const remaining = this.expiresAt - Date.now();
  return remaining > 0 ? remaining : 0;
};

module.exports = model("Mute", muteSchema);