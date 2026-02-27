const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  PermissionsBitField,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ChannelType
} = require("discord.js");

module.exports = {
  name: "automod",
  description: "Configure Discord's official AutoMod rules (for AutoMod badge)",
  category: "auto",
  permissions: [PermissionsBitField.Flags.ManageGuild],
  botPermissions: [PermissionsBitField.Flags.ManageGuild],
  
  data: new SlashCommandBuilder()
    .setName("automod")
    .setDescription("Configure Discord's official AutoMod rules")
    .addSubcommand(sub => 
      sub.setName("setup")
         .setDescription("Set up AutoMod rules for this server (follows Discord limits)")
         .addChannelOption(opt => 
           opt.setName("alert_channel")
              .setDescription("Channel where AutoMod alerts will be sent")
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(true)))
    .addSubcommand(sub => 
      sub.setName("list")
         .setDescription("List all AutoMod rules in this server"))
    .addSubcommand(sub => 
      sub.setName("create")
         .setDescription("Create a custom AutoMod rule")
         .addStringOption(opt => 
           opt.setName("name")
              .setDescription("Name of the rule")
              .setRequired(true))
         .addStringOption(opt => 
           opt.setName("trigger")
              .setDescription("Trigger type")
              .setRequired(true)
              .addChoices(
                { name: "Keyword Filter (Max 6 per server)", value: "keyword" },
                { name: "Spam Protection (Max 1 per server)", value: "spam" },
                { name: "Profanity Filter (Max 1 per server)", value: "profanity" },
                { name: "Sexual Content (Max 1 per server)", value: "sexual" },
                { name: "Slurs/Hate Speech (Max 1 per server)", value: "slurs" },
                { name: "Mention Spam (Max 1 per server)", value: "mentions" }
              ))
         .addStringOption(opt => 
           opt.setName("action")
              .setDescription("Action to take")
              .setRequired(true)
              .addChoices(
                { name: "Block Message", value: "block" },
                { name: "Send Alert", value: "alert" },
                { name: "Timeout User (Keyword/Mention only)", value: "timeout" }
              ))
         .addChannelOption(opt => 
           opt.setName("alert_channel")
              .setDescription("Channel for alerts (required for alert action)")
              .addChannelTypes(ChannelType.GuildText)
              .setRequired(false))
         .addIntegerOption(opt => 
           opt.setName("timeout_duration")
              .setDescription("Timeout duration in seconds (min 60, max 2419200)")
              .setRequired(false)
              .setMinValue(60)
              .setMaxValue(2419200))
         .addStringOption(opt => 
           opt.setName("keywords")
              .setDescription("Comma-separated keywords for keyword filter")
              .setRequired(false)))
    .addSubcommand(sub => 
      sub.setName("delete")
         .setDescription("Delete an AutoMod rule")
         .addStringOption(opt => 
           opt.setName("rule_id")
              .setDescription("ID of the rule to delete")
              .setRequired(true)))
    .addSubcommand(sub => 
      sub.setName("stats")
         .setDescription("Show AutoMod statistics for badge progress")),
  
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    
    switch (subcommand) {
      case "setup":
        await handleSetup(interaction, client);
        break;
      case "list":
        await handleList(interaction, client);
        break;
      case "create":
        await handleCreate(interaction, client);
        break;
      case "delete":
        await handleDelete(interaction, client);
        break;
      case "stats":
        await handleStats(interaction, client);
        break;
    }
  }
};

