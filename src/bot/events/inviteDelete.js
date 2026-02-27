const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "inviteDelete",
  async execute(invite, client) {
    if (!invite.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(invite.guild.id);
    
    // Remove from tracker
    if (client.inviteTracker?.has(invite.guild.id)) {
      const guildInvites = client.inviteTracker.get(invite.guild.id);
      guildInvites.delete(invite.code);
    }
    
    // Log invite deletion
    if (settings?.logging?.enabled && settings.logging.events?.inviteDelete) {
      await logInviteDelete(invite, client, settings);
    }
  }
};

async function logInviteDelete(invite, client, settings) {
  try {
    const logChannel = invite.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.error)
      .setTitle("Invite Deleted")
      .addFields(
        { name: "Code", value: invite.code, inline: true },
        { name: "Channel", value: invite.channel ? `${invite.channel}` : "Unknown", inline: true }
      )
      .setFooter({ text: `Invite deleted` })
      .setTimestamp();
    
    if (invite.uses !== undefined) {
      embed.addFields({ name: "Uses", value: invite.uses.toString(), inline: true });
    }
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging invite deletion:", error);
  }
}