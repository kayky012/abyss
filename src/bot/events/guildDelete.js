const Logger = require("../utils/logger.js");

module.exports = {
  name: "guildDelete",
  async execute(guild, client) {
    if (!guild) return;
    
    Logger.info(`Left guild: ${guild.name} (${guild.id})`);
    
    try {
      // Clean up guild data from cache
      client.guildData.delete(guild.id);
      
      // Clean up trackers
      client.spamTracker?.delete(guild.id);
      client.joinTracker?.delete(guild.id);
      client.actionTracker?.delete(guild.id);
      
      // Optionally: Keep data or delete from database
      // Uncomment below to delete all guild data from database
      
      /*
      if (client.schemas?.guildSchema) {
        await client.schemas.guildSchema.deleteOne({ id: guild.id });
      }
      
      if (client.schemas?.antiRaidSchema) {
        await client.schemas.antiRaidSchema.deleteOne({ guildId: guild.id });
      }
      
      if (client.schemas?.antiNukeSchema) {
        await client.schemas.antiNukeSchema.deleteOne({ guildId: guild.id });
      }
      
      if (client.schemas?.antiSpamSchema) {
        await client.schemas.antiSpamSchema.deleteOne({ guildId: guild.id });
      }
      
      if (client.schemas?.autoModSchema) {
        await client.schemas.autoModSchema.deleteOne({ guildId: guild.id });
      }
      
      if (client.schemas?.welcomeSchema) {
        await client.schemas.welcomeSchema.deleteOne({ guildId: guild.id });
      }
      
      if (client.schemas?.goodbyeSchema) {
        await client.schemas.goodbyeSchema.deleteOne({ guildId: guild.id });
      }
      
      if (client.schemas?.loggingSchema) {
        await client.schemas.loggingSchema.deleteOne({ guildId: guild.id });
      }
      
      Logger.database("DELETE", "Guild Data", guild.id);
      */
      
    } catch (error) {
      Logger.error("Error in guildDelete event:", error);
    }
  }
};