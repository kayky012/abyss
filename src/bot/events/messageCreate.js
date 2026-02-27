const Logger = require("../utils/logger.js");
const PermissionChecker = require("../utils/permissions.js");
const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "messageCreate",
  async execute(message, client) {
    // Ignore bot messages
    if (message.author.bot) return;
    
    // Cache message for deletion logs
    if (message.guild) {
      if (!client.messageCache) client.messageCache = new Map();
      client.messageCache.set(message.id, {
        content: message.content,
        authorId: message.author.id,
        authorTag: message.author.tag,
        channelId: message.channel.id,
        timestamp: Date.now()
      });
      
      // Keep only last 100 messages
      if (client.messageCache.size > 100) {
        const firstKey = client.messageCache.keys().next().value;
        client.messageCache.delete(firstKey);
      }
    }
    
    // Run safety checks
    await runSafetyChecks(message, client);
    
    // Handle prefix commands
    await handlePrefixCommand(message, client);
  }
};

async function runSafetyChecks(message, client) {
  if (!message.guild) return;
  
  const settings = await client.getGuildSettings(message.guild.id);
  if (!settings) return;
  
  // Anti-spam check
  if (settings.security?.antiSpamEnabled && client.antiSpam) {
    const isSpam = await client.antiSpam.handleMessage(message);
    if (isSpam) return;
  }
  
  // Auto-mod check
  if (settings.security?.autoModEnabled && client.autoMod) {
    await client.autoMod.checkMessage(message);
  }
  
  // Check for blacklisted words
  if (client.blacklistedWords?.size > 0) {
    const content = message.content.toLowerCase();
    for (const word of client.blacklistedWords) {
      if (content.includes(word.toLowerCase())) {
        await message.delete().catch(() => {});
        
        Logger.security("BLACKLIST", message.author.id, `Blacklisted word: ${word}`, "delete");
        
        const warning = await message.channel.send(
          `${message.author}, that word is blacklisted.`
        ).catch(() => {});
        
        setTimeout(() => warning?.delete().catch(() => {}), 3000);
        break;
      }
    }
  }
}

async function handlePrefixCommand(message, client) {
  const prefix = client.config.prefix || "!";
  
  if (!message.content.startsWith(prefix)) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  const command = client.prefixCommands.get(commandName);
  
  if (!command) return;
  
  // Check if command is disabled in guild
  if (message.guild) {
    const settings = await client.getGuildSettings(message.guild.id);
    if (settings?.settings?.disabledCommands?.includes(command.name)) {
      return message.reply("This command is disabled in this server.");
    }
  }
  
  // Check permissions
  if (command.permissions && message.member) {
    const missing = PermissionChecker.missingPermissions(message.member, command.permissions);
    if (missing.length > 0) {
      return message.reply(
        `You need: ${PermissionChecker.formatPermissionList(missing)}`
      );
    }
  }
  
  // Check bot permissions
  if (command.botPermissions && message.guild) {
    const missing = PermissionChecker.missingPermissions(
      message.guild.members.me, 
      command.botPermissions
    );
    if (missing.length > 0) {
      return message.reply(
        `I need: ${PermissionChecker.formatPermissionList(missing)}`
      );
    }
  }
  
  // Check owner only
  if (command.ownerOnly && !client.isOwner(message.author.id)) {
    return message.reply("This command is only for bot owners.");
  }
  
  // Check cooldown
  if (command.cooldown) {
    const cooldownKey = `${message.author.id}-${command.name}`;
    const cooldown = client.cooldowns?.get(cooldownKey);
    
    if (cooldown && cooldown > Date.now()) {
      const remaining = Math.ceil((cooldown - Date.now()) / 1000);
      return message.reply(`Please wait ${remaining} seconds.`);
    }
  }
  
  // Log command usage
  Logger.command(
    command.name,
    message.author.id,
    message.author.tag,
    message.guild?.id || "DM",
    message.guild?.name || "Direct Message"
  );
  
  try {
    await command.execute(message, args, client);
    
    // Set cooldown
    if (command.cooldown && client.cooldowns) {
      const cooldownKey = `${message.author.id}-${command.name}`;
      client.cooldowns.set(cooldownKey, Date.now() + (command.cooldown * 1000));
    }
    
  } catch (error) {
    Logger.error(`Error executing prefix command ${command.name}:`, error);
    await message.reply("An error occurred while executing this command.");
  }
}