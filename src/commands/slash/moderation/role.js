const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");

module.exports = {
  name: "role",
  description: "Manage user roles",
  category: "moderation",
  permissions: [PermissionsBitField.Flags.ManageRoles],
  botPermissions: [PermissionsBitField.Flags.ManageRoles],
  
  data: new SlashCommandBuilder()
    .setName("role")
    .setDescription("Manage user roles")
    .addStringOption(option => 
      option.setName("action")
        .setDescription("Whether to add or remove a role")
        .setRequired(true)
        .addChoices(
          { name: "Add", value: "add" },
          { name: "Remove", value: "remove" },
          { name: "List", value: "list" }
        ))
    .addUserOption(option => 
      option.setName("user")
        .setDescription("The user to manage role for")
        .setRequired(false))
    .addRoleOption(option => 
      option.setName("role")
        .setDescription("The role to add or remove")
        .setRequired(false))
    .addStringOption(option => 
      option.setName("reason")
        .setDescription("Reason for the role change")
        .setRequired(false)),
  
  async execute(interaction, client) {
    const action = interaction.options.getString("action");
    const user = interaction.options.getUser("user");
    const role = interaction.options.getRole("role");
    const reason = interaction.options.getString("reason") || "No reason provided";
    
    // Handle list action
    if (action === "list") {
      const targetUser = user || interaction.user;
      const member = interaction.guild.members.cache.get(targetUser.id);
      
      if (!member) {
        return interaction.reply({
          content: "That user is not in this server.",
          ephemeral: true
        });
      }
      
      const roles = member.roles.cache
        .filter(r => r.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(r => r.toString());
      
      const embed = new EmbedBuilder()
        .setColor(client.colors.info)
        .setTitle(`Roles for ${targetUser.tag}`)
        .setDescription(roles.join("\n") || "No roles")
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: `Total: ${roles.length} roles` })
        .setTimestamp();
      
      return await interaction.reply({ embeds: [embed] });
    }
    
    // For add/remove, we need both user and role
    if (!user || !role) {
      return interaction.reply({
        content: "Please provide both a user and a role.",
        ephemeral: true
      });
    }
    
    const member = interaction.guild.members.cache.get(user.id);
    
    if (!member) {
      return interaction.reply({
        content: "That user is not in this server.",
        ephemeral: true
      });
    }
    
    // Check role hierarchy
    if (interaction.member.roles.highest.position <= role.position && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({
        content: "You cannot manage this role as it is higher than or equal to your highest role.",
        ephemeral: true
      });
    }
    
    if (interaction.guild.members.me.roles.highest.position <= role.position) {
      return interaction.reply({
        content: "I cannot manage this role as it is higher than or equal to my highest role.",
        ephemeral: true
      });
    }
    
    try {
      if (action === "add") {
        if (member.roles.cache.has(role.id)) {
          return interaction.reply({
            content: `${user.tag} already has the ${role.name} role.`,
            ephemeral: true
          });
        }
        
        await member.roles.add(role, `${interaction.user.tag}: ${reason}`);
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.success)
          .setTitle("Role Added")
          .setDescription(`Added ${role} role to ${user.tag}.`)
          .addFields(
            { name: "User", value: `${user.tag} (${user.id})`, inline: true },
            { name: "Role", value: role.name, inline: true },
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Reason", value: reason, inline: false }
          )
          .setFooter({ text: `Role added by ${interaction.user.tag}` })
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
        // Log the action
        await logRoleAction(interaction.guild, client, {
          action: "ADD",
          user: user,
          role: role,
          moderator: interaction.user,
          reason: reason
        });
        
      } else if (action === "remove") {
        if (!member.roles.cache.has(role.id)) {
          return interaction.reply({
            content: `${user.tag} does not have the ${role.name} role.`,
            ephemeral: true
          });
        }
        
        await member.roles.remove(role, `${interaction.user.tag}: ${reason}`);
        
        const embed = new EmbedBuilder()
          .setColor(client.colors.warning)
          .setTitle("Role Removed")
          .setDescription(`Removed ${role} role from ${user.tag}.`)
          .addFields(
            { name: "User", value: `${user.tag} (${user.id})`, inline: true },
            { name: "Role", value: role.name, inline: true },
            { name: "Moderator", value: interaction.user.tag, inline: true },
            { name: "Reason", value: reason, inline: false }
          )
          .setFooter({ text: `Role removed by ${interaction.user.tag}` })
          .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
        
        // Log the action
        await logRoleAction(interaction.guild, client, {
          action: "REMOVE",
          user: user,
          role: role,
          moderator: interaction.user,
          reason: reason
        });
      }
      
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error trying to manage the role.",
        ephemeral: true
      });
    }
  }
};

async function logRoleAction(guild, client, data) {
  try {
    const settings = await client.getGuildSettings(guild.id);
    if (!settings?.moderation?.logChannel) return;
    
    const logChannel = guild.channels.cache.get(settings.moderation.logChannel);
    if (!logChannel) return;
    
    const embed = new EmbedBuilder()
      .setColor(data.action === "ADD" ? client.colors.success : client.colors.warning)
      .setTitle(`👔 Role ${data.action}`)
      .addFields(
        { name: "User", value: `${data.user.tag} (${data.user.id})`, inline: true },
        { name: "Role", value: data.role.name, inline: true },
        { name: "Moderator", value: data.moderator.tag, inline: true },
        { name: "Reason", value: data.reason, inline: false }
      )
      .setTimestamp();
    
    await logChannel.send({ embeds: [embed] }).catch(() => {});
  } catch (error) {
    console.error("Error logging role action:", error);
  }
}