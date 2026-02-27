const { Schema, model } = require("mongoose");

const blacklistSchema = new Schema({
  targetId: { type: String, required: true },
  targetType: { type: String, enum: ["user", "guild", "word"], required: true },
  
  // For user/guild
  reason: { type: String, required: true },
  moderatorId: { type: String, required: true },
  moderatorTag: { type: String, required: true },
  
  // For words
  word: { type: String, default: null },
  caseSensitive: { type: Boolean, default: false },
  
  // Status
  active: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  
  // Statistics
  hits: { type: Number, default: 0 },
  lastHit: { type: Date, default: null },
  
  // History
  history: [{
    action: { type: String, enum: ["add", "remove", "edit", "hit"] },
    moderatorId: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

blacklistSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

blacklistSchema.index({ targetId: 1, targetType: 1, active: 1 });
blacklistSchema.index({ word: 1 });

module.exports = model("Blacklist", blacklistSchema);