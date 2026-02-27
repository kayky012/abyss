const { Schema, model } = require("mongoose");

const verificationSchema = new Schema({
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  userTag: { type: String, required: true },
  
  // Verification type
  type: { type: String, enum: ["captcha", "button", "reaction"], required: true },
  
  // Captcha data
  captcha: {
    code: { type: String },
    type: { type: String, enum: ["text", "math", "emoji"] },
    attempts: { type: Number, default: 0 },
    image: { type: String } // Base64 image if needed
  },
  
  // Status
  verified: { type: Boolean, default: false },
  verifiedAt: { type: Date, default: null },
  
  // Timeout
  expiresAt: { type: Date, required: true },
  
  // Message IDs for cleanup
  messageId: { type: String },
  channelId: { type: String },
  
  // Role to assign
  roleId: { type: String, required: true },
  
  // Logging
  logChannelId: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

verificationSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

verificationSchema.index({ guildId: 1, userId: 1 });
verificationSchema.index({ expiresAt: 1 });

// Check if expired
verificationSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

// Check if max attempts reached
verificationSchema.methods.maxAttemptsReached = function() {
  return this.captcha && this.captcha.attempts >= 3;
};

module.exports = model("Verification", verificationSchema);