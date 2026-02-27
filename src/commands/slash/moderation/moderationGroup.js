const { SlashCommandBuilder } = require("discord.js");

// This file serves as a group handler for all moderation commands
// It doesn't actually execute anything but helps organize the commands

module.exports = {
  name: "moderation",
  description: "Moderation commands group",
  category: "moderation",
  
  // This is just a placeholder - actual commands are in separate files
  data: new SlashCommandBuilder()
    .setName("moderation")
    .setDescription("Moderation commands group")
    .addSubcommand(sub => 
      sub.setName("help")
         .setDescription("Show moderation commands help")),
  
  async execute(interaction, client) {
    // This will never be called directly as subcommands are handled separately
    // But we'll provide a helpful message just in case
    const embed = new EmbedBuilder()
      .setColor(client.colors.primary)
      .setTitle("Moderation Commands")
      .setDescription([
        "`/ban` - Ban a user",
        "`/kick` - Kick a user", 
        "`/mute` - Timeout a user",
        "`/unmute` - Remove timeout",
        "`/warn` - Warn a user",
        "`/warnings` - View warnings",
        "`/purge` - Delete messages",
        "`/lockdown` - Lock/unlock channel",
        "`/slowmode` - Set slowmode",
        "`/nickname` - Change nickname",
        "`/role` - Manage roles"
      ].join("\n"))
      .setFooter({ text: "Use /help for all commands" })
      .setTimestamp();
    
    await interaction.reply({ embeds: [embed] });
  }
};