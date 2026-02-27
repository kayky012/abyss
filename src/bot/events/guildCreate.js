const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "guildCreate",
  async execute(guild, client) {
    Logger.info(`Joined new guild: ${guild.name} (${guild.id}) - ${guild.memberCount} members`);
    
    try {
      // Create guild in database
      if (client.schemas?.guildSchema) {
        const guildData = await client.schemas.guildSchema.findOne({ id: guild.id });
        
        if (!guildData) {
          await new client.schemas.guildSchema({
            id: guild.id,
            name: guild.name
          }).save();
          
          Logger.database("CREATE", "Guild", guild.id);
        }
      }
      
      // Send welcome message to system channel
      if (guild.systemChannel) {
        const embed = new EmbedBuilder()
          .setColor(client.colors.primary)
          .setTitle("Thanks for adding ABYSS!")
          .setDescription("I'm **ABYSS** - Your community security bot.")
          .addFields(
            { name: "Security Features", value: "Anti-Raid • Anti-Nuke • Anti-Spam • AutoMod", inline: false },
            { name: "Moderation", value: "Ban • Kick • Mute • Warn • Purge", inline: false },
            { name: "Verification", value: "Captcha • Button • Role Verification", inline: false },
            { name: "Welcome/Goodbye", value: "Canvas Cards • Custom Messages", inline: false },
            { name: "Getting Started", value: "Use `/setup` to configure me!", inline: false }
          )
          .setFooter({ text: "ABYSS - Securing Communities" })
          .setTimestamp();
        
        await guild.systemChannel.send({ embeds: [embed] });
      }
      
      // Create default settings
      await createDefaultSettings(guild, client);
      
    } catch (error) {
      Logger.error("Error in guildCreate event:", error);
    }
  }
};

async function createDefaultSettings(guild, client) {
  try {
    // Create anti-raid settings
    if (client.schemas?.antiRaidSchema) {
      await new client.schemas.antiRaidSchema({
        guildId: guild.id
      }).save();
    }
    
    // Create anti-nuke settings
    if (client.schemas?.antiNukeSchema) {
      await new client.schemas.antiNukeSchema({
        guildId: guild.id
      }).save();
    }
    
    // Create anti-spam settings
    if (client.schemas?.antiSpamSchema) {
      await new client.schemas.antiSpamSchema({
        guildId: guild.id
      }).save();
    }
    
    // Create auto-mod settings
    if (client.schemas?.autoModSchema) {
      await new client.schemas.autoModSchema({
        guildId: guild.id
      }).save();
    }
    
    // Create welcome settings
    if (client.schemas?.welcomeSchema) {
      await new client.schemas.welcomeSchema({
        guildId: guild.id
      }).save();
    }
    
    // Create goodbye settings
    if (client.schemas?.goodbyeSchema) {
      await new client.schemas.goodbyeSchema({
        guildId: guild.id
      }).save();
    }
    
    // Create logging settings
    if (client.schemas?.loggingSchema) {
      await new client.schemas.loggingSchema({
        guildId: guild.id
      }).save();
    }
    
    Logger.debug(`Created default settings for guild: ${guild.name}`);
    
  } catch (error) {
    Logger.error("Error creating default settings:", error);
  }
}