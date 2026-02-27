const Logger = require("../utils/logger.js");
const { EmbedBuilder } = require("discord.js");
const CanvasGenerator = require("../utils/canvas.js");
const CaptchaGenerator = require("../utils/captcha.js");
const { v4: uuidv4 } = require("uuid");

module.exports = {
  name: "guildMemberAdd",
  async execute(member, client) {
    Logger.debug(`${member.user.tag} joined ${member.guild.name}`);
    
    // Get guild settings
    const settings = await client.getGuildSettings(member.guild.id);
    
    // Check if user is blacklisted
    if (client.blacklistedUsers?.has(member.id)) {
      await member.kick("Blacklisted user").catch(() => {});
      Logger.security("BLACKLIST", member.id, "Auto-kicked blacklisted user", "kick");
      return;
    }
    
    // Handle anti-raid
    if (client.antiRaid && client.config.security.antiRaidEnabled) {
      await client.antiRaid.handleJoin(member);
    }
    
    // Handle verification if enabled
    if (settings?.verification?.enabled) {
      await handleVerification(member, client, settings);
      return; // Don't send welcome until verified
    }
    
    // Handle welcome message
    if (settings?.welcome?.enabled) {
      await sendWelcome(member, client, settings);
    }
    
    // Handle auto role
    if (settings?.welcome?.autoRole?.enabled) {
      await assignAutoRoles(member, settings);
    }
    
    // Update member counter stats
    await updateMemberStats(member.guild, client);
  }
};

async function handleVerification(member, client, settings) {
  try {
    const verificationType = settings.verification.type;
    const verifyChannel = member.guild.channels.cache.get(settings.verification.channel);
    
    if (!verifyChannel) return;
    
    let verificationData;
    let embed;
    
    switch (verificationType) {
      case "captcha":
        const captchaType = settings.verification.captchaType || "text";
        let captcha;
        
        if (captchaType === "math") {
          captcha = await CaptchaGenerator.generateMath();
        } else if (captchaType === "emoji") {
          captcha = await CaptchaGenerator.generateEmoji();
        } else {
          const code = CaptchaGenerator.generateText();
          const image = await CaptchaGenerator.generateImage(code);
          captcha = { code, image };
        }
        
        verificationData = {
          id: uuidv4(),
          userId: member.id,
          guildId: member.guild.id,
          type: "captcha",
          captcha: captcha,
          expiresAt: Date.now() + settings.verification.timeout
        };
        
        // Save to database
        if (client.schemas?.verificationSchema) {
          await new client.schemas.verificationSchema({
            guildId: member.guild.id,
            userId: member.id,
            userTag: member.user.tag,
            type: "captcha",
            captcha: {
              code: captcha.code,
              type: captchaType
            },
            expiresAt: new Date(Date.now() + settings.verification.timeout),
            roleId: settings.verification.role
          }).save();
        }
        
        embed = new EmbedBuilder()
          .setColor(client.colors.primary)
          .setTitle("✅ Verification Required")
          .setDescription(`Welcome ${member.user}! Please complete verification to access the server.`)
          .addFields({
            name: "Instructions",
            value: captchaType === "math" 
              ? "Solve the math problem below and type the answer."
              : captchaType === "emoji"
              ? "Type the correct emoji shown below."
              : "Type the code shown in the image below."
          });
        
        if (captcha.image) {
          await verifyChannel.send({
            content: `${member.user}`,
            embeds: [embed],
            files: [{ attachment: captcha.image, name: "captcha.png" }]
          });
        } else if (captcha.buffer) {
          await verifyChannel.send({
            content: `${member.user}`,
            embeds: [embed],
            files: [{ attachment: captcha.buffer, name: "captcha.png" }]
          });
        } else if (captcha.code) {
          embed.addFields({ name: "Code", value: `\`${captcha.code}\`` });
          await verifyChannel.send({ content: `${member.user}`, embeds: [embed] });
        }
        break;
        
      case "button":
        // Button verification handled in interactionCreate
        verificationData = {
          userId: member.id,
          guildId: member.guild.id,
          type: "button",
          expiresAt: Date.now() + settings.verification.timeout
        };
        
        const buttonEmbed = new EmbedBuilder()
          .setColor(client.colors.primary)
          .setTitle("✅ Verification Required")
          .setDescription(`Welcome ${member.user}! Click the button below to verify.`);
        
        await verifyChannel.send({ content: `${member.user}`, embeds: [buttonEmbed] });
        break;
    }
    
    // Store in cache
    client.verificationCache?.set(member.id, verificationData);
    
  } catch (error) {
    Logger.error("Error handling verification:", error);
  }
}

async function sendWelcome(member, client, settings) {
  try {
    const channel = member.guild.channels.cache.get(settings.welcome.channel);
    if (!channel) return;
    
    let message = settings.welcome.message
      .replace(/{user}/g, member.user.toString())
      .replace(/{username}/g, member.user.username)
      .replace(/{tag}/g, member.user.tag)
      .replace(/{server}/g, member.guild.name)
      .replace(/{memberCount}/g, member.guild.memberCount);
    
    if (settings.welcome.canvas && settings.welcome.canvasTemplate) {
      try {
        const canvasBuffer = await CanvasGenerator.generateWelcomeImage(
          member, 
          settings.welcome.canvasTemplate
        );
        
        const embed = new EmbedBuilder()
          .setColor(settings.welcome.color || client.colors.primary)
          .setDescription(message)
          .setImage("attachment://welcome.png")
          .setTimestamp();
        
        await channel.send({
          embeds: [embed],
          files: [{ attachment: canvasBuffer, name: "welcome.png" }]
        });
      } catch (error) {
        Logger.error("Error generating welcome canvas:", error);
        await channel.send(message);
      }
    } else if (settings.welcome.imageUrl) {
      const embed = new EmbedBuilder()
        .setColor(settings.welcome.color || client.colors.primary)
        .setDescription(message)
        .setImage(settings.welcome.imageUrl)
        .setTimestamp();
      
      await channel.send({ embeds: [embed] });
    } else {
      await channel.send(message);
    }
    
    // Send DM if enabled
    if (settings.welcome.dm && settings.welcome.dmMessage) {
      const dmMessage = settings.welcome.dmMessage
        .replace(/{user}/g, member.user.username)
        .replace(/{server}/g, member.guild.name)
        .replace(/{memberCount}/g, member.guild.memberCount);
      
      await member.send(dmMessage).catch(() => {});
    }
    
    // Update stats
    if (client.schemas?.welcomeSchema) {
      await client.schemas.welcomeSchema.findOneAndUpdate(
        { guildId: member.guild.id },
        { $inc: { "stats.welcomed": 1, "stats.lastWelcome": new Date() } }
      );
    }
    
  } catch (error) {
    Logger.error("Error sending welcome:", error);
  }
}

async function assignAutoRoles(member, settings) {
  try {
    const roles = settings.welcome.autoRole.roles;
    
    if (member.user.bot && !settings.welcome.autoRole.bots) {
      return;
    }
    
    if (roles && roles.length > 0) {
      await member.roles.add(roles).catch(() => {});
    }
  } catch (error) {
    Logger.error("Error assigning auto roles:", error);
  }
}

async function updateMemberStats(guild, client) {
  try {
    if (client.schemas?.statsSchema) {
      await client.schemas.statsSchema.findOneAndUpdate(
        { type: "guild", targetId: guild.id },
        { $inc: { "daily.members": 1 } }
      );
    }
  } catch (error) {
    Logger.error("Error updating member stats:", error);
  }
}