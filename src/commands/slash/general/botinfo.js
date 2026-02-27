const { SlashCommandBuilder, EmbedBuilder, version } = require("discord.js");
const os = require("os");

module.exports = {
  name: "botinfo",
  description: "Get bot information",
  category: "general",
  cooldown: 5,
  
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("Get bot information"),
  
  async execute(interaction, client) {
    const stats = client.getBotStats();
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle(`🤖 ${client.user.username} Information`)
      .setThumbnail(client.user.displayAvatarURL({ size: 1024 }))
      .addFields(
        {
          name: "Bot Info",
          value: [
            `**Name:** ${client.user.tag}`,
            `**ID:** ${client.user.id}`,
            `**Created:** <t:${Math.floor(client.user.createdTimestamp / 1000)}:R>`,
            `**Developer:** ABYSS Team`,
            `**Library:** Discord.js v${version}`
          ].join("\n"),
          inline: true
        },
        {
          name: "Statistics",
          value: [
            `**Guilds:** ${stats.guilds}`,
            `**Users:** ${stats.users}`,
            `**Commands:** ${stats.commands.slash}`,
            `**Uptime:** ${stats.uptime}`,
            `**Ping:** ${stats.ping}ms`
          ].join("\n"),
          inline: true
        },
        {
          name: "System",
          value: [
            `**Node.js:** ${stats.nodeVersion}`,
            `**Memory:** ${stats.memory} MB`,
            `**CPU:** ${os.cpus()[0].model.split(" ").slice(0, 3).join(" ")}`,
            `**OS:** ${os.platform()} ${os.arch()}`
          ].join("\n"),
          inline: false
        },
        {
          name: "Features",
          value: [
            "✅ Anti-Raid Protection",
            "✅ Anti-Nuke Protection",
            "✅ Anti-Spam System",
            "✅ Auto-Moderation",
            "✅ Captcha Verification",
            "✅ Canvas Welcome/Goodbye",
            "✅ Full Logging System"
          ].join("\n"),
          inline: true
        },
        {
          name: "Links",
          value: `[Invite](${client.config.botInvite}) | [Support](${client.config.supportServer})`,
          inline: true
        }
      )
      .setFooter({ 
        text: `ABYSS v1.0.0 • Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};