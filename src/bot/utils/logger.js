const chalk = require("chalk");

class Logger {
  static info(message, ...args) {
    console.log(chalk.blue("[INFO]"), message, ...args);
  }

  static success(message, ...args) {
    console.log(chalk.green("[SUCCESS]"), message, ...args);
  }

  static warn(message, ...args) {
    console.warn(chalk.yellow("[WARN]"), message, ...args);
  }

  static error(message, ...args) {
    console.error(chalk.red("[ERROR]"), message, ...args);
  }

  static debug(message, ...args) {
    if (process.env.DEBUG === "true") {
      console.log(chalk.gray("[DEBUG]"), message, ...args);
    }
  }

  static command(commandName, userId, userName, guildId, guildName) {
    console.log(
      chalk.magenta("[COMMAND]"),
      chalk.cyan(commandName),
      chalk.gray("|"),
      chalk.yellow(`${userName} (${userId})`),
      chalk.gray("|"),
      chalk.green(`${guildName} (${guildId})`)
    );
  }

  static security(type, userId, reason, action) {
    console.log(
      chalk.red("[SECURITY]"),
      chalk.yellow(type),
      chalk.gray("|"),
      chalk.cyan(userId),
      chalk.gray("|"),
      chalk.white(reason),
      action ? chalk.gray("|") + chalk.red(action) : ""
    );
  }

  static database(action, collection, id) {
    console.log(
      chalk.cyan("[DATABASE]"),
      chalk.yellow(action),
      chalk.gray("|"),
      chalk.green(collection),
      chalk.gray("|"),
      chalk.blue(id)
    );
  }

  static event(eventName, ...args) {
    if (process.env.DEBUG === "true") {
      console.log(
        chalk.magenta("[EVENT]"),
        chalk.cyan(eventName),
        ...args
      );
    }
  }

  static anticrash(type, error) {
    console.error(
      chalk.red(`[ANTICRASH] | [${type}] |`),
      error
    );
  }
}

module.exports = Logger;