const fs = require("fs");
const path = require("path");
const Logger = require("../utils/logger.js");

module.exports = async (client) => {
  let slashCount = 0;
  let prefixCount = 0;
  
  // ===== LOAD SLASH COMMANDS =====
  const slashPath = path.join(__dirname, "../../commands/slash");
  
  try {
    if (fs.existsSync(slashPath)) {
      const categories = fs.readdirSync(slashPath);
      
      for (const category of categories) {
        const categoryPath = path.join(slashPath, category);
        if (!fs.statSync(categoryPath).isDirectory()) continue;
        
        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith(".js"));
        
        for (const file of commandFiles) {
          try {
            const command = require(path.join(categoryPath, file));
            
            if (command.name && command.execute) {
              command.category = category;
              command.filePath = path.join(categoryPath, file);
              
              // Create slash command builder if needed
              if (!command.data) {
                const { SlashCommandBuilder } = require("discord.js");
                const builder = new SlashCommandBuilder()
                  .setName(command.name)
                  .setDescription(command.description || "No description");
                
                if (command.options) {
                  for (const opt of command.options) {
                    switch (opt.type) {
                      case 3: // STRING
                        builder.addStringOption(o => {
                          o.setName(opt.name).setDescription(opt.description).setRequired(opt.required || false);
                          if (opt.choices) o.addChoices(...opt.choices);
                          return o;
                        });
                        break;
                      case 4: // INTEGER
                        builder.addIntegerOption(o => {
                          o.setName(opt.name).setDescription(opt.description).setRequired(opt.required || false);
                          if (opt.choices) o.addChoices(...opt.choices);
                          if (opt.min) o.setMinValue(opt.min);
                          if (opt.max) o.setMaxValue(opt.max);
                          return o;
                        });
                        break;
                      case 5: // BOOLEAN
                        builder.addBooleanOption(o => 
                          o.setName(opt.name).setDescription(opt.description).setRequired(opt.required || false));
                        break;
                      case 6: // USER
                        builder.addUserOption(o => 
                          o.setName(opt.name).setDescription(opt.description).setRequired(opt.required || false));
                        break;
                      case 7: // CHANNEL
                        builder.addChannelOption(o => 
                          o.setName(opt.name).setDescription(opt.description).setRequired(opt.required || false));
                        break;
                      case 8: // ROLE
                        builder.addRoleOption(o => 
                          o.setName(opt.name).setDescription(opt.description).setRequired(opt.required || false));
                        break;
                      case 9: // MENTIONABLE
                        builder.addMentionableOption(o => 
                          o.setName(opt.name).setDescription(opt.description).setRequired(opt.required || false));
                        break;
                      case 10: // NUMBER
                        builder.addNumberOption(o => {
                          o.setName(opt.name).setDescription(opt.description).setRequired(opt.required || false);
                          if (opt.min) o.setMinValue(opt.min);
                          if (opt.max) o.setMaxValue(opt.max);
                          return o;
                        });
                        break;
                    }
                  }
                }
                
                command.data = builder;
              }
              
              client.slashCommands.set(command.name, command);
              slashCount++;
              Logger.debug(`Loaded slash command: ${command.name} (${category})`);
            }
          } catch (err) {
            Logger.error(`Error loading slash command ${category}/${file}:`, err.message);
          }
        }
      }
    }
  } catch (error) {
    Logger.error("Error loading slash commands:", error.message);
  }
  
  // ===== LOAD PREFIX COMMANDS =====
  const prefixPath = path.join(__dirname, "../../commands/prefix");
  
  try {
    if (fs.existsSync(prefixPath)) {
      const categories = fs.readdirSync(prefixPath);
      
      for (const category of categories) {
        const categoryPath = path.join(prefixPath, category);
        
        if (!fs.statSync(categoryPath).isDirectory()) {
          if (category.endsWith(".js")) {
            const command = require(path.join(prefixPath, category));
            if (command.name && command.execute) {
              command.category = "general";
              client.prefixCommands.set(command.name, command);
              prefixCount++;
              
              if (command.aliases) {
                command.aliases.forEach(alias => client.prefixCommands.set(alias, command));
              }
              Logger.debug(`Loaded prefix command: ${command.name}`);
            }
          }
          continue;
        }
        
        const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith(".js"));
        
        for (const file of commandFiles) {
          try {
            const command = require(path.join(categoryPath, file));
            
            if (command.name && command.execute) {
              command.category = category;
              client.prefixCommands.set(command.name, command);
              prefixCount++;
              
              if (command.aliases) {
                command.aliases.forEach(alias => client.prefixCommands.set(alias, command));
              }
              
              Logger.debug(`Loaded prefix command: ${command.name} (${category})`);
            }
          } catch (err) {
            Logger.error(`Error loading prefix command ${category}/${file}:`, err.message);
          }
        }
      }
    }
  } catch (error) {
    Logger.error("Error loading prefix commands:", error.message);
  }
  
  Logger.success(`Loaded ${slashCount} slash commands and ${prefixCount} prefix commands`);
  
  // Register slash commands with Discord
  await registerCommands(client);
};

async function registerCommands(client) {
  try {
    const { REST, Routes } = require("discord.js");
    const rest = new REST({ version: "10" }).setToken(client.config.token);
    
    const commands = Array.from(client.slashCommands.values()).map(cmd => cmd.data.toJSON());
    
    if (commands.length === 0) {
      Logger.warn("No slash commands to register");
      return;
    }
    
    if (client.config.devMode) {
      const guild = client.guilds.cache.first();
      if (guild) {
        await rest.put(
          Routes.applicationGuildCommands(client.config.clientId, guild.id),
          { body: commands }
        );
        Logger.success(`Registered ${commands.length} commands for guild: ${guild.name}`);
      }
    } else {
      await rest.put(
        Routes.applicationCommands(client.config.clientId),
        { body: commands }
      );
      Logger.success(`Registered ${commands.length} commands globally`);
    }
  } catch (error) {
    Logger.error("Error registering slash commands:", error);
  }
}