async function handleSetup(interaction, client) {
  await interaction.deferReply();
  
  const alertChannel = interaction.options.getChannel("alert_channel");
  
  try {
    // Check existing rules
    const existingRules = await interaction.guild.autoModerationRules.fetch();
    
    // Count existing rules by trigger type
    const triggerCounts = {
      1: 0, // KEYWORD
      3: 0, // SPAM
      4: 0, // KEYWORD_PRESET
      5: 0, // MENTION_SPAM
      6: 0  // MEMBER_PROFILE
    };
    
    existingRules.forEach(rule => {
      if (triggerCounts.hasOwnProperty(rule.triggerType)) {
        triggerCounts[rule.triggerType]++;
      }
    });
    
    const rules = [];
    const errors = [];
    
    // Helper function to safely create rules
    async function safeCreateRule(ruleData, triggerType) {
      // Check if we've reached the limit for this trigger type
      const limits = { 1: 6, 3: 1, 4: 1, 5: 1, 6: 1 };
      if (triggerCounts[triggerType] >= limits[triggerType]) {
        errors.push(`Cannot create ${ruleData.name}: Maximum ${limits[triggerType]} rules of this type already exist.`);
        return null;
      }
      
      try {
        const rule = await interaction.guild.autoModerationRules.create(ruleData);
        triggerCounts[triggerType]++;
        rules.push(rule);
        return rule;
      } catch (error) {
        errors.push(`Failed to create ${ruleData.name}: ${error.message}`);
        return null;
      }
    }
    
    // Rule 1: Profanity Filter (KEYWORD_PRESET) - block only (no alert to avoid limit)
    await safeCreateRule({
      name: "ABYSS - Profanity Filter",
      eventType: 1,
      triggerType: 4,
      triggerMetadata: {
        presets: [1] // PROFANITY
      },
      actions: [
        {
          type: 1,
          metadata: {
            customMessage: "Please avoid using profanity in this server."
          }
        }
      ],
      enabled: true,
      reason: "AutoMod setup by ABYSS bot"
    }, 4);
    
    // Rule 2: Spam Protection (SPAM) - block only
    await safeCreateRule({
      name: "ABYSS - Spam Protection",
      eventType: 1,
      triggerType: 3,
      actions: [
        {
          type: 1,
          metadata: {
            customMessage: "Please do not spam."
          }
        }
      ],
      enabled: true,
      reason: "AutoMod setup by ABYSS bot"
    }, 3);
    
    // Rule 3: Mention Spam Protection (MENTION_SPAM) - with timeout (allowed)
    await safeCreateRule({
      name: "ABYSS - Mention Spam Protection",
      eventType: 1,
      triggerType: 5,
      triggerMetadata: {
        mentionTotalLimit: 10,
        mentionRaidProtectionEnabled: true
      },
      actions: [
        {
          type: 1,
          metadata: {
            customMessage: "Too many mentions detected."
          }
        },
        {
          type: 3,
          metadata: {
            durationSeconds: 300
          }
        }
      ],
      enabled: true,
      reason: "AutoMod setup by ABYSS bot"
    }, 5);
    
    // Rule 4: Keyword Filter 1 (KEYWORD) - common spam words with alert
    await safeCreateRule({
      name: "ABYSS - Spam Keywords 1",
      eventType: 1,
      triggerType: 1,
      triggerMetadata: {
        keywordFilter: ["discord.gg/*", "free nitro", "steamcommunity.com/gift"],
        regexPatterns: []
      },
      actions: [
        {
          type: 1,
          metadata: {
            customMessage: "This type of content is not allowed."
          }
        },
        {
          type: 2,
          metadata: {
            channelId: alertChannel.id
          }
        }
      ],
      enabled: true,
      reason: "AutoMod setup by ABYSS bot"
    }, 1);
    
    // Rule 5: Keyword Filter 2 (KEYWORD) - profanity alternatives with alert
    await safeCreateRule({
      name: "ABYSS - Spam Keywords 2",
      eventType: 1,
      triggerType: 1,
      triggerMetadata: {
        keywordFilter: ["*shit*", "*fuck*", "*asshole*"],
        regexPatterns: []
      },
      actions: [
        {
          type: 1,
          metadata: {
            customMessage: "Please keep language appropriate."
          }
        },
        {
          type: 2,
          metadata: {
            channelId: alertChannel.id
          }
        }
      ],
      enabled: true,
      reason: "AutoMod setup by ABYSS bot"
    }, 1);
    
    // Rule 6: Keyword Filter 3 (KEYWORD) - scam detection with timeout (allowed)
    await safeCreateRule({
      name: "ABYSS - Scam Detection",
      eventType: 1,
      triggerType: 1,
      triggerMetadata: {
        keywordFilter: ["*nitro*giveaway*", "*free*steam*", "*discord*airdrop*"],
        regexPatterns: []
      },
      actions: [
        {
          type: 1,
          metadata: {
            customMessage: "Potential scam detected."
          }
        },
        {
          type: 3,
          metadata: {
            durationSeconds: 3600
          }
        }
      ],
      enabled: true,
      reason: "AutoMod setup by ABYSS bot"
    }, 1);
    
    const successfulRules = rules.length;
    
    const embed = new EmbedBuilder()
      .setColor(successfulRules > 0 ? client.colors.success : client.colors.warning)
      .setTitle("✅ AutoMod Setup Complete")
      .setDescription(`Created **${successfulRules}** AutoMod rules following Discord's limits.`)
      .addFields(
        {
          name: "Rules Created",
          value: rules.map(r => `• \`${r.name}\` (ID: ${r.id})`).join("\n") || "None",
          inline: false
        },
        {
          name: "Alert Channel",
          value: `${alertChannel}`,
          inline: true
        },
        {
          name: "Trigger Type Limits",
          value: "Keyword: 6 | Spam: 1 | Preset: 1 | Mention: 1",
          inline: true
        }
      );
    
    if (errors.length > 0) {
      embed.addFields({
        name: "⚠️ Notes",
        value: errors.slice(0, 3).join("\n"),
        inline: false
      });
    }
    
    embed.addFields({
      name: "📊 Badge Progress",
      value: `Your bot now has **${await getTotalRulesCount(client)}** AutoMod rules across all servers.\nNeed **100** for the AutoMod badge!`,
      inline: false
    })
    .setFooter({ text: "Discord AutoMod Badge Progress" })
    .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error("Error setting up AutoMod:", error);
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.error)
      .setTitle("❌ AutoMod Setup Failed")
      .setDescription("There was an error creating AutoMod rules.")
      .addFields({
        name: "Error Details",
        value: `\`\`\`${error.message}\`\`\``
      })
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handleCreate(interaction, client) {
  await interaction.deferReply();
  
  const name = interaction.options.getString("name");
  const trigger = interaction.options.getString("trigger");
  const action = interaction.options.getString("action");
  const alertChannel = interaction.options.getChannel("alert_channel");
  const timeoutDuration = interaction.options.getInteger("timeout_duration");
  const keywords = interaction.options.getString("keywords");
  
  // Map trigger values to types and check limits
  const triggerMap = {
    "keyword": { type: 1, limit: 6, name: "Keyword" },
    "spam": { type: 3, limit: 1, name: "Spam" },
    "profanity": { type: 4, limit: 1, name: "Profanity Preset" },
    "sexual": { type: 4, limit: 1, name: "Sexual Preset" },
    "slurs": { type: 4, limit: 1, name: "Slurs Preset" },
    "mentions": { type: 5, limit: 1, name: "Mention Spam" }
  };
  
  const triggerInfo = triggerMap[trigger];
  
  // Validation for alert action
  if (action === "alert" && !alertChannel) {
    return await interaction.editReply({
      content: "❌ Alert channel is required when using the 'Send Alert' action."
    });
  }
  
  // Validation for timeout action
  if (action === "timeout") {
    if (!timeoutDuration) {
      return await interaction.editReply({
        content: "❌ Timeout duration is required when using the 'Timeout User' action."
      });
    }
    
    // Timeout only allowed for keyword and mention triggers
    if (trigger !== "keyword" && trigger !== "mentions") {
      return await interaction.editReply({
        content: "❌ Timeout action is only allowed for Keyword and Mention Spam rules."
      });
    }
  }
  
  try {
    // Check existing rules count for this trigger type
    const existingRules = await interaction.guild.autoModerationRules.fetch();
    const existingCount = Array.from(existingRules.values()).filter(r => r.triggerType === triggerInfo.type).length;
    
    if (existingCount >= triggerInfo.limit) {
      return await interaction.editReply({
        content: `❌ This server already has ${existingCount}/${triggerInfo.limit} ${triggerInfo.name} rules. Cannot create more.`
      });
    }
    
    // Map trigger to trigger metadata
    let triggerMetadata = {};
    
    switch (trigger) {
      case "keyword":
        const keywordList = keywords ? keywords.split(',').map(k => k.trim()) : ["badword", "spam"];
        triggerMetadata = {
          keywordFilter: keywordList,
          regexPatterns: []
        };
        break;
      case "profanity":
        triggerMetadata = { presets: [1] };
        break;
      case "sexual":
        triggerMetadata = { presets: [2] };
        break;
      case "slurs":
        triggerMetadata = { presets: [3] };
        break;
      case "mentions":
        triggerMetadata = {
          mentionTotalLimit: 10,
          mentionRaidProtectionEnabled: true
        };
        break;
    }
    
    // Build actions array
    const actions = [];
    
    switch (action) {
      case "block":
        actions.push({
          type: 1,
          metadata: {
            customMessage: "This message was blocked by AutoMod."
          }
        });
        break;
      case "alert":
        actions.push({
          type: 2,
          metadata: {
            channelId: alertChannel.id
          }
        });
        break;
      case "timeout":
        actions.push({
          type: 3,
          metadata: {
            durationSeconds: timeoutDuration
          }
        });
        break;
    }
    
    // Create the rule
    const rule = await interaction.guild.autoModerationRules.create({
      name: `ABYSS - ${name}`,
      eventType: 1,
      triggerType: triggerInfo.type,
      triggerMetadata: triggerMetadata,
      actions: actions,
      enabled: true,
      reason: `Created by ${interaction.user.tag} via ABYSS bot`
    });
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.success)
      .setTitle("✅ AutoMod Rule Created")
      .setDescription(`Successfully created rule: **${rule.name}**`)
      .addFields(
        { name: "Rule ID", value: `\`${rule.id}\``, inline: true },
        { name: "Trigger Type", value: triggerInfo.name, inline: true },
        { name: "Action", value: action, inline: true },
        { name: "Server Limit", value: `${existingCount + 1}/${triggerInfo.limit}`, inline: true },
        {
          name: "📊 Badge Progress",
          value: `Your bot now has **${await getTotalRulesCount(client)}** AutoMod rules across all servers.`,
          inline: false
        }
      )
      .setFooter({ text: "Discord AutoMod Badge Progress" })
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error("Error creating AutoMod rule:", error);
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.error)
      .setTitle("❌ Failed to Create Rule")
      .setDescription(`Error: ${error.message}`)
      .addFields({
        name: "Tip",
        value: "Check Discord's limits: Keyword:6, Spam:1, Preset:1, Mention:1. Timeout only for Keyword/Mention."
      })
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handleList(interaction, client) {
  await interaction.deferReply();
  
  try {
    const rules = await interaction.guild.autoModerationRules.fetch();
    
    if (rules.size === 0) {
      const embed = new EmbedBuilder()
        .setColor(client.colors.info)
        .setTitle("📋 AutoMod Rules")
        .setDescription("This server has no AutoMod rules configured.")
        .addFields({
          name: "Get Started",
          value: "Use `/automod setup` to create rules within Discord's limits."
        })
        .setTimestamp();
      
      return await interaction.editReply({ embeds: [embed] });
    }
    
    // Group by trigger type
    const byType = {
      1: [], 3: [], 4: [], 5: [], 6: []
    };
    
    rules.forEach(rule => {
      if (byType.hasOwnProperty(rule.triggerType)) {
        byType[rule.triggerType].push(rule);
      }
    });
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle("📋 AutoMod Rules")
      .setDescription(`Total Rules: ${rules.size}`)
      .addFields(
        { name: "Keyword Rules", value: `${byType[1].length}/6`, inline: true },
        { name: "Spam Rules", value: `${byType[3].length}/1`, inline: true },
        { name: "Preset Rules", value: `${byType[4].length}/1`, inline: true },
        { name: "Mention Rules", value: `${byType[5].length}/1`, inline: true }
      )
      .setFooter({ text: "Discord's AutoMod limits per server" })
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error("Error listing AutoMod rules:", error);
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.error)
      .setTitle("❌ Error")
      .setDescription("Failed to fetch AutoMod rules.")
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handleDelete(interaction, client) {
  await interaction.deferReply();
  
  const ruleId = interaction.options.getString("rule_id");
  
  try {
    const rules = await interaction.guild.autoModerationRules.fetch();
    const rule = rules.get(ruleId);
    
    if (!rule) {
      return await interaction.editReply({
        content: "❌ No AutoMod rule found with that ID."
      });
    }
    
    await rule.delete(`Deleted by ${interaction.user.tag} via ABYSS bot`);
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.success)
      .setTitle("✅ AutoMod Rule Deleted")
      .setDescription(`Successfully deleted rule: **${rule.name}**`)
      .addFields({
        name: "📊 Badge Progress",
        value: `Your bot now has **${await getTotalRulesCount(client)}** AutoMod rules across all servers.`,
        inline: false
      })
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error("Error deleting AutoMod rule:", error);
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.error)
      .setTitle("❌ Failed to Delete Rule")
      .setDescription(`Error: ${error.message}`)
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
  }
}

