const { Schema, model } = require("mongoose");

const captchaSchema = new Schema({
  captchaId: { type: String, required: true, unique: true },
  
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  
  type: { type: String, enum: ["text", "math", "emoji"], required: true },
  
  // The correct answer
  answer: { type: String, required: true },
  
  // Generated code/image
  code: { type: String }, // For text captcha
  question: { type: String }, // For math captcha
  emoji: { type: String }, // For emoji captcha
  
  // Image data (if generated)
  image: { type: String }, // Base64 image
  
  // Attempts
  attempts: { type: Number, default: 0 },
  maxAttempts: { type: Number, default: 3 },
  
  // Status
  solved: { type: Boolean, default: false },
  solvedAt: { type: Date, default: null },
  
  // Expiry
  expiresAt: { type: Date, required: true },
  
  // Message info for cleanup
  messageId: { type: String },
  channelId: { type: String },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

captchaSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

captchaSchema.index({ userId: 1, guildId: 1, solved: 1 });
captchaSchema.index({ expiresAt: 1 });

// Check if expired
captchaSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

// Check if max attempts reached
captchaSchema.methods.maxAttemptsReached = function() {
  return this.attempts >= this.maxAttempts;
};

// Validate answer
captchaSchema.methods.validateAnswer = function(userAnswer) {
  if (this.type === "math") {
    // For math, answer is already string of result
    return userAnswer.toString() === this.answer;
  } else {
    return userAnswer.toUpperCase() === this.answer.toUpperCase();
  }
};

module.exports = model("Captcha", captchaSchema);