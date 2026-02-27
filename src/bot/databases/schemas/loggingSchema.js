const { Schema, model } = require("mongoose");

const loggingSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  
  enabled: { type: Boolean, default: false },
  channelId: { type: String, default: null },
  
  // Events to log
  events: {
    // Member events
    memberJoin: { type: Boolean, default: true },
    memberLeave: { type: Boolean, default: true },
    memberUpdate: { type: Boolean, default: true },
    memberBan: { type: Boolean, default: true },
    memberUnban: { type: Boolean, default: true },
    memberKick: { type: Boolean, default: true },
    memberRoleAdd: { type: Boolean, default: true },
    memberRoleRemove: { type: Boolean, default: true },
    memberNicknameUpdate: { type: Boolean, default: true },
    memberTimeout: { type: Boolean, default: true },
    
    // Message events
    messageDelete: { type: Boolean, default: true },
    messageEdit: { type: Boolean, default: true },
    messageBulkDelete: { type: Boolean, default: true },
    
    // Channel events
    channelCreate: { type: Boolean, default: true },
    channelDelete: { type: Boolean, default: true },
    channelUpdate: { type: Boolean, default: true },
    
    // Role events
    roleCreate: { type: Boolean, default: true },
    roleDelete: { type: Boolean, default: true },
    roleUpdate: { type: Boolean, default: true },
    
    // Guild events
    guildUpdate: { type: Boolean, default: true },
    guildBoost: { type: Boolean, default: true },
    guildUnboost: { type: Boolean, default: true },
    
    // Invite events
    inviteCreate: { type: Boolean, default: true },
    inviteDelete: { type: Boolean, default: true },
    
    // Voice events
    voiceJoin: { type: Boolean, default: true },
    voiceLeave: { type: Boolean, default: true },
    voiceMove: { type: Boolean, default: true },
    voiceMute: { type: Boolean, default: true },
    voiceDeafen: { type: Boolean, default: true },
    
    // Thread events
    threadCreate: { type: Boolean, default: true },
    threadDelete: { type: Boolean, default: true },
    threadUpdate: { type: Boolean, default: true },
    
    // Emoji events
    emojiCreate: { type: Boolean, default: true },
    emojiDelete: { type: Boolean, default: true },
    emojiUpdate: { type: Boolean, default: true },
    
    // Sticker events
    stickerCreate: { type: Boolean, default: true },
    stickerDelete: { type: Boolean, default: true },
    stickerUpdate: { type: Boolean, default: true },
    
    // Webhook events
    webhookCreate: { type: Boolean, default: true },
    webhookDelete: { type: Boolean, default: true },
    webhookUpdate: { type: Boolean, default: true },
    
    // Integration events
    integrationCreate: { type: Boolean, default: true },
    integrationDelete: { type: Boolean, default: true },
    integrationUpdate: { type: Boolean, default: true }
  },
  
  // Ignored
  ignoredChannels: { type: [String], default: [] },
  ignoredUsers: { type: [String], default: [] },
  ignoredRoles: { type: [String], default: [] },
  
  // Format
  format: { type: String, enum: ["embed", "text"], default: "embed" },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

loggingSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = model("Logging", loggingSchema);