async function handleStats(interaction, client) {
  await interaction.deferReply();
  
  try {
    const totalRules = await getTotalRulesCount(client);
    const guildsWithRules = await getGuildsWithRules(client);
    const remaining = Math.max(0, 100 - totalRules);
    
    // Calculate estimated servers needed
    const serversNeeded = Math.ceil(remaining / 10); // Each server can have up to 10 rules max
    
    const embed = new EmbedBuilder()
      .setColor(totalRules >= 100 ? client.colors.success : client.colors.primary)
      .setTitle("📊 AutoMod Badge Progress")
      .setDescription(totalRules >= 100 
        ? "✅ Congratulations! Your bot has reached 100+ AutoMod rules. The badge should appear within 12-48 hours!"
        : "Working towards the official Discord AutoMod badge")
      .addFields(
        {
          name: "Current Progress",
          value: [
            `**Total Rules:** ${totalRules}/100`,
            `**Servers with Rules:** ${guildsWithRules}`,
            `**Remaining:** ${remaining} rules needed`
          ].join("\n"),
          inline: false
        },
        {
          name: "📈 Per-Server Limits",
          value: [
            `**Keyword:** 6 rules`,
            `**Spam:** 1 rule`,
            `**Preset:** 1 rule`,
            `**Mention:** 1 rule`,
            `**Total Max:** 10 rules per server`
          ].join("\n"),
          inline: true
        },
        {
          name: "🎯 Strategy",
          value: [
            `Need ~${serversNeeded} more servers`,
            `Each server = 10 rules max`,
            `Timeout only for Keyword/Mention`
          ].join("\n"),
          inline: true
        }
      )
      .setFooter({ text: "Discord Official AutoMod Badge" })
      .setTimestamp();
    
    // Add progress bar
    const progressBar = createProgressBar(totalRules, 100);
    embed.setDescription(`${embed.data.description}\n\n${progressBar}`);
    
    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    console.error("Error getting AutoMod stats:", error);
    
    const embed = new EmbedBuilder()
      .setColor(client.colors.error)
      .setTitle("❌ Error")
      .setDescription("Failed to fetch AutoMod statistics.")
      .setTimestamp();
    
    await interaction.editReply({ embeds: [embed] });
  }
}

// Helper function to get total AutoMod rules across all guilds
async function getTotalRulesCount(client) {
  let total = 0;
  
  for (const guild of client.guilds.cache.values()) {
    try {
      const rules = await guild.autoModerationRules.fetch();
      total += rules.size;
    } catch (error) {
      continue;
    }
  }
  
  return total;
}

// Helper function to get number of guilds with AutoMod rules
async function getGuildsWithRules(client) {
  let count = 0;
  
  for (const guild of client.guilds.cache.values()) {
    try {
      const rules = await guild.autoModerationRules.fetch();
      if (rules.size > 0) count++;
    } catch (error) {
      continue;
    }
  }
  
  return count;
}

// Helper function to create a progress bar
function createProgressBar(current, total, size = 20) {
  const percentage = current / total;
  const progress = Math.round(size * percentage);
  const empty = size - progress;
  
  const progressText = '█'.repeat(progress);
  const emptyText = '░'.repeat(empty);
  
  return `**[${progressText}${emptyText}]** ${current}/${total} (${Math.round(percentage * 100)}%)`;
}