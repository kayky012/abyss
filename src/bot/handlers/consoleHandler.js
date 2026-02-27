const readline = require("readline");
const Logger = require("../utils/logger.js");
const { exec } = require("child_process");

class ConsoleHandler {
  constructor(client) {
    this.client = client;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "abyss> "
    });
    
    this.commands = {
      help: this.showHelp.bind(this),
      stats: this.showStats.bind(this),
      guilds: this.listGuilds.bind(this),
      users: this.showUsers.bind(this),
      eval: this.evaluate.bind(this),
      exec: this.execute.bind(this),
      reload: this.reload.bind(this),
      restart: this.restart.bind(this),
      shutdown: this.shutdown.bind(this),
      clear: this.clearConsole.bind(this),
      debug: this.toggleDebug.bind(this),
      db: this.dbStats.bind(this)
    };
    
    this.start();
  }
  
  start() {
    Logger.info("Console handler started. Type 'help' for commands.");
    this.rl.prompt();
    
    this.rl.on("line", async (line) => {
      await this.handleInput(line.trim());
      this.rl.prompt();
    }).on("close", () => {
      Logger.warn("Console closed");
      process.exit(0);
    });
  }
  
  async handleInput(input) {
    if (!input) return;
    
    const args = input.split(/ +/);
    const command = args.shift().toLowerCase();
    
    if (this.commands[command]) {
      try {
        await this.commands[command](args);
      } catch (error) {
        Logger.error(`Console command error:`, error);
      }
    } else {
      Logger.warn(`Unknown command: ${command}`);
    }
  }
  
  showHelp() {
    console.log(`
ABYSS CONSOLE COMMANDS
======================
help     - Show this help
stats    - Show bot statistics
guilds   - List all guilds
users    - Show user statistics
eval     - Execute JavaScript code
exec     - Execute shell command
reload   - Reload commands
restart  - Restart the bot
shutdown - Shutdown the bot
clear    - Clear console
debug    - Toggle debug mode
db       - Database statistics
    `);
  }
  
  showStats() {
    const stats = this.client.getBotStats();
    console.log(`
ABYSS STATISTICS
================
Guilds:     ${stats.guilds}
Users:      ${stats.users}
Channels:   ${stats.channels}
Commands:   ${stats.commands.slash} slash, ${stats.commands.prefix} prefix
Uptime:     ${stats.uptime}
Ping:       ${stats.ping}ms
Memory:     ${stats.memory} MB
Node:       ${stats.nodeVersion}
Discord.js: ${stats.discordVersion}
    `);
  }
  
  listGuilds() {
    console.log("\nABYSS GUILDS\n============");
    this.client.guilds.cache.forEach(guild => {
      console.log(`${guild.name} (${guild.id}) - ${guild.memberCount} members`);
    });
    console.log(`Total: ${this.client.guilds.cache.size} guilds\n`);
  }
  
  showUsers() {
    const total = this.client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
    console.log(`\nTotal Users: ${total}\n`);
  }
  
  async evaluate(args) {
    const code = args.join(" ");
    if (!code) return Logger.warn("Please provide code");
    
    try {
      const result = eval(code);
      console.log("Result:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  }
  
  async execute(args) {
    const command = args.join(" ");
    if (!command) return Logger.warn("Please provide command");
    
    exec(command, (error, stdout, stderr) => {
      if (error) console.error("Error:", error.message);
      if (stderr) console.warn("Stderr:", stderr);
      if (stdout) console.log(stdout);
    });
  }
  
  async reload() {
    Logger.info("Reloading commands...");
    this.client.slashCommands.clear();
    this.client.prefixCommands.clear();
    
    const commandHandler = require("./commandHandler.js");
    await commandHandler(this.client);
    
    Logger.success("Commands reloaded");
  }
  
  async restart() {
    Logger.warn("Restarting...");
    process.exit(1);
  }
  
  async shutdown() {
    Logger.warn("Shutting down...");
    await this.client.shutdown();
    process.exit(0);
  }
  
  clearConsole() {
    console.clear();
    Logger.info("Console cleared");
  }
  
  toggleDebug() {
    const current = process.env.DEBUG === "true";
    process.env.DEBUG = (!current).toString();
    Logger.info(`Debug mode: ${process.env.DEBUG === "true" ? "ON" : "OFF"}`);
  }
  
  async dbStats() {
    try {
      const mongoose = require("mongoose");
      if (mongoose.connection.readyState !== 1) {
        return Logger.warn("Database not connected");
      }
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log("\nDATABASE STATISTICS\n===================");
      
      for (const collection of collections) {
        const count = await mongoose.connection.db.collection(collection.name).countDocuments();
        console.log(`${collection.name}: ${count} documents`);
      }
      console.log("");
    } catch (error) {
      Logger.error("Database error:", error);
    }
  }
}

module.exports = ConsoleHandler;