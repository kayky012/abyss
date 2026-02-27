const fs = require("fs");
const path = require("path");
const Logger = require("../utils/logger.js");

module.exports = async (client) => {
  try {
    const eventsPath = path.join(__dirname, "../events");
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));
    
    let loaded = 0;
    
    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);
      
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      
      loaded++;
      Logger.debug(`Loaded event: ${event.name}`);
    }
    
    Logger.success(`Loaded ${loaded} events`);
    
    // Initialize invite tracker
    await initInviteTracker(client);
    
  } catch (error) {
    Logger.error("Error loading events:", error);
  }
};

async function initInviteTracker(client) {
  try {
    for (const guild of client.guilds.cache.values()) {
      const invites = await guild.invites.fetch().catch(() => {});
      if (invites) {
        client.inviteTracker.set(guild.id, new Map(invites.map(invite => [invite.code, invite.uses])));
      }
    }
    Logger.debug("Invite tracker initialized");
  } catch (error) {
    Logger.error("Error initializing invite tracker:", error);
  }
}