const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");

module.exports = {
  name: "slowmode",
  description: "Manage channel slowmode",
  category: "moderation",
  permissions: [PermissionsBitField.Flags.ManageChannels],
  botPermissions: [PermissionsBitField.Flags.ManageChannels],
  
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Manage channel slowmode")
    .addStringOption(option => 
      option.setName("action")
        .setDescription("What to do with slowmode")
        .setRequired(true)
        .addChoices(
          { name: "Set", value: "set" },
          { name: "Disable", value: "disable" },
          { name: "View", value: "view" }
        ))
    .addIntegerOption(option => 
      option.setName("duration")
        .setDescription("Slowmode duration in seconds")
        .setRequired(false)
        .addChoices(
          { name: "5 seconds", value: 5 },
          { name: "10 seconds", value: 10 },
          { name: "15 seconds", value: 15 },
          { name: "30 seconds", value: 30 },
          { name: "1 minute", value: 60 },
          { name: "2 minutes", value: 120 },
          { name: "5 minutes", value: 300 },
          { name: "10 minutes", value: 600 },
          { name: "15 minutes", value: 900 },
          { name: "30 minutes", value: 1800 },
          { name: "1 hour", value: 3600 },
          { name: "2 hours", value: 7200 },
          { name: "6 hours", value: 21600 }
        ))
    .addChannelOption(option => 
      option.setName("channel")
        .setDescription("The channel to manage slowmode for")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false))
    .addStringOption(option => 
      option.setName("reason")
        .setDescription("Reason for the slowmode change")
        .setRequired(false)),
  
  async execute(interaction, client) {
    const action = interaction.options.getString("action");
    const duration = interaction.options.getInteger("duration");
    const channel = interaction.options.getChannel("channel") || interaction.channel;
    const reason = interaction.options.getString("reason") || "No reason provided";
    
    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "Slowmode can only be set on text channels.",
        ephemeral: true
      });
    }
    
    try {
      if (action === "view") {
        const currentSlowmode = channel.rateLimitPerUser;
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.info)
          .setTitle("Slowmode Information")
          .setDescription(`Current slowmode settings for ${channel}`)
          .addFields(
            { name: "Channel", value: channel.name, inline: true },
            { name: "Current Slowmode", value: currentSlowmode === 0 ? "Disabled" : `${currentSlowmode} seconds`, inline: true }
          )
          .setFooter({ text: `Requested by ${interaction.user.tag}` })
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed] });
      }
      
      if (action === "disable") {
        await channel.setRateLimitPerUser(0, `${interaction.user.tag}: ${reason}`);
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.success)
          .setTitle("Slowmode Disabled")
          .setDescription(`Slowmode has been disabled in ${channel}.`)
          .addFields(
            { name: "Channel", value: channel.name, inline: true },
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Reason", value: reason, inline: false }
          )
          .setFooter({ text: `Slowmode disabled by ${interaction.user.tag}` })
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
        // Log the action
        await logSlowmodeAction(interaction.guild, client, {
          action: "DISABLE",
          moderator: interaction.user,
          reason: reason,
          channel: channel.name
        });
        
        return;
      }
      
      if (action === "set") {
        if (!duration) {
          return interaction.reply({
            content: "Please specify a duration when setting slowmode.",
            ephemeral: true
          });
        }
        
        await channel.setRateLimitPerUser(duration, `${interaction.user.tag}: ${reason}`);
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.warning)
          .setTitle("Slowmode Updated")
          .setDescription(`Slowmode has been set in ${channel}.`)
          .addFields(
            { name: "Channel", value: channel.name, inline: true },
            { name: "Duration", value: `${duration} seconds`, inline: true },
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Reason", value: reason, inline: false }
          )
          .setFooter({ text: `Slowmode set by ${interaction.user.tag}` })
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
        // Log the action
        await logSlowmodeAction(interaction.guild, client, {
          action: "SET",
          moderator: interaction.user,
          reason: reason,
          channel: channel.name,
          duration: duration
        });
      }
      
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error trying to manage slowmode.",
        ephemeral: true
      });
    }
  }
};

async function logSlowmodeAction(guild, client, data) {
  try {
    const settings = await client.getGuildSettings(guild.id);
    if (!settings?.moderation?.logChannel) return;
    
    const logChannel = guild.channels.cache.get(settings.moderation.logChannel);
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.warning)
      .setTitle(`⏱️ Slowmode ${data.action}`)
      .addFields(
        { name: "Moderator", value: data.moderator.tag, inline: true },
        { name: "Channel", value: data.channel, inline: true },
        { name: "Reason", value: data.reason, inline: false }
      );
    
    if (data.duration) {
      embed.addFields({ name: "Duration", value: `${data.duration} seconds`, inline: true });
    }
    
    embed.setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (error) {
    console.error("Error logging slowmode action:", error);
  }
}