const { PermissionsBitField } = require("discord.js");

class PermissionChecker {
  static hasPermission(member, permission) {
    if (!member) return false;
    if (this.isOwner(member)) return true;
    return member.permissions.has(permission);
  }

  static hasAnyPermission(member, permissions) {
    if (!member) return false;
    if (this.isOwner(member)) return true;
    return permissions.some(perm => member.permissions.has(perm));
  }

  static hasAllPermissions(member, permissions) {
    if (!member) return false;
    if (this.isOwner(member)) return true;
    return permissions.every(perm => member.permissions.has(perm));
  }

  static isAdministrator(member) {
    if (!member) return false;
    if (this.isOwner(member)) return true;
    return member.permissions.has(PermissionsBitField.Flags.Administrator);
  }

  static isModerator(member) {
    if (!member) return false;
    if (this.isOwner(member)) return true;
    if (this.isAdministrator(member)) return true;
    
    const modPerms = [
      PermissionsBitField.Flags.KickMembers,
      PermissionsBitField.Flags.BanMembers,
      PermissionsBitField.Flags.ModerateMembers
    ];
    
    return modPerms.some(perm => member.permissions.has(perm));
  }

  static isOwner(member) {
    if (!member) return false;
    return member.id === member.guild.ownerId;
  }

  static isBotOwner(member, client) {
    if (!member) return false;
    return client.config.ownerIds.includes(member.id);
  }

  static canManage(member, targetMember) {
    if (!member || !targetMember) return false;
    if (this.isBotOwner(member, member.client)) return true;
    if (member.id === targetMember.id) return false;
    if (this.isOwner(member)) return true;
    
    return member.roles.highest.comparePositionTo(targetMember.roles.highest) > 0;
  }

  static canInteract(member, targetMember) {
    if (!member || !targetMember) return false;
    if (this.isBotOwner(member, member.client)) return true;
    if (member.id === targetMember.id) return true;
    
    return member.roles.highest.comparePositionTo(targetMember.roles.highest) > 0;
  }

  static getPermissionName(permission) {
    const names = {
      CreateInstantInvite: "Create Invite",
      KickMembers: "Kick Members",
      BanMembers: "Ban Members",
      Administrator: "Administrator",
      ManageChannels: "Manage Channels",
      ManageGuild: "Manage Server",
      AddReactions: "Add Reactions",
      ViewAuditLog: "View Audit Log",
      PrioritySpeaker: "Priority Speaker",
      Stream: "Video",
      ViewChannel: "View Channels",
      SendMessages: "Send Messages",
      SendTTSMessages: "Send TTS Messages",
      ManageMessages: "Manage Messages",
      EmbedLinks: "Embed Links",
      AttachFiles: "Attach Files",
      ReadMessageHistory: "Read Message History",
      MentionEveryone: "Mention Everyone",
      UseExternalEmojis: "Use External Emojis",
      ViewGuildInsights: "View Insights",
      Connect: "Connect",
      Speak: "Speak",
      MuteMembers: "Mute Members",
      DeafenMembers: "Deafen Members",
      MoveMembers: "Move Members",
      UseVAD: "Use Voice Activity",
      ChangeNickname: "Change Nickname",
      ManageNicknames: "Manage Nicknames",
      ManageRoles: "Manage Roles",
      ManageWebhooks: "Manage Webhooks",
      ManageEmojisAndStickers: "Manage Emojis & Stickers",
      UseApplicationCommands: "Use Slash Commands",
      RequestToSpeak: "Request to Speak",
      ManageEvents: "Manage Events",
      ManageThreads: "Manage Threads",
      CreatePublicThreads: "Create Public Threads",
      CreatePrivateThreads: "Create Private Threads",
      UseExternalStickers: "Use External Stickers",
      SendMessagesInThreads: "Send Messages in Threads",
      UseEmbeddedActivities: "Use Activities",
      ModerateMembers: "Timeout Members"
    };
    
    return names[permission] || permission;
  }

  static missingPermissions(member, required) {
    if (!member) return required;
    if (this.isOwner(member)) return [];
    
    const missing = [];
    for (const perm of required) {
      if (!member.permissions.has(perm)) {
        missing.push(perm);
      }
    }
    
    return missing;
  }

  static formatPermissionList(permissions) {
    return permissions.map(p => `\`${this.getPermissionName(p)}\``).join(", ");
  }

  static getPermissionLevel(member, client) {
    if (!member) return 0;
    
    if (this.isBotOwner(member, client)) return 5;
    if (this.isOwner(member)) return 4;
    if (this.isAdministrator(member)) return 3;
    if (this.isModerator(member)) return 2;
    
    return 1;
  }

  static getRolePermissions(role) {
    if (!role) return [];
    return role.permissions.toArray();
  }

  static compareRoles(role1, role2) {
    if (!role1 || !role2) return 0;
    return role1.position - role2.position;
  }
}

module.exports = PermissionChecker;