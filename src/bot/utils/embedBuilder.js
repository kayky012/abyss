const { EmbedBuilder } = require("discord.js");

class EmbedBuilderUtil {
  static createBase(options = {}) {
    const embed = new EmbedBuilder()
      .setColor(options.color || 0x6B4EFF)
      .setTimestamp();
    
    if (options.title) embed.setTitle(options.title);
    if (options.description) embed.setDescription(options.description);
    if (options.url) embed.setURL(options.url);
    if (options.author) embed.setAuthor(options.author);
    if (options.thumbnail) embed.setThumbnail(options.thumbnail);
    if (options.image) embed.setImage(options.image);
    if (options.footer) embed.setFooter(options.footer);
    if (options.fields) embed.addFields(options.fields);
    
    return embed;
  }

  static success(message, title = "Success") {
    return this.createBase({
      color: 0x00C853,
      title: `✅ ${title}`,
      description: message
    });
  }

  static error(message, title = "Error") {
    return this.createBase({
      color: 0xED4245,
      title: `❌ ${title}`,
      description: message
    });
  }

  static warning(message, title = "Warning") {
    return this.createBase({
      color: 0xFF4D4D,
      title: `⚠️ ${title}`,
      description: message
    });
  }

  static info(message, title = "Information") {
    return this.createBase({
      color: 0x2196F3,
      title: `ℹ️ ${title}`,
      description: message
    });
  }

  static loading(message = "Processing your request...") {
    return this.createBase({
      color: 0x5865F2,
      title: "🔄 Loading",
      description: message
    });
  }

  static commandHelp(command, prefix = "/") {
    const embed = this.createBase({
      color: 0x6B4EFF,
      title: `📘 Command: ${command.name}`,
      description: command.description || "No description provided"
    });

    if (command.aliases && command.aliases.length) {
      embed.addFields({
        name: "Aliases",
        value: command.aliases.map(a => `\`${a}\``).join(", "),
        inline: true
      });
    }

    if (command.usage) {
      embed.addFields({
        name: "Usage",
        value: `\`${prefix}${command.usage}\``,
        inline: true
      });
    }

    if (command.permissions && command.permissions.length) {
      const perms = command.permissions.map(p => `\`${p}\``).join(", ");
      embed.addFields({
        name: "Permissions",
        value: perms,
        inline: true
      });
    }

    embed.addFields(
      { name: "Category", value: `\`${command.category || "General"}\``, inline: true },
      { name: "Cooldown", value: `\`${command.cooldown || 3}s\``, inline: true }
    );

    return embed;
  }

  static paginated(items, options = {}) {
    const {
      title = "Items",
      color = 0x6B4EFF,
      itemsPerPage = 10,
      currentPage = 1,
      totalPages = 1
    } = options;

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = items.slice(start, end);

    const embed = this.createBase({
      color,
      title: `${title} (Page ${currentPage}/${totalPages})`,
      description: pageItems.join("\n")
    });

    return embed;
  }

  static serverInfo(guild) {
    const embed = this.createBase({
      color: 0x6B4EFF,
      title: guild.name,
      thumbnail: guild.iconURL({ dynamic: true, size: 1024 })
    });

    const textChannels = guild.channels.cache.filter(c => c.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(c => c.type === 2).size;
    const categories = guild.channels.cache.filter(c => c.type === 4).size;

    embed.addFields(
      {
        name: "📊 Statistics",
        value: [
          `**Owner:** ${guild.members.cache.get(guild.ownerId)?.user.tag || "Unknown"}`,
          `**Members:** ${guild.memberCount}`,
          `**Bots:** ${guild.members.cache.filter(m => m.user.bot).size}`,
          `**Channels:** ${guild.channels.cache.size} (${textChannels} text, ${voiceChannels} voice, ${categories} categories)`,
          `**Roles:** ${guild.roles.cache.size}`,
          `**Emojis:** ${guild.emojis.cache.size}`,
          `**Boosts:** ${guild.premiumSubscriptionCount || 0} (Level ${guild.premiumTier})`
        ].join("\n"),
        inline: true
      },
      {
        name: "📅 Information",
        value: [
          `**Created:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
          `**ID:** \`${guild.id}\``,
          `**Verification:** ${guild.verificationLevel}`,
          `**Content Filter:** ${guild.explicitContentFilter}`,
          `**Features:** ${guild.features.slice(0, 5).join(", ") || "None"}`
        ].join("\n"),
        inline: true
      }
    );

    return embed;
  }

  static userInfo(member) {
    const user = member.user;
    const embed = this.createBase({
      color: member.displayHexColor || 0x6B4EFF,
      title: user.tag,
      thumbnail: user.displayAvatarURL({ dynamic: true, size: 1024 })
    });

    const roles = member.roles.cache
      .filter(r => r.id !== member.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString());

    embed.addFields(
      {
        name: "👤 User Information",
        value: [
          `**ID:** \`${user.id}\``,
          `**Bot:** ${user.bot ? "Yes" : "No"}`,
          `**Created:** <t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
          `**Joined:** <t:${Math.floor(member.joinedTimestamp / 1000)}:R>`
        ].join("\n"),
        inline: true
      },
      {
        name: `📋 Member Information`,
        value: [
          `**Nickname:** ${member.nickname || "None"}`,
          `**Roles (${roles.length}):** ${roles.slice(0, 5).join(", ")}${roles.length > 5 ? ` and ${roles.length - 5} more` : ""}`,
          `**Boosting:** ${member.premiumSince ? `<t:${Math.floor(member.premiumSinceTimestamp / 1000)}:R>` : "No"}`
        ].join("\n"),
        inline: true
      }
    );

    return embed;
  }

  static moderationLog(action, target, moderator, reason, duration = null) {
    const embed = this.createBase({
      color: action === "ban" ? 0xED4245 : action === "kick" ? 0xFF4D4D : 0xFFA500,
      title: `🛡️ ${action.toUpperCase()}`,
      description: `${target.tag} has been ${action}ed.`,
      thumbnail: target.displayAvatarURL({ dynamic: true })
    });

    embed.addFields(
      { name: "User", value: `${target.tag} (${target.id})`, inline: true },
      { name: "Moderator", value: moderator.tag, inline: true },
      { name: "Reason", value: reason, inline: false }
    );

    if (duration) {
      embed.addFields({ name: "Duration", value: duration, inline: true });
    }

    return embed;
  }

  static verification(user, code) {
    return this.createBase({
      color: 0x6B4EFF,
      title: "✅ Verification Required",
      description: `Welcome to the server, ${user.username}!`,
      fields: [
        {
          name: "Verification Code",
          value: `\`\`\`${code}\`\`\``,
          inline: false
        },
        {
          name: "How to verify",
          value: "Type the code above in this channel to complete verification.",
          inline: false
        }
      ],
      footer: { text: "This code expires in 5 minutes" },
      timestamp: true
    });
  }

  static securityAlert(type, user, reason) {
    const colors = {
      raid: 0xED4245,
      nuke: 0xFF0000,
      spam: 0xFF4D4D,
      automod: 0xFFA500
    };

    return this.createBase({
      color: colors[type] || 0xED4245,
      title: `🛡️ Security Alert: ${type.toUpperCase()}`,
      description: `**User:** ${user.tag} (${user.id})`,
      fields: [{ name: "Reason", value: reason, inline: false }],
      timestamp: true
    });
  }
}

module.exports = EmbedBuilderUtil;