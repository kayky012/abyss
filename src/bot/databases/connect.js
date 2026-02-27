const mongoose = require("mongoose");
const Logger = require("../utils/logger.js");

module.exports = async (client) => {
  if (!client.config.mongoUri) {
    Logger.warn("MongoDB URI not provided, skipping database connection");
    return false;
  }

  try {
    Logger.info("Connecting to MongoDB...");

    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    await mongoose.connect(client.config.mongoUri, options);
    
    Logger.success("MongoDB connected successfully");

    mongoose.connection.on("error", (err) => {
      Logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      Logger.warn("MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      Logger.success("MongoDB reconnected");
    });

    return true;

  } catch (error) {
    Logger.error("Failed to connect to MongoDB:", error.message);
    Logger.info("Make sure MongoDB is running and MONGO_URI is correct in .env");
    return false;
  }
};