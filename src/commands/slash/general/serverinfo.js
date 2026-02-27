const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require("discord.js");

module.exports = {
  name: "serverinfo",
  description: "Get server information",
  category: "general",
  cooldown: 5,
  
  data: new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Get server information"),
  
  async execute(interaction, client) {
    if (!interaction.guild) {
      return interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true
      });
    }
    
    const guild = interaction.guild;
    const owner = await guild.fetchOwner();
    
    // Count channels by type
    const textChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;
    const categoryChannels = guild.channels.cache.filter(c => c.type === ChannelType.GuildCategory).size;
    const threadChannels = guild.channels.cache.filter(c => 
      c.type === ChannelType.PublicThread || 
      c.type === ChannelType.PrivateThread
    ).size;
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle(`📊 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 1024 }))
      .addFields(
        {
          name: "General",
          value: [
            `**ID:** ${guild.id}`,
            `**Owner:** ${owner.user.tag}`,
            `**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
            `**Language:** ${guild.preferredLocale}`,
            `**Verification:** ${guild.verificationLevel}`
          ].join("\n"),
          inline: true
        },
        {
          name: "Statistics",
          value: [
            `**Members:** ${guild.memberCount}`,
            `**Bots:** ${guild.members.cache.filter(m => m.user.bot).size}`,
            `**Channels:** ${guild.channels.cache.size}`,
            `**Roles:** ${guild.roles.cache.size}`,
            `**Emojis:** ${guild.emojis.cache.size}`
          ].join("\n"),
          inline: true
        },
        {
          name: "Channels",
          value: [
            `**Text:** ${textChannels}`,
            `**Voice:** ${voiceChannels}`,
            `**Categories:** ${categoryChannels}`,
            `**Threads:** ${threadChannels}`
          ].join("\n"),
          inline: true
        },
        {
          name: "Boosts",
          value: [
            `**Tier:** ${guild.premiumTier}`,
            `**Boosts:** ${guild.premiumSubscriptionCount || 0}`,
            `**Boosters:** ${guild.members.cache.filter(m => m.premiumSince).size}`
          ].join("\n"),
          inline: true
        },
        {
          name: "Security",
          value: [
            `**Explicit Filter:** ${guild.explicitContentFilter}`,
            `**2FA Required:** ${guild.mfaLevel === 1 ? "Yes" : "No"}`,
            `**NSFW Level:** ${guild.nsfwLevel}`
          ].join("\n"),
          inline: true
        },
        {
          name: "Features",
          value: guild.features.map(f => `✅ ${f}`).join("\n") || "None",
          inline: false
        }
      )
      .setFooter({ 
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    
    if (guild.banner) {
      embed.setImage(guild.bannerURL({ size: 1024 }));
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};