const Logger = require("../utils/logger.js");
const PermissionChecker = require("../utils/permissions.js");
const { EmbedBuilder, InteractionType } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  async execute(interaction, client) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      await handleSlashCommand(interaction, client);
    }
    
    // Handle buttons
    else if (interaction.isButton()) {
      await handleButton(interaction, client);
    }
    
    // Handle select menus
    else if (interaction.isStringSelectMenu()) {
      await handleSelectMenu(interaction, client);
    }
    
    // Handle modals
    else if (interaction.type === InteractionType.ModalSubmit) {
      await handleModal(interaction, client);
    }
    
    // Handle context menu commands
    else if (interaction.isUserContextMenuCommand() || interaction.isMessageContextMenuCommand()) {
      await handleContextCommand(interaction, client);
    }
  }
};

async function handleSlashCommand(interaction, client) {
  const command = client.slashCommands.get(interaction.commandName);
  
  if (!command) {
    return interaction.reply({
      content: "Command not found.",
      ephemeral: true
    }).catch(() => {});
  }
  
  // Check permissions
  if (command.permissions && interaction.member) {
    const missing = PermissionChecker.missingPermissions(interaction.member, command.permissions);
    if (missing.length > 0) {
      return interaction.reply({
        content: `You need: ${PermissionChecker.formatPermissionList(missing)}`,
        ephemeral: true
      });
    }
  }
  
  // Check bot permissions
  if (command.botPermissions && interaction.guild) {
    const missing = PermissionChecker.missingPermissions(interaction.guild.members.me, command.botPermissions);
    if (missing.length > 0) {
      return interaction.reply({
        content: `I need: ${PermissionChecker.formatPermissionList(missing)}`,
        ephemeral: true
      });
    }
  }
  
  // Check owner only
  if (command.ownerOnly && !client.isOwner(interaction.user.id)) {
    return interaction.reply({
      content: "This command is only for bot owners.",
      ephemeral: true
    });
  }
  
  // Check cooldown
  if (command.cooldown) {
    const cooldownKey = `${interaction.user.id}-${command.name}`;
    const cooldown = client.cooldowns?.get(cooldownKey);
    
    if (cooldown && cooldown > Date.now()) {
      const remaining = Math.ceil((cooldown - Date.now()) / 1000);
      return interaction.reply({
        content: `Please wait ${remaining} seconds before using this command again.`,
        ephemeral: true
      });
    }
  }
  
  // Log command usage
  Logger.command(
    command.name,
    interaction.user.id,
    interaction.user.tag,
    interaction.guild?.id || "DM",
    interaction.guild?.name || "Direct Message"
  );
  
  try {
    await command.execute(interaction, client);
    
    // Set cooldown
    if (command.cooldown && client.cooldowns) {
      const cooldownKey = `${interaction.user.id}-${command.name}`;
      client.cooldowns.set(cooldownKey, Date.now() + (command.cooldown * 1000));
    }
    
  } catch (error) {
    Logger.error(`Error executing command ${command.name}:`, error);
    
    const errorMessage = "An error occurred while executing this command.";
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ content: errorMessage, ephemeral: true }).catch(() => {});
    }
  }
}

async function handleButton(interaction, client) {
  const customId = interaction.customId;
  
  // Handle verification buttons
  if (customId === "verify") {
    await handleVerifyButton(interaction, client);
  }
  
  // Handle role buttons
  else if (customId.startsWith("role_")) {
    await handleRoleButton(interaction, client);
  }
  
  // Handle pagination buttons
  else if (["first", "previous", "next", "last"].includes(customId)) {
    // Handled by pagination system
    return;
  }
}

async function handleVerifyButton(interaction, client) {
  try {
    const member = interaction.member;
    const guild = interaction.guild;
    
    const settings = await client.getGuildSettings(guild.id);
    if (!settings?.verification?.enabled) {
      return interaction.reply({
        content: "Verification is not enabled in this server.",
        ephemeral: true
      });
    }
    
    const roleId = settings.verification.role;
    if (roleId) {
      await member.roles.add(roleId);
    }
    
    // Update verification record
    if (client.schemas?.verificationSchema) {
      await client.schemas.verificationSchema.findOneAndUpdate(
        { userId: member.id, guildId: guild.id },
        { verified: true, verifiedAt: new Date() }
      );
    }
    
    // Remove from cache
    client.verificationCache?.delete(member.id);
    
    await interaction.reply({
      content: "✅ You have been verified!",
      ephemeral: true
    });
    
  } catch (error) {
    Logger.error("Error in verify button:", error);
    await interaction.reply({
      content: "An error occurred during verification.",
      ephemeral: true
    });
  }
}

async function handleRoleButton(interaction, client) {
  try {
    const roleId = interaction.customId.replace("role_", "");
    const member = interaction.member;
    
    if (member.roles.cache.has(roleId)) {
      await member.roles.remove(roleId);
      await interaction.reply({
        content: "Role removed.",
        ephemeral: true
      });
    } else {
      await member.roles.add(roleId);
      await interaction.reply({
        content: "Role added.",
        ephemeral: true
      });
    }
    
  } catch (error) {
    Logger.error("Error in role button:", error);
    await interaction.reply({
      content: "An error occurred.",
      ephemeral: true
    });
  }
}

async function handleSelectMenu(interaction, client) {
  // Handle select menu interactions
  await interaction.reply({
    content: "Select menu received.",
    ephemeral: true
  });
}

async function handleModal(interaction, client) {
  // Handle modal submissions
  await interaction.reply({
    content: "Form submitted.",
    ephemeral: true
  });
}

async function handleContextCommand(interaction, client) {
  const command = client.slashCommands.get(interaction.commandName);
  
  if (!command) return;
  
  try {
    await command.execute(interaction, client);
  } catch (error) {
    Logger.error(`Error executing context command ${command.name}:`, error);
  }
}