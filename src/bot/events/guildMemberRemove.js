const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");
const CanvasGenerator = require("../utils/canvas.js");

module.exports = {
  name: "guildMemberRemove",
  async execute(member, client) {
    Logger.debug(`${member.user.tag} left ${member.guild.name}`);
    
    // Get guild settings
    const settings = await client.getGuildSettings(member.guild.id);
    
    // Handle goodbye message
    if (settings?.goodbye?.enabled) {
      await sendGoodbye(member, client, settings);
    }
    
    // Clean up user data
    client.spamTracker?.delete(member.id);
    client.mentionTracker?.delete(member.id);
    client.messageTracker?.delete(member.id);
    client.verificationCache?.delete(member.id);
    
    // Update stats
    await updateMemberStats(member.guild, client);
  }
};

async function sendGoodbye(member, client, settings) {
  try {
    const channel = member.guild.channels.cache.get(settings.goodbye.channel);
    if (!channel) return;
    
    let message = settings.goodbye.message
      .replace(/{user}/g, member.user.username)
      .replace(/{username}/g, member.user.username)
      .replace(/{tag}/g, member.user.tag)
      .replace(/{server}/g, member.guild.name)
      .replace(/{memberCount}/g, member.guild.memberCount);
    
    if (settings.goodbye.canvas && settings.goodbye.canvasTemplate) {
      try {
        const canvasBuffer = await CanvasGenerator.generateGoodbyeImage(
          member, 
          settings.goodbye.canvasTemplate
        );
        
        const embed = new EmbedBuilder()
          .setColor(settings.goodbye.color || client.colors.warning)
          .setDescription(message)
          .setImage("attachment://goodbye.png")
          .setTimestamp();
        
        await channel.send({
          embeds: [embed],
          files: [{ attachment: canvasBuffer, name: "goodbye.png" }]
        });
      } catch (error) {
        Logger.error("Error generating goodbye canvas:", error);
        await channel.send(message);
      }
    } else if (settings.goodbye.imageUrl) {
      const embed = new EmbedBuilder()
        .setColor(settings.goodbye.color || client.colors.warning)
        .setDescription(message)
        .setImage(settings.goodbye.imageUrl)
        .setTimestamp();
      
      await channel.send({ embeds: [embed] });
    } else {
      await channel.send(message);
    }
    
    // Update stats
    if (client.schemas?.goodbyeSchema) {
      await client.schemas.goodbyeSchema.findOneAndUpdate(
        { guildId: member.guild.id },
        { $inc: { "stats.saidGoodbye": 1, "stats.lastGoodbye": new Date() } }
      );
    }
    
  } catch (error) {
    Logger.error("Error sending goodbye:", error);
  }
}

async function updateMemberStats(guild, client) {
  try {
    if (client.schemas?.statsSchema) {
      await client.schemas.statsSchema.findOneAndUpdate(
        { type: "guild", targetId: guild.id },
        { $inc: { "daily.members": -1 } }
      );
    }
  } catch (error) {
    Logger.error("Error updating member stats:", error);
  }
}