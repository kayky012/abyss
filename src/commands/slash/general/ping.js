const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "ping",
  description: "Check bot latency",
  category: "general",
  cooldown: 5,
  
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency"),
  
  async execute(interaction, client) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true
    });
    
    const wsPing = client.ws.ping;
    const roundtrip = sent.createdTimestamp - interaction.createdTimestamp;
    
    let color = client.colors.success;
    let emoji = "🟢";
    
    if (wsPing > 200) {
      color = client.colors.warning;
      emoji = "🟡";
    }
    if (wsPing > 400) {
      color = client.colors.error;
      emoji = "🔴";
    }
    
    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`${emoji} Pong!`)
      .addFields(
        { 
          name: "WebSocket Heartbeat", 
          value: `\`\`\`${wsPing}ms\`\`\``, 
          inline: true 
        },
        { 
          name: "Roundtrip Latency", 
          value: `\`\`\`${roundtrip}ms\`\`\``, 
          inline: true 
        },
        { 
          name: "Uptime", 
          value: `\`\`\`${client.getFormattedUptime()}\`\`\``, 
          inline: true 
        }
      )
      .setFooter({ 
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    
    await interaction.editReply({ content: null, embeds: [embed] });
  }
};