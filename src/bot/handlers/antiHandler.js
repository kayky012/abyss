const Logger = require("../utils/logger.js");
const AntiRaid = require("../utils/antiRaid.js");
const AntiNuke = require("../utils/antiNuke.js");
const AntiSpam = require("../utils/antiSpam.js");
const AutoMod = require("../utils/autoMod.js");

module.exports = async (client) => {
  try {
    // Initialize anti modules
    client.antiRaid = new AntiRaid(client);
    client.antiNuke = new AntiNuke(client);
    client.antiSpam = new AntiSpam(client);
    client.autoMod = new AutoMod(client);
    
    // Anti-Raid Detection
    client.on("guildMemberAdd", async (member) => {
      if (!client.config.security.antiRaidEnabled) return;
      await client.antiRaid.handleJoin(member);
    });
    
    // Anti-Nuke Detection
    client.on("channelDelete", async (channel) => {
      if (!client.config.security.antiNukeEnabled) return;
      await client.antiNuke.handleChannelDelete(channel);
    });
    
    client.on("channelCreate", async (channel) => {
      if (!client.config.security.antiNukeEnabled) return;
      await client.antiNuke.handleChannelCreate(channel);
    });
    
    client.on("roleDelete", async (role) => {
      if (!client.config.security.antiNukeEnabled) return;
      await client.antiNuke.handleRoleDelete(role);
    });
    
    client.on("roleCreate", async (role) => {
      if (!client.config.security.antiNukeEnabled) return;
      await client.antiNuke.handleRoleCreate(role);
    });
    
    client.on("guildBanAdd", async (ban) => {
      if (!client.config.security.antiNukeEnabled) return;
      await client.antiNuke.handleBanAdd(ban);
    });
    
    client.on("guildMemberKick", async (member) => {
      if (!client.config.security.antiNukeEnabled) return;
      await client.antiNuke.handleKick(member);
    });
    
    // Anti-Spam Detection (handled in messageCreate)
    client.on("messageCreate", async (message) => {
      if (!client.config.security.antiSpamEnabled) return;
      if (message.author.bot) return;
      await client.antiSpam.handleMessage(message);
    });
    
    // Auto-Mod Detection
    client.on("messageCreate", async (message) => {
      if (!client.config.security.autoModEnabled) return;
      if (message.author.bot) return;
      await client.autoMod.checkMessage(message);
    });
    
    Logger.success("Anti-handler initialized");
    
  } catch (error) {
    Logger.error("Error initializing anti-handler:", error);
  }
};