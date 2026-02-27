const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "nickname",
  description: "Manage user nicknames",
  category: "moderation",
  permissions: [PermissionsBitField.Flags.ManageNicknames],
  botPermissions: [PermissionsBitField.Flags.ManageNicknames],
  
  data: new SlashCommandBuilder()
    .setName("nickname")
    .setDescription("Manage user nicknames")
    .addStringOption(option => 
      option.setName("action")
        .setDescription("What to do with the nickname")
        .setRequired(true)
        .addChoices(
          { name: "Set", value: "set" },
          { name: "Clear", value: "clear" },
          { name: "View", value: "view" }
        ))
    .addUserOption(option => 
      option.setName("user")
        .setDescription("The user to manage nickname for")
        .setRequired(true))
    .addStringOption(option => 
      option.setName("nickname")
        .setDescription("New nickname (required for set action)")
        .setRequired(false))
    .addStringOption(option => 
      option.setName("reason")
        .setDescription("Reason for the nickname change")
        .setRequired(false)),
  
  async execute(interaction, client) {
    const action = interaction.options.getString("action");
    const user = interaction.options.getUser("user");
    const nickname = interaction.options.getString("nickname");
    const reason = interaction.options.getString("reason") || "No reason provided";
    
    const member = interaction.guild.members.cache.get(user.id);
    
    if (!member) {
      return interaction.reply({
        content: "That user is not in this server.",
        ephemeral: true
      });
    }
    
    if (!member.manageable) {
      return interaction.reply({
        content: "I cannot change that user's nickname. They may have higher permissions than me.",
        ephemeral: true
      });
    }
    
    try {
      if (action === "view") {
        const currentNickname = member.nickname || "None";
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.info)
          .setTitle("Nickname Information")
          .setDescription(`Current nickname for ${user.tag}`)
          .addFields(
            { name: "User", value: `${user.tag} (${user.id})`, inline: true },
            { name: "Current Nickname", value: currentNickname, inline: true },
            { name: "Username", value: user.username, inline: true }
          )
          .setThumbnail(user.displayAvatarURL({ dynamic: true }))
          .setFooter({ text: `Requested by ${interaction.user.tag}` })
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed] });
      }
      
      if (action === "clear") {
        const oldNickname = member.nickname || user.username;
        
        await member.setNickname(null, `${interaction.user.tag}: ${reason}`);
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.success)
          .setTitle("Nickname Cleared")
          .setDescription(`${user.tag}'s nickname has been reset.`)
          .addFields(
            { name: "User", value: `${user.tag} (${user.id})`, inline: true },
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Old Nickname", value: oldNickname, inline: true },
            { name: "Reason", value: reason, inline: false }
          )
          .setFooter({ text: `Nickname cleared by ${interaction.user.tag}` })
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
        // Log the action
        await logNicknameAction(interaction.guild, client, {
          action: "CLEAR",
          user: user,
          moderator: interaction.user,
          reason: reason
        });
        
        return;
      }
      
      if (action === "set") {
        if (!nickname) {
          return interaction.reply({
            content: "Please provide a nickname when using the set action.",
            ephemeral: true
          });
        }
        
        if (nickname.length > 32) {
          return interaction.reply({
            content: "Nickname cannot be longer than 32 characters.",
            ephemeral: true
          });
        }
        
        const oldNickname = member.nickname || user.username;
        
        await member.setNickname(nickname, `${interaction.user.tag}: ${reason}`);
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.primary)
          .setTitle("Nickname Updated")
          .setDescription(`${user.tag}'s nickname has been changed.`)
          .addFields(
            { name: "User", value: `${user.tag} (${user.id})`, inline: true },
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Old Nickname", value: oldNickname, inline: true },
            { name: "New Nickname", value: nickname, inline: true },
            { name: "Reason", value: reason, inline: false }
          )
          .setFooter({ text: `Nickname set by ${interaction.user.tag}` })
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
        // Log the action
        await logNicknameAction(interaction.guild, client, {
          action: "SET",
          user: user,
          moderator: interaction.user,
          reason: reason,
          old: oldNickname,
          new: nickname
        });
      }
      
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error trying to manage the nickname.",
        ephemeral: true
      });
    }
  }
};

async function logNicknameAction(guild, client, data) {
  try {
    const settings = await client.getGuildSettings(guild.id);
    if (!settings?.moderation?.logChannel) return;
    
    const logChannel = guild.channels.cache.get(settings.moderation.logChannel);
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle(`👤 Nickname ${data.action}`)
      .addFields(
        { name: "User", value: `${data.user.tag} (${data.user.id})`, inline: true },
        { name: "Moderator", value: data.moderator.tag, inline: true },
        { name: "Reason", value: data.reason, inline: false }
      );
    
    if (data.old) {
      embed.addFields({ name: "Old Nickname", value: data.old, inline: true });
    }
    
    if (data.new) {
      embed.addFields({ name: "New Nickname", value: data.new, inline: true });
    }
    
    embed.setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (error) {
    console.error("Error logging nickname action:", error);
  }
}