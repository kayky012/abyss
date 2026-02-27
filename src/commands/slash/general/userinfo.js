const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "userinfo",
  description: "Get user information",
  category: "general",
  cooldown: 5,
  
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get user information")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to get information about")
        .setRequired(false)),
  
  async execute(interaction, client) {
    const user = interaction.options.getUser("user") || interaction.user;
    const member = interaction.guild?.members.cache.get(user.id);
    
    const embed = new EmbedBuilder()
      .setColor(member?.displayHexColor || client.colors.primary)
      .setTitle("👤 User Information")
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        {
          name: "User",
          value: `${user.tag} (${user.id})`,
          inline: false
        },
        {
          name: "Created",
          value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F> (<t:${Math.floor(user.createdTimestamp / 1000)}:R>)`,
          inline: true
        }
      )
      .setFooter({ 
        text: `Requested by ${interaction.user.tag}`,
        iconURL: interaction.user.displayAvatarURL()
      })
      .setTimestamp();
    
    if (member) {
      // Get important roles
      const importantRoles = member.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(r => r.toString());
      
      const rolesString = importantRoles.length > 10 
        ? importantRoles.slice(0, 10).join(", ") + ` and ${importantRoles.length - 10} more`
        : importantRoles.join(", ") || "None";
      
      // Get key permissions
      const keyPermissions = [];
      if (member.permissions.has("Administrator")) keyPermissions.push("Administrator");
      if (member.permissions.has("BanMembers")) keyPermissions.push("Ban Members");
      if (member.permissions.has("KickMembers")) keyPermissions.push("Kick Members");
      if (member.permissions.has("ManageMessages")) keyPermissions.push("Manage Messages");
      if (member.permissions.has("ManageRoles")) keyPermissions.push("Manage Roles");
      
      embed.addFields(
        {
          name: "Joined",
          value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F> (<t:${Math.floor(member.joinedTimestamp / 1000)}:R>)`,
          inline: true
        },
        {
          name: "Roles",
          value: rolesString,
          inline: false
        },
        {
          name: "Key Permissions",
          value: keyPermissions.join(", ") || "No key permissions",
          inline: false
        }
      );
      
      if (member.premiumSince) {
        embed.addFields({
          name: "Server Booster",
          value: `Since <t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>`,
          inline: true
        });
      }
      
      if (member.nickname) {
        embed.addFields({
          name: "Nickname",
          value: member.nickname,
          inline: true
        });
      }
    }
    
    await interaction.reply({ embeds: [embed] });
  }
};