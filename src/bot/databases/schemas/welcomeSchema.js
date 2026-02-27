const { Schema, model } = require("mongoose");

const welcomeSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  
  enabled: { type: Boolean, default: false },
  
  channelId: { type: String, default: null },
  
  // Message settings
  message: {
    content: { type: String, default: "Welcome {user} to {server}!" },
    embed: {
      enabled: { type: Boolean, default: false },
      title: { type: String, default: "Welcome!" },
      description: { type: String, default: "Welcome {user} to **{server}**!" },
      color: { type: String, default: "#6B4EFF" },
      thumbnail: { type: Boolean, default: true },
      footer: { type: String, default: "Member #{memberCount}" }
    }
  },
  
  // Canvas image
  canvas: {
    enabled: { type: Boolean, default: false },
    template: { type: String, enum: ["classic", "modern", "gaming", "minimal"], default: "classic" },
    background: { type: String, default: "#2C2F33" },
    textColor: { type: String, default: "#FFFFFF" },
    accentColor: { type: String, default: "#6B4EFF" }
  },
  
  // Image URL
  imageUrl: { type: String, default: null },
  
  // DM
  dm: {
    enabled: { type: Boolean, default: false },
    message: { type: String, default: "Welcome to **{server}**! We hope you enjoy your stay." }
  },
  
  // Auto role
  autoRole: {
    enabled: { type: Boolean, default: false },
    roles: { type: [String], default: [] },
    bots: { type: Boolean, default: true }
  },
  
  // Statistics
  stats: {
    welcomed: { type: Number, default: 0 },
    lastWelcome: { type: Date, default: null }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

welcomeSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model("Welcome", welcomeSchema);