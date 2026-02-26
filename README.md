# ABYSS - Free Open Source Discord Bot Template

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.0.0-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Discord.js-v14-purple.svg" alt="Discord.js">
  <img src="https://img.shields.io/badge/MongoDB-Ready-brightgreen.svg" alt="MongoDB">
  <img src="https://img.shields.io/badge/Open%20Source-❤️-red.svg" alt="Open Source">
</p>

<p align="center">
  <b>ABYSS</b> - A powerful, secure, and feature-rich Discord bot template to protect and manage your community. <br>
  <b>100% Free • Open Source • Community Driven</b>
</p>

<p align="center">
  <a href="https://discord.gg/yAmED8qhXd">
    <img src="https://img.shields.io/discord/1467842302260281427?color=5865F2&logo=discord&logoColor=white&label=Join%20Our%20Server" alt="Discord">
  </a>
  <a href="https://discord.com/oauth2/authorize?client_id=1467842302260281427">
    <img src="https://img.shields.io/badge/Invite%20ABYSS-5865F2?logo=discord&logoColor=white" alt="Invite">
  </a>
  <a href="https://github.com/rak-dev1/abyss/stargazers">
    <img src="https://img.shields.io/github/stars/rak-dev1/abyss?style=social" alt="Stars">
  </a>
</p>

---

## 📋 **Table of Contents**

