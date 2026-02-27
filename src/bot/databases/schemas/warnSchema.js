const { Schema, model } = require("mongoose");

const warnSchema = new Schema({
  warnId: { type: String, required: true, unique: true },
  guildId: { type: String, required: true },
  
  userId: { type: String, required: true },
  userTag: { type: String, required: true },
  
  moderatorId: { type: String, required: true },
  moderatorTag: { type: String, required: true },
  
  reason: { type: String, required: true },
  points: { type: Number, default: 1 },
  
  active: { type: Boolean, default: true },
  expiresAt: { type: Date, default: null },
  
  // Evidence
  evidence: { type: String, default: null },
  
  // Actions taken
  actions: [{
    type: { type: String, enum: ["mute", "kick", "ban"] },
    duration: { type: Number },
    executedAt: { type: Date }
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

warnSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

warnSchema.index({ guildId: 1, userId: 1 });
warnSchema.index({ active: 1 });

module.exports = model("Warn", warnSchema);