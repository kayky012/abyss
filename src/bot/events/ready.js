const Logger = require("../utils/logger.js");
const { ActivityType } = require("discord.js");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    Logger.success(`ABYSS is online as ${client.user.tag}`);
    Logger.info(`Serving ${client.guilds.cache.size} servers`);
    
    // Set bot status
    const status = client.config.status || "dnd";
    const activity = client.config.activity || "Securing Communities";
    
    client.user.setPresence({
      activities: [{
        name: activity,
        type: ActivityType.Playing
      }],
      status: status
    });
    
    Logger.info(`Status set to: ${status} - ${activity}`);
    
    // Load all guild settings into cache
    await loadGuildSettings(client);
    
    // Clean up expired mutes
    await cleanupExpiredMutes(client);
    
    // Clean up expired verifications
    await cleanupExpiredVerifications(client);
    
    Logger.success(`ABYSS is ready to protect ${client.guilds.cache.size} communities`);
  }
};

async function loadGuildSettings(client) {
  try {
    if (!client.schemas?.guildSchema) return;
    
    const guilds = await client.schemas.guildSchema.find({});
    for (const guild of guilds) {
      client.guildData.set(guild.id, guild);
    }
    
    Logger.debug(`Loaded ${guilds.length} guild settings into cache`);
  } catch (error) {
    Logger.error("Error loading guild settings:", error);
  }
}

async function cleanupExpiredMutes(client) {
  try {
    if (!client.schemas?.muteSchema) return;
    
    const expired = await client.schemas.muteSchema.find({
      active: true,
      expiresAt: { $lt: new Date() }
    });
    
    for (const mute of expired) {
      mute.active = false;
      await mute.save();
      
      // Remove timeout from member if they're still in guild
      const guild = client.guilds.cache.get(mute.guildId);
      if (guild) {
        const member = await guild.members.fetch(mute.userId).catch(() => null);
        if (member) {
          await member.timeout(null).catch(() => {});
        }
      }
    }
    
    if (expired.length > 0) {
      Logger.debug(`Cleaned up ${expired.length} expired mutes`);
    }
  } catch (error) {
    Logger.error("Error cleaning up expired mutes:", error);
  }
}

async function cleanupExpiredVerifications(client) {
  try {
    if (!client.schemas?.verificationSchema) return;
    
    const expired = await client.schemas.verificationSchema.find({
      verified: false,
      expiresAt: { $lt: new Date() }
    });
    
    for (const verification of expired) {
      // Kick user if they haven't verified
      const guild = client.guilds.cache.get(verification.guildId);
      if (guild) {
        const member = await guild.members.fetch(verification.userId).catch(() => null);
        if (member && member.kickable) {
          await member.kick("Failed to verify in time").catch(() => {});
        }
      }
      
      await verification.deleteOne();
    }
    
    if (expired.length > 0) {
      Logger.debug(`Cleaned up ${expired.length} expired verifications`);
    }
  } catch (error) {
    Logger.error("Error cleaning up expired verifications:", error);
  }
}