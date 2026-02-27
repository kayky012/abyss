const { AbyssClient } = require("./bot/AbyssClient.js");
const config = require("./bot/config/config.js");
const Logger = require("./bot/utils/logger.js");
const mongoose = require("mongoose");

const client = new AbyssClient();

const shutdownHandler = async (signal) => {
  Logger.warn(`Received ${signal}. Shutting down gracefully...`);
  await client.shutdown();
  await mongoose.connection.close();
  process.exit(0);
};

process.on("SIGINT", () => shutdownHandler("SIGINT"));
process.on("SIGTERM", () => shutdownHandler("SIGTERM"));

process.on("unhandledRejection", (error) => {
  if (error.code === 10062) return;
  if (error.code === 50001) return;
  if (error.code === 50013) return;
  Logger.error("Unhandled Rejection:", error);
});

process.on("uncaughtException", (error) => {
  if (error.message?.includes("fetch")) return;
  Logger.error("Uncaught Exception:", error);
});

(async () => {
  try {
    if (!config.token || config.token === "") {
      Logger.error("Invalid or missing bot token in .env file");
      process.exit(1);
    }

    if (config.mongoUri && config.mongoUri.includes("mongodb")) {
      await mongoose.connect(config.mongoUri);
      Logger.success("MongoDB Connected");
    }

    await client.loadHandlers();
    await client.login(config.token);
    Logger.success("ABYSS is online");

    setTimeout(() => {
      const ConsoleCommands = require("./bot/handlers/consoleHandler.js");
      client.consoleCommands = new ConsoleCommands(client);
    }, 2000);

  } catch (error) {
    Logger.error("Failed to start:", error.message);
    process.exit(1);
  }
})();