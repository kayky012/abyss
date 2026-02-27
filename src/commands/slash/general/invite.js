const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
  name: "invite",
  description: "Get bot invite link",
  category: "general",
  cooldown: 3,
  
  data: new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Get bot invite link"),
  
  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle("📨 Invite ABYSS")
      .setDescription("Add ABYSS to your server and secure your community!")
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: "Permissions",
          value: "ABYSS requires the following permissions:\n`Administrator`, `Manage Messages`, `Ban Members`, `Kick Members`, `Manage Roles`",
          inline: false
        },
        {
          name: "Features",
          value: "• Anti-Raid & Anti-Nuke\n• Auto-Moderation\n• Captcha Verification\n• Canvas Welcome/Goodbye\n• Full Logging System",
          inline: false
        }
      )
      .setFooter({ 
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel("Invite Bot")
          .setURL(client.config.botInvite)
          .setStyle(ButtonStyle.Link)
          .setEmoji("🤖"),
        new ButtonBuilder()
          .setLabel("Support Server")
          .setURL(client.config.supportServer)
          .setStyle(ButtonStyle.Link)
          .setEmoji("❓"),
        new ButtonBuilder()
          .setLabel("Website")
          .setURL(client.config.website || "https://abyssbot.xyz")
          .setStyle(ButtonStyle.Link)
          .setEmoji("🌐")
      );
    
    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  }
};