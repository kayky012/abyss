const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  name: "warn",
  description: "Warn a user",
  category: "moderation",
  permissions: [PermissionsBitField.Flags.ModerateMembers],
  
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a user")
    .addUserOption(option => 
      option.setName("user")
        .setDescription("The user to warn")
        .setRequired(true))
    .addStringOption(option => 
      option.setName("reason")
        .setDescription("Reason for the warning")
        .setRequired(true)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    
    const member = interaction.guild.members.cache.get(user.id);
    
    // Validation checks
    if (!member) {
      return interaction.reply({
        content: "That user is not in this server.",
        ephemeral: true
      });
    }
    
    if (user.id === interaction.user.id) {
      return interaction.reply({
        content: "You cannot warn yourself.",
        ephemeral: true
      });
    }
    
    try {
      const warnId = uuidv4().substring(0, 8).toUpperCase();
      
      // Save to database
      if (client.schemas?.warnSchema) {
        await new client.schemas.warnSchema({
          warnId: warnId,
          guildId: interaction.guild.id,
          userId: user.id,
          userTag: user.tag,
          moderatorId: interaction.user.id,
          moderatorTag: interaction.user.tag,
          reason: reason
        }).save();
      }
      
      // Update user warnings in user schema
      if (client.schemas?.userSchema) {
        await client.schemas.userSchema.findOneAndUpdate(
          { id: user.id },
          { 
            $push: { 
              warnings: {
                warnId: warnId,
                guildId: interaction.guild.id,
                reason: reason,
                moderatorId: interaction.user.id,
                moderatorTag: interaction.user.tag,
                timestamp: new Date()
              }
            }
          },
          { upsert: true }
        );
      }
      
      const embed = new EmbedBuilder()
        .setColor(client.colors.warning)
        .setTitle("User Warned")
        .setDescription(`${user.tag} has been warned.`)
        .addFields(
          { name: "User", value: `${user.tag} (${user.id})`, inline: true },
          { name: "Moderator", value: interaction.user.tag, inline: true },
          { name: "Warn ID", value: warnId, inline: true },
          { name: "Reason", value: reason, inline: false }
        )
        .setFooter({ text: `Warned by ${interaction.user.tag}` })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
      // Try to DM the user
      try {
        const dmEmbed = new EmbedBuilder()
          .setColor(client.colors.warning)
          .setTitle(`You have been warned in ${interaction.guild.name}`)
          .addFields(
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Reason", value: reason, inline: false },
            { name: "Warn ID", value: warnId, inline: true }
          )
          .setTimestamp();
        
        await user.send({ embeds: [dmEmbed] }).catch(() => {});
      } catch (dmError) {
        // User has DMs disabled, ignore
      }
      
      // Log to moderation channel
      await logModAction(interaction.guild, client, {
        action: "WARN",
        user: user,
        moderator: interaction.user,
        reason: reason,
        details: `Warn ID: ${warnId}`
      });
      
      // Check if user has reached max warnings
      await checkAutoPunish(interaction.guild, user, client);
      
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error trying to warn that user.",
        ephemeral: true
      });
    }
  }
};

async function logModAction(guild, client, data) {
  try {
    const settings = await client.getGuildSettings(guild.id);
    if (!settings?.moderation?.logChannel) return;
    
    const logChannel = guild.channels.cache.get(settings.moderation.logChannel);
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.warning)
      .setTitle(`⚠️ ${data.action}`)
      .addFields(
        { name: "User", value: `${data.user.tag} (${data.user.id})`, inline: true },
        { name: "Moderator", value: data.moderator.tag, inline: true },
        { name: "Reason", value: data.reason, inline: false }
      );
    
    if (data.details) {
      embed.addFields({ name: "Details", value: data.details, inline: false });
    }
    
    embed.setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (error) {
    console.error("Error logging mod action:", error);
  }
}

async function checkAutoPunish(guild, user, client) {
  try {
    const settings = await client.getGuildSettings(guild.id);
    if (!settings?.moderation?.maxWarns) return;
    
    const warnCount = await client.schemas?.warnSchema?.countDocuments({
      guildId: guild.id,
      userId: user.id,
      active: true
    });
    
    if (warnCount >= settings.moderation.maxWarns) {
      const action = settings.moderation.punishAction || "mute";
      const member = await guild.members.fetch(user.id).catch(() => null);
      
      if (!member) return;
      
      switch (action) {
        case "mute":
          await member.timeout(3600000, "Auto-punishment: Max warnings reached");
          break;
        case "kick":
          await member.kick("Auto-punishment: Max warnings reached");
          break;
        case "ban":
          await member.ban({ reason: "Auto-punishment: Max warnings reached" });
          break;
      }
      
      // Log auto-punishment
      const logChannel = guild.channels.cache.get(settings.moderation.logChannel);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor(client.colors.error)
          .setTitle("Auto Punishment Applied")
          .setDescription(`${user.tag} has been auto-${action}ed for reaching ${warnCount} warnings.`)
          .setTimestamp();
        
        await logChannel.send({ embeds: [embed] }).catch(() => {});
      }
    }
  } catch (error) {
    console.error("Error checking auto punish:", error);
  }
}