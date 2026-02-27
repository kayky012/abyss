const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require("discord.js");

module.exports = {
  name: "lockdown",
  description: "Lock or unlock a channel",
  category: "moderation",
  permissions: [PermissionsBitField.Flags.ManageChannels],
  botPermissions: [PermissionsBitField.Flags.ManageChannels],
  
  data: new SlashCommandBuilder()
    .setName("lockdown")
    .setDescription("Lock or unlock a channel")
    .addStringOption(option => 
      option.setName("action")
        .setDescription("What to do with lockdown")
        .setRequired(true)
        .addChoices(
          { name: "Lock", value: "lock" },
          { name: "Unlock", value: "unlock" },
          { name: "Lock All", value: "lockall" },
          { name: "Unlock All", value: "unlockall" },
          { name: "Status", value: "status" }
        ))
    .addChannelOption(option => 
      option.setName("channel")
        .setDescription("The channel to lock/unlock")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false))
    .addStringOption(option => 
      option.setName("reason")
        .setDescription("Reason for the action")
        .setRequired(false)),
  
  async execute(interaction, client) {
    const action = interaction.options.getString("action");
    const channel = interaction.options.getChannel("channel") || interaction.channel;
    const reason = interaction.options.getString("reason") || "No reason provided";
    
    if (channel.type !== ChannelType.GuildText) {
      return interaction.reply({
        content: "This command can only be used on text channels.",
        ephemeral: true
      });
    }
    
    await interaction.deferReply();
    
    try {
      if (action === "status") {
        const permissions = channel.permissionOverwrites.cache.get(interaction.guild.id);
        const isLocked = permissions ? !permissions.allow.has(PermissionsBitField.Flags.SendMessages) : false;
        
        const embed = new EmbedBuilder()
          .setColor(isLocked ? client.colors.error : client.colors.success)
          .setTitle("Lockdown Status")
          .setDescription(`Current lockdown status for ${channel}`)
          .addFields(
            { name: "Channel", value: channel.name, inline: true },
            { name: "Status", value: isLocked ? "🔒 Locked" : "🔓 Unlocked", inline: true }
          )
          .setFooter({ text: `Requested by ${interaction.user.tag}` })
          .setTimestamp();
        
        return await interaction.editReply({ embeds: [embed] });
      }
      
      if (action === "lockall") {
        const channels = interaction.guild.channels.cache.filter(c => 
          c.type === ChannelType.GuildText &&
          c.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)
        );
        
        let locked = 0;
        let failed = 0;
        
        for (const [, ch] of channels) {
          try {
            await ch.permissionOverwrites.edit(interaction.guild.id, {
              SendMessages: false
            });
            locked++;
          } catch {
            failed++;
          }
        }
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.error)
          .setTitle("Server Lockdown Initiated")
          .setDescription(`All text channels have been locked.`)
          .addFields(
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Channels Locked", value: `${locked}`, inline: true },
            { name: "Failed", value: `${failed}`, inline: true },
            { name: "Reason", value: reason, inline: false }
          )
          .setFooter({ text: `Server locked by ${interaction.user.tag}` })
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        
        // Log the action
        await logLockdownAction(interaction.guild, client, {
          action: "LOCK ALL",
          moderator: interaction.user,
          reason: reason,
          count: locked
        });
        
        return;
      }
      
      if (action === "unlockall") {
        const channels = interaction.guild.channels.cache.filter(c => 
          c.type === ChannelType.GuildText &&
          c.permissionsFor(interaction.guild.members.me).has(PermissionsBitField.Flags.ManageChannels)
        );
        
        let unlocked = 0;
        let failed = 0;
        
        for (const [, ch] of channels) {
          try {
            await ch.permissionOverwrites.edit(interaction.guild.id, {
              SendMessages: null
            });
            unlocked++;
          } catch {
            failed++;
          }
        }
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.success)
          .setTitle("Server Unlocked")
          .setDescription(`All text channels have been unlocked.`)
          .addFields(
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Channels Unlocked", value: `${unlocked}`, inline: true },
            { name: "Failed", value: `${failed}`, inline: true },
            { name: "Reason", value: reason, inline: false }
          )
          .setFooter({ text: `Server unlocked by ${interaction.user.tag}` })
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        
        // Log the action
        await logLockdownAction(interaction.guild, client, {
          action: "UNLOCK ALL",
          moderator: interaction.user,
          reason: reason,
          count: unlocked
        });
        
        return;
      }
      
      if (action === "lock") {
        await channel.permissionOverwrites.edit(interaction.guild.id, {
          SendMessages: false
        });
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.error)
          .setTitle("Channel Locked")
          .setDescription(`${channel} has been locked.`)
          .addFields(
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Reason", value: reason, inline: true }
          )
          .setFooter({ text: `Locked by ${interaction.user.tag}` })
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        
        // Send lock message in channel
        await channel.send(`🔒 This channel has been locked by ${interaction.user.tag}. Reason: ${reason}`);
        
        // Log the action
        await logLockdownAction(interaction.guild, client, {
          action: "LOCK",
          moderator: interaction.user,
          reason: reason,
          channel: channel.name
        });
        
      } else if (action === "unlock") {
        await channel.permissionOverwrites.edit(interaction.guild.id, {
          SendMessages: null
        });
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.success)
          .setTitle("Channel Unlocked")
          .setDescription(`${channel} has been unlocked.`)
          .addFields(
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Reason", value: reason, inline: true }
          )
          .setFooter({ text: `Unlocked by ${interaction.user.tag}` })
          .setTimestamp();
        
        await interaction.editReply({ embeds: [embed] });
        
        // Send unlock message in channel
        await channel.send(`🔓 This channel has been unlocked by ${interaction.user.tag}. Reason: ${reason}`);
        
        // Log the action
        await logLockdownAction(interaction.guild, client, {
          action: "UNLOCK",
          moderator: interaction.user,
          reason: reason,
          channel: channel.name
        });
      }
      
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: "There was an error trying to manage lockdown."
      });
    }
  }
};

async function logLockdownAction(guild, client, data) {
  try {
    const settings = await client.getGuildSettings(guild.id);
    if (!settings?.moderation?.logChannel) return;
    
    const logChannel = guild.channels.cache.get(settings.moderation.logChannel);
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor(data.action.includes("LOCK") ? client.colors.error : client.colors.success)
      .setTitle(`🔒 ${data.action}`)
      .addFields(
        { name: "Moderator", value: data.moderator.tag, inline: true },
        { name: "Reason", value: data.reason, inline: false }
      );
    
    if (data.channel) {
      embed.addFields({ name: "Channel", value: data.channel, inline: true });
    }
    
    if (data.count) {
      embed.addFields({ name: "Channels Affected", value: data.count.toString(), inline: true });
    }
    
    embed.setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (error) {
    console.error("Error logging lockdown action:", error);
  }
}