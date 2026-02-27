const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "inviteCreate",
  async execute(invite, client) {
    if (!invite.guild) return;
    
    // Get guild settings
    const settings = await client.getGuildSettings(invite.guild.id);
    
    // Track invite for later use
    if (!client.inviteTracker) client.inviteTracker = new Map();
    
    if (!client.inviteTracker.has(invite.guild.id)) {
      client.inviteTracker.set(invite.guild.id, new Map());
    }
    
    const guildInvites = client.inviteTracker.get(invite.guild.id);
    guildInvites.set(invite.code, invite.uses);
    
    // Log invite creation
    if (settings?.logging?.enabled && settings.logging.events?.inviteCreate) {
      await logInviteCreate(invite, client, settings);
    }
  }
};

async function logInviteCreate(invite, client, settings) {
  try {
    const logChannel = invite.guild.channels.cache.get(settings.logging.channel);
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.success)
      .setTitle("Invite Created")
      .addFields(
        { name: "Code", value: invite.code, inline: true },
        { name: "Channel", value: `${invite.channel}`, inline: true },
        { name: "Creator", value: invite.inviter ? invite.inviter.tag : "Unknown", inline: true },
        { name: "Max Uses", value: invite.maxUses?.toString() || "Unlimited", inline: true },
        { name: "Expires", value: invite.maxAge ? `<t:${Math.floor((Date.now() + invite.maxAge * 1000) / 1000)}:R>` : "Never", inline: true },
        { name: "Temporary", value: invite.temporary ? "Yes" : "No", inline: true }
      )
      .setFooter({ text: `Invite created` })
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
    
  } catch (error) {
    Logger.error("Error logging invite creation:", error);
  }
}