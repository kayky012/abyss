const { SlashCommandBuilder, EmbedBuilder, version } = require("discord.js");
const os = require("os");

module.exports = {
  name: "stats",
  description: "Show bot statistics",
  category: "general",
  cooldown: 10,
  
  data: new SlashCommandBuilder()
    .setName("stats")
    .setDescription("Show bot statistics"),
  
  async execute(interaction, client) {
    const stats = client.getBotStats();
    
    const totalMemory = os.totalmem() / 1024 / 1024 / 1024;
    const freeMemory = os.freemem() / 1024 / 1024 / 1024;
    const usedMemory = totalMemory - freeMemory;
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle("📊 ABYSS Statistics")
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        {
          name: "🤖 Bot Info",
          value: [
            `**Uptime:** ${stats.uptime}`,
            `**Ping:** ${stats.ping}ms`,
            `**Memory:** ${stats.memory} MB`,
            `**Node.js:** ${stats.nodeVersion}`,
            `**Discord.js:** v${version}`
          ].join("\n"),
          inline: true
        },
        {
          name: "📈 Server Stats",
          value: [
            `**Guilds:** ${stats.guilds}`,
            `**Users:** ${stats.users}`,
            `**Channels:** ${stats.channels}`
          ].join("\n"),
          inline: true
        },
        {
          name: "📝 Command Stats",
          value: [
            `**Slash:** ${stats.commands.slash}`,
            `**Prefix:** ${stats.commands.prefix}`
          ].join("\n"),
          inline: true
        },
        {
          name: "🖥️ System",
          value: [
            `**CPU:** ${os.cpus()[0].model}`,
            `**Cores:** ${os.cpus().length}`,
            `**RAM:** ${usedMemory.toFixed(2)}GB / ${totalMemory.toFixed(2)}GB`,
            `**Platform:** ${os.platform()} ${os.arch()}`
          ].join("\n"),
          inline: false
        },
        {
          name: "🛡️ Security Stats",
          value: [
            `**Raids Blocked:** ${stats.security?.raids || 0}`,
            `**Nuke Attempts:** ${stats.security?.nukes || 0}`,
            `**Spam Actions:** ${stats.security?.spam || 0}`,
            `**AutoMod Actions:** ${stats.security?.automod || 0}`
          ].join("\n"),
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