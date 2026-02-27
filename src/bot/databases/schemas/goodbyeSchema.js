const { Schema, model } = require("mongoose");

const goodbyeSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  
  enabled: { type: Boolean, default: false },
  
  channelId: { type: String, default: null },
  
  // Message settings
  message: {
    content: { type: String, default: "Goodbye {user}, we'll miss you!" },
    embed: {
      enabled: { type: Boolean, default: false },
      title: { type: String, default: "Goodbye!" },
      description: { type: String, default: "Goodbye {user} from **{server}**!" },
      color: { type: String, default: "#ED4245" },
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
    accentColor: { type: String, default: "#ED4245" }
  },
  
  // Image URL
  imageUrl: { type: String, default: null },
  
  // Statistics
  stats: {
    saidGoodbye: { type: Number, default: 0 },
    lastGoodbye: { type: Date, default: null }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

goodbyeSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model("Goodbye", goodbyeSchema);