- [About ABYSS](#-about-abyss)
- [Features](#-features)
- [Security Modules](#-security-modules)
- [Commands Overview](#-commands-overview)
- [Live Demo](#-live-demo)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Folder Structure](#-folder-structure)
- [Database](#-database)
- [Canvas & Images](#-canvas--images)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support & Community](#-support--community)

---

## 🌟 **About ABYSS**

ABYSS is a **completely free and open-source** Discord bot template designed to help server owners secure and manage their communities effectively. Built with security, performance, and ease of use in mind, ABYSS provides everything you need to run a well-moderated Discord server.

### Why ABYSS?
- ✅ **100% Free** - No paywalls, no premium tiers
- ✅ **Open Source** - Fully transparent code
- ✅ **Community Driven** - Built by the community, for the community
- ✅ **Easy to Use** - Simple setup and configuration
- ✅ **Feature Rich** - 100+ commands across 8 categories
- ✅ **Actively Maintained** - Regular updates and improvements

---

## ✨ **Features**

### 🛡️ **Security Suite**
- **Anti-Raid** - Detect and block mass joins, rapid actions
- **Anti-Nuke** - Protect against channel/role deletion, permission changes
- **Anti-Spam** - Prevent message spam, mention spam, emoji spam
- **Auto-Mod** - Automatic filtering of invites, links, bad words, caps
- **Verification System** - Captcha verification, reaction roles, button verification
- **Whitelist/Blacklist** - Protect trusted users, block malicious ones

### ⚙️ **Moderation Tools**
- Full moderation suite (ban, kick, mute, warn)
- Temporary punishments
- Warning system with automatic actions
- Purge messages with filters
- Channel lockdown and slowmode
- Nickname and role management

### 👋 **Welcome & Goodbye**
- Customizable welcome messages
- Canvas-generated welcome images
- Goodbye cards and messages
- Multiple card templates
- Custom backgrounds and colors

### 📊 **Utility Commands**
- Server and user information
- Avatar and banner display
- Bot statistics and uptime
- Help menu with categories
- Invite management

### 📝 **Logging System**
- Full event logging
- Configurable log channels
- Ignore specific channels/users
- Detailed audit logs

---

## 🛡️ **Security Modules**

### Anti-Raid Protection
| Feature | Description |
|---------|-------------|
| Mass Join Detection | Blocks sudden influx of new members |
| Rapid Action Detection | Detects quick bans/kicks/changes |
| Auto Punishment | Automatically applies punishments |
| Whitelist Bypass | Trusted users bypass detection |

### Anti-Nuke Protection
| Feature | Description |
|---------|-------------|
| Channel Protection | Prevents mass channel deletion/creation |
| Role Protection | Blocks unauthorized role changes |
| Permission Guard | Monitors permission changes |
| Admin Protection | Special protection for admin actions |

### Anti-Spam Protection
| Feature | Description |
|---------|-------------|
| Message Spam | Blocks rapid message sending |
| Mention Spam | Prevents mass mentions |
| Emoji Spam | Stops emoji flooding |
| Link Spam | Controls link posting |

### Auto-Moderation
| Feature | Description |
|---------|-------------|
| Invite Filter | Blocks Discord invites |
| Link Filter | Controls external links |
| Bad Words | Custom word blacklist |
| Caps Control | Limits ALL CAPS messages |
| Emoji Limit | Restricts emoji usage |

### Verification System
| Feature | Description |
|---------|-------------|
| Captcha | Image/text captcha verification |
| Button Verify | One-click verification |
| Reaction Role | Role assignment via reactions |
| Timeout | Auto-kick unverified users |

---

## 📚 **Commands Overview**

### Moderation Commands (15+)
| Command | Description | Permissions |
|---------|-------------|-------------|
| `/ban` | Ban a user | Ban Members |
| `/kick` | Kick a user | Kick Members |
| `/mute` | Timeout a user | Moderate Members |
| `/unmute` | Remove timeout | Moderate Members |
| `/warn` | Warn a user | Moderate Members |
| `/warnings` | View user warnings | Moderate Members |
| `/purge` | Delete messages | Manage Messages |
| `/lockdown` | Lock/unlock channel | Manage Channels |
| `/slowmode` | Set channel slowmode | Manage Channels |
| `/nickname` | Change nickname | Manage Nicknames |
| `/role` | Add/remove roles | Manage Roles |

### Anti Commands (10+)
| Command | Description |
|---------|-------------|
| `/anti raid` | Configure anti-raid settings |
| `/anti nuke` | Configure anti-nuke settings |
| `/anti spam` | Configure anti-spam settings |
| `/automod` | Configure auto-moderation |
| `/whitelist` | Manage whitelisted users |
| `/blacklist` | Manage blacklisted users |

### Verification Commands (8+)
| Command | Description |
|---------|-------------|
| `/verification setup` | Set up verification system |
| `/verification captcha` | Configure captcha settings |
| `/verification role` | Set verified role |
| `/verify` | Start verification |

### Welcome Commands (10+)
| Command | Description |
|---------|-------------|
| `/welcome channel` | Set welcome channel |
| `/welcome message` | Set welcome message |
| `/welcome image` | Set welcome image |
| `/welcome canvas` | Configure canvas card |
| `/welcome test` | Test welcome message |

### Goodbye Commands (10+)
| Command | Description |
|---------|-------------|
| `/goodbye channel` | Set goodbye channel |
| `/goodbye message` | Set goodbye message |
| `/goodbye image` | Set goodbye image |
| `/goodbye canvas` | Configure canvas card |
| `/goodbye test` | Test goodbye message |

### Utility Commands (20+)
| Command | Description |
|---------|-------------|
| `/ping` | Check bot latency |
| `/uptime` | Check bot uptime |
| `/stats` | View bot statistics |
| `/help` | Display help menu |
| `/userinfo` | Get user information |
| `/serverinfo` | Get server information |
| `/roleinfo` | Get role information |
| `/avatar` | Get user avatar |
| `/invite` | Get bot invite |

### Logging Commands (8+)
| Command | Description |
|---------|-------------|
| `/logging channel` | Set logging channel |
| `/logging events` | Configure logged events |
| `/logging ignore` | Ignore channels/users |
| `/logging test` | Test logging |

### Owner Commands (12+)
| Command | Description |
|---------|-------------|
| `/eval` | Execute JavaScript code |
| `/exec` | Execute shell command |
| `/reload` | Reload commands |
| `/restart` | Restart the bot |
| `/servers` | List all servers |
| `/broadcast` | Send message to all servers |
| `/blacklist` | Blacklist a user/guild |

**Total: 100+ Commands** across all categories!

---

## 🎮 **Live Demo**

Want to see ABYSS in action before deploying?

### 🤖 **Invite the Public Bot**
Click the link below to add ABYSS to your server instantly:
<p align="center">
  <a href="https://discord.com/oauth2/authorize?client_id=1467842302260281427">
    <img src="https://img.shields.io/badge/Invite%20ABYSS%20Bot-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Invite ABYSS Bot">
  </a>
</p>

### 👥 **Join Our Community**
Get help, suggest features, and connect with other ABYSS users:
<p align="center">
  <a href="https://discord.gg/yAmED8qhXd">
    <img src="https://img.shields.io/badge/Join%20Our%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Join Discord">
  </a>
</p>

**Discord Server:** https://discord.gg/yAmED8qhXd  
**Bot Invite:** https://discord.com/oauth2/authorize?client_id=1467842302260281427

---

## 📦 **Installation**

### Prerequisites
- Node.js 16.9.0 or higher
- MongoDB 4.4 or higher
- Git
- Basic knowledge of Discord bots

### Step-by-Step Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/abyss-bot.git
cd abyss-bot
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Start the bot**
```bash
npm start
# or with PM2 for production
npm run pm2
```

---

## ⚙️ **Configuration**

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `TOKEN` | Discord bot token | ✅ | - |
| `CLIENT_ID` | Discord application ID | ✅ | - |
| `MONGO_URI` | MongoDB connection string | ✅ | - |
| `OWNER_IDS` | Bot owner IDs (comma separated) | ✅ | - |
| `PREFIX` | Command prefix | ❌ | `!` |
| `EMBED_COLOR` | Default embed color | ❌ | `6B4EFF` |
| `STATUS` | Bot status | ❌ | `dnd` |
| `ACTIVITY` | Bot activity | ❌ | `Securing Communities` |

### Security Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTI_RAID_ENABLED` | Enable anti-raid | `true` |
| `ANTI_NUKE_ENABLED` | Enable anti-nuke | `true` |
| `ANTI_SPAM_ENABLED` | Enable anti-spam | `true` |
| `AUTO_MOD_ENABLED` | Enable auto-mod | `true` |
| `LOG_CHANNEL` | Default log channel | `logs` |
| `MAX_WARNS` | Max warnings before action | `3` |
| `PUNISH_ACTION` | Auto punishment action | `mute` |

---

## 📂 **Full Folder Structure**

```
ABYSS/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── ecosystem.config.js
├── LICENSE
├── README.md
│
├── src/
│   ├── index.js
│   │
│   ├── bot/
│   │   ├── AbyssClient.js
│   │   │
│   │   ├── handlers/
│   │   │   ├── eventHandler.js
│   │   │   ├── commandHandler.js
│   │   │   ├── antiHandler.js
│   │   │   ├── databaseHandler.js
│   │   │   └── consoleHandler.js
│   │   │
│   │   ├── structures/
│   │   │   ├── Command.js
│   │   │   ├── SlashCommand.js
│   │   │   └── SubCommand.js
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   ├── permissions.js
│   │   │   ├── embedBuilder.js
│   │   │   ├── canvas.js
│   │   │   ├── captcha.js
│   │   │   ├── antiRaid.js
│   │   │   ├── antiNuke.js
│   │   │   ├── antiSpam.js
│   │   │   ├── autoMod.js
│   │   │   ├── cooldownManager.js
│   │   │   ├── pagination.js
│   │   │   ├── buttons.js
│   │   │   └── validator.js
│   │   │
│   │   ├── databases/
│   │   │   ├── mongoose.js
│   │   │   └── schemas/
│   │   │       ├── guildSchema.js
│   │   │       ├── userSchema.js
│   │   │       ├── warnSchema.js
│   │   │       ├── muteSchema.js
│   │   │       ├── verificationSchema.js
│   │   │       ├── captchaSchema.js
│   │   │       ├── antiRaidSchema.js
│   │   │       ├── antiNukeSchema.js
│   │   │       ├── autoModSchema.js
│   │   │       ├── welcomeSchema.js
│   │   │       ├── goodbyeSchema.js
│   │   │       ├── loggingSchema.js
│   │   │       └── blacklistSchema.js
│   │   │
│   │   ├── config/
│   │   │   ├── config.js
│   │   │   ├── colors.js
│   │   │   └── emojis.js
│   │   │
│   │   └── events/
│   │       ├── ready.js
│   │       ├── messageCreate.js
│   │       ├── messageDelete.js
│   │       ├── messageUpdate.js
│   │       ├── interactionCreate.js
│   │       ├── guildMemberAdd.js
│   │       ├── guildMemberRemove.js
│   │       ├── guildCreate.js
│   │       ├── guildDelete.js
│   │       ├── guildBanAdd.js
│   │       ├── guildBanRemove.js
│   │       ├── channelCreate.js
│   │       ├── channelDelete.js
│   │       ├── channelUpdate.js
│   │       ├── roleCreate.js
│   │       ├── roleDelete.js
│   │       ├── roleUpdate.js
│   │       ├── voiceStateUpdate.js
│   │       ├── inviteCreate.js
│   │       └── inviteDelete.js
│   │
│   └── commands/
│       ├── slash/
│       │   ├── moderation/
│       │   │   ├── ban.js
│       │   │   ├── kick.js
│       │   │   ├── mute.js
│       │   │   ├── unmute.js
│       │   │   ├── warn.js
│       │   │   ├── warnings.js
│       │   │   ├── purge.js
│       │   │   ├── lockdown.js
│       │   │   ├── slowmode.js
│       │   │   ├── nickname.js
│       │   │   ├── role.js
│       │   │   └── moderationGroup.js
│       │   │
│       │   ├── anti/
│       │   │   ├── antiRaid.js
│       │   │   ├── antiNuke.js
│       │   │   ├── antiSpam.js
│       │   │   ├── autoMod.js
│       │   │   ├── whitelist.js
│       │   │   ├── blacklist.js
│       │   │   └── antiGroup.js
│       │   │
│       │   ├── verification/
│       │   │   ├── setup.js
│       │   │   ├── verify.js
│       │   │   ├── captcha.js
│       │   │   ├── role.js
│       │   │   ├── log.js
│       │   │   └── verificationGroup.js
│       │   │
│       │   ├── welcome/
│       │   │   ├── setChannel.js
│       │   │   ├── setMessage.js
│       │   │   ├── setImage.js
│       │   │   ├── setColor.js
│       │   │   ├── setCanvas.js
│       │   │   ├── test.js
│       │   │   └── welcomeGroup.js
│       │   │
│       │   ├── goodbye/
│       │   │   ├── setChannel.js
│       │   │   ├── setMessage.js
│       │   │   ├── setImage.js
│       │   │   ├── setColor.js
│       │   │   ├── setCanvas.js
│       │   │   ├── test.js
│       │   │   └── goodbyeGroup.js
│       │   │
│       │   ├── utility/
│       │   │   ├── ping.js
│       │   │   ├── uptime.js
│       │   │   ├── stats.js
│       │   │   ├── help.js
│       │   │   ├── userinfo.js
│       │   │   ├── serverinfo.js
│       │   │   ├── roleinfo.js
│       │   │   ├── avatar.js
│       │   │   ├── banner.js
│       │   │   ├── invite.js
│       │   │   └── utilityGroup.js
│       │   │
│       │   ├── logging/
│       │   │   ├── setChannel.js
│       │   │   ├── setEvents.js
│       │   │   ├── ignore.js
│       │   │   ├── test.js
│       │   │   └── loggingGroup.js
│       │   │
│       │   └── owner/
│       │       ├── eval.js
│       │       ├── exec.js
│       │       ├── reload.js
│       │       ├── restart.js
│       │       ├── servers.js
│       │       ├── broadcast.js
│       │       ├── blacklist.js
│       │       └── ownerGroup.js
│       │
│       └── prefix/
│           ├── moderation/
│           ├── anti/
│           ├── verification/
│           ├── welcome/
│           ├── goodbye/
│           ├── utility/
│           ├── logging/
│           └── owner/
│
├── dashboard/
│   ├── index.js
│   ├── routes/
│   ├── views/
│   └── public/
│
└── assets/
    ├── images/
    │   ├── welcome/
    │   └── goodbye/
    └── fonts/
```

---

## 🗄️ **Database Schemas**

ABYSS uses MongoDB with the following schemas:

| Schema | Purpose | Key Fields |
|--------|---------|------------|
| `guildSchema` | Server settings | prefix, language, disabledCommands |
| `userSchema` | User data | warnings, mutes, blacklist |
| `warnSchema` | Warning records | userId, moderatorId, reason |
| `muteSchema` | Mute records | userId, expiresAt, reason |
| `verificationSchema` | Verification settings | enabled, role, channel, type |
| `captchaSchema` | Captcha data | userId, code, expiresAt |
| `antiRaidSchema` | Anti-raid settings | enabled, threshold, punishment |
| `antiNukeSchema` | Anti-nuke settings | enabled, whitelist, actions |
| `autoModSchema` | Auto-mod settings | rules, punishments, ignored |
| `welcomeSchema` | Welcome settings | channel, message, image, canvas |
| `goodbyeSchema` | Goodbye settings | channel, message, image, canvas |
| `loggingSchema` | Logging config | channel, events, ignored |
| `blacklistSchema` | Blacklisted entities | targetId, reason, expires |

---

## 🎨 **Canvas Templates**

ABYSS includes 5 beautiful canvas templates:

### Welcome Templates
1. **Classic** - Simple and elegant
2. **Modern** - Clean design with gradients
3. **Gaming** - For gaming communities
4. **Minimal** - Minimalist design
5. **Custom** - Fully customizable

### Goodbye Templates
1. **Classic** - Simple farewell
2. **Modern** - Clean departure card
3. **Gaming** - Game-themed goodbye
4. **Minimal** - Minimalist design
5. **Custom** - Fully customizable

---

## 🚀 **Deployment Options**

### Option 1: Local Deployment
```bash
npm start
```

### Option 2: PM2 (Recommended for Production)
```bash
npm install -g pm2
npm run pm2
pm2 save
pm2 startup
```

### Option 3: Docker
```bash
docker build -t abyss-bot .
docker run -d --name abyss-bot --env-file .env abyss-bot
```

### Option 4: Heroku
```bash
heroku create abyss-bot
heroku addons:create mongolab
heroku config:set TOKEN=your_token
git push heroku main
```

### Option 5: Replit
- Import from GitHub
- Add secrets in .env
- Run npm start

---

## 🤝 **Contributing**

We welcome contributions from the community!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines
- Follow existing code style
- Add comments for complex logic
- Update documentation
- Test your changes
- Be respectful to others

### Reporting Issues
- Use GitHub Issues
- Provide detailed description
- Include steps to reproduce
- Add screenshots if applicable

---

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 ABYSS Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 💬 **Support & Community**

### Join Our Community
Get help, suggest features, and connect with other ABYSS users:

<p align="center">
  <a href="https://discord.gg/yAmED8qhXd">
    <img src="https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord">
  </a>
  <a href="https://github.com/yourusername/abyss-bot/issues">
    <img src="https://img.shields.io/badge/GitHub%20Issues-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Issues">
  </a>
  <a href="https://github.com/yourusername/abyss-bot/discussions">
    <img src="https://img.shields.io/badge/GitHub%20Discussions-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub Discussions">
  </a>
</p>

### Quick Links
- 🌐 **Discord Server:** https://discord.gg/yAmED8qhXd
- 🤖 **Bot Invite:** https://discord.com/oauth2/authorize?client_id=1467842302260281427
- 📚 **Documentation:** Coming Soon
- 🐛 **Issue Tracker:** [GitHub Issues](https://github.com/yourusername/abyss-bot/issues)
- 💡 **Feature Requests:** [GitHub Discussions](https://github.com/yourusername/abyss-bot/discussions)

---

## ⭐ **Star History**

If you find ABYSS useful, please consider giving it a star on GitHub!

[![Star History Chart](https://api.star-history.com/svg?repos=rak-dev1/abyss&type=Date)](https://star-history.com/#yourusername/abyss-bot&Date)

---

## 🙏 **Acknowledgements**

ABYSS wouldn't be possible without these amazing projects:

- [Discord.js](https://discord.js.org/) - Discord API library
- [Mongoose](https://mongoosejs.com/) - MongoDB ODM
- [Canvas](https://www.npmjs.com/package/canvas) - Image generation
- [Express](https://expressjs.com/) - Web framework
- And all our amazing contributors!

---

<p align="center">
  <b>ABYSS</b> - Secure your Discord community with the power of the abyss.
</p>

<p align="center">
  <i>Made with ❤️ by the ABYSS Community</i>
</p>

<p align="center">
  <a href="https://discord.gg/yAmED8qhXd">
    <img src="https://img.shields.io/discord/1467842302260281427?color=5865F2&logo=discord&logoColor=white&label=Join%20Us%20on%20Discord&style=for-the-badge" alt="Discord">
  </a>
</p>

---

## ⚡ **Quick Start**

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/abyss-bot.git

# 2. Navigate to directory
cd abyss-bot

# 3. Install dependencies
npm install

# 4. Configure environment
cp .env.example .env
# Edit .env with your Discord bot token and MongoDB URI

# 5. Start the bot
npm start
```

**Your Discord community is now protected by ABYSS!** 🛡️

---

<p align="center">
  <img src="https://img.shields.io/github/last-commit/yourusername/abyss-bot" alt="Last Commit">
  <img src="https://img.shields.io/github/contributors/yourusername/abyss-bot" alt="Contributors">
  <img src="https://img.shields.io/github/issues/yourusername/abyss-bot" alt="Issues">
  <img src="https://img.shields.io/github/issues-pr/yourusername/abyss-bot" alt="Pull Requests">
</p>
