const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "uptime",
  description: "Show bot uptime",
  category: "general",
  cooldown: 5,
  
  data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Show bot uptime"),
  
  async execute(interaction, client) {
    const uptime = client.getFormattedUptime();
    const startTime = client.startTime;
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle("⏱️ Bot Uptime")
      .addFields(
        {
          name: "Current Uptime",
          value: `\`\`\`${uptime}\`\`\``,
          inline: false
        },
        {
          name: "Started At",
          value: `<t:${Math.floor(startTime / 1000)}:F>`,
          inline: true
        },
        {
          name: "Started (Relative)",
          value: `<t:${Math.floor(startTime / 1000)}:R>`,
          inline: true
        }
      )
      .setFooter({ 
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};