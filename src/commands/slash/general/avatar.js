const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");

module.exports = {
  name: "avatar",
  description: "Get user avatar",
  category: "general",
  cooldown: 3,
  
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Get user avatar")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to get avatar from")
        .setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser("user") || interaction.user;
    
    // Quality options
    const qualities = [
      { name: "4K: 4096px - Ultra HD", value: "4096", emoji: "📺" },
      { name: "2K: 2048px - Quad HD", value: "2048", emoji: "📱" },
      { name: "Full HD: 1024px", value: "1024", emoji: "🖥️" },
      { name: "HD: 512px", value: "512", emoji: "📲" },
      { name: "Standard: 256px", value: "256", emoji: "📸" },
      { name: "Thumbnail: 128px", value: "128", emoji: "🖼️" }
    ];
    
    // Create select menu
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId("avatar_quality")
      .setPlaceholder("Select image quality")
      .addOptions(
        qualities.map(q => ({
          label: q.name,
          value: q.value,
          emoji: q.emoji
        }))
      );
    
    const row = new ActionRowBuilder().addComponents(selectMenu);
    
    // Get format URLs
    const pngURL = user.displayAvatarURL({ extension: "png", size: 4096 });
    const jpgURL = user.displayAvatarURL({ extension: "jpg", size: 4096 });
    const webpURL = user.displayAvatarURL({ extension: "webp", size: 4096 });
    const gifURL = user.avatar?.startsWith("a_") ? user.displayAvatarURL({ extension: "gif", size: 4096 }) : null;
    
    const embed = new EmbedBuilder()
      .setColor(user.accentColor || client.colors.primary)
      .setAuthor({ 
        name: user.tag, 
        iconURL: user.displayAvatarURL({ dynamic: true, size: 32 })
      })
      .setTitle("🖼️ Avatar")
      .setDescription(`Select a quality option for ${user.username}'s avatar`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        {
          name: "📥 Download Links",
          value: [
            `[PNG](${pngURL})`,
            `[JPG](${jpgURL})`,
            `[WEBP](${webpURL})`,
            gifURL ? `[GIF](${gifURL})` : ""
          ].filter(Boolean).join(" • "),
          inline: false
        }
      )
      .setFooter({ 
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    
    const response = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });
    
    // Create collector
    const collector = response.createMessageComponentCollector({
      filter: i => i.user.id === interaction.user.id,
      time: 60000
    });
    
    collector.on("collect", async (i) => {
      const size = parseInt(i.values[0]);
      const qualityName = qualities.find(q => q.value === i.values[0])?.name;
      
      const updatedEmbed = new EmbedBuilder()
        .setColor(user.accentColor || client.colors.primary)
        .setAuthor({ 
          name: user.tag, 
          iconURL: user.displayAvatarURL({ dynamic: true, size: 32 })
        })
        .setTitle("🖼️ Avatar")
        .setDescription(`**Quality:** ${qualityName}`)
        .setImage(user.displayAvatarURL({ dynamic: true, size: size }))
        .addFields(
          {
            name: "📊 Resolution",
            value: `${size}x${size}px`,
            inline: true
          },
          {
            name: "📥 Download Links",
            value: [
              `[PNG](${pngURL})`,
              `[JPG](${jpgURL})`,
              `[WEBP](${webpURL})`,
              gifURL ? `[GIF](${gifURL})` : ""
            ].filter(Boolean).join(" • "),
            inline: false
          }
        )
        .setFooter({ 
          text: `Requested by ${interaction.user.tag} • Quality: ${size}px`,
          iconURL: interaction.user.displayAvatarURL()
        })
        .setTimestamp();
      
      await i.update({ embeds: [updatedEmbed], components: [row] });
    });
    
    collector.on("end", async () => {
      const disabledRow = new ActionRowBuilder().addComponents(
        StringSelectMenuBuilder.from(selectMenu).setDisabled(true)
      );
      await interaction.editReply({ components: [disabledRow] }).catch(() => {});
    });
  }
};