const mongoose = require("mongoose");
const Logger = require("../utils/logger.js");
const fs = require("fs");
const path = require("path");

module.exports = async (client) => {
  try {
    // Connect to MongoDB first
    await connectToMongoDB(client);
    
    // Load schemas after connection is established
    await loadSchemas(client);
    
    // Load data after schemas are loaded
    if (mongoose.connection.readyState === 1) {
      await loadGuildSettings(client);
      await loadUserData(client);
      await loadVerificationData(client);
    }
    
    Logger.success(`Database handler initialized with ${Object.keys(client.schemas || {}).length} schemas`);
    
  } catch (error) {
    Logger.error("Error initializing database handler:", error);
  }
};

async function connectToMongoDB(client) {
  if (!client.config.mongoUri) {
    Logger.warn("MongoDB URI not provided, skipping database connection");
    return false;
  }
  
  try {
    Logger.info("Connecting to MongoDB...");
    
    // Connection options for better reliability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds
      family: 4 // Use IPv4, skip trying IPv6
    };

    await mongoose.connect(client.config.mongoUri, options);
    
    Logger.success("MongoDB connected successfully");
    
    // Handle connection events
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
}

async function loadSchemas(client) {
  try {
    const schemasPath = path.join(__dirname, "../databases/schemas");
    const schemaFiles = fs.readdirSync(schemasPath).filter(file => file.endsWith(".js"));
    
    client.schemas = {};
    
    for (const file of schemaFiles) {
      const schemaName = path.basename(file, ".js");
      const schema = require(path.join(schemasPath, file));
      client.schemas[schemaName] = schema;
      Logger.debug(`Loaded schema: ${schemaName}`);
    }
    
  } catch (error) {
    Logger.error("Error loading schemas:", error);
  }
}

async function loadGuildSettings(client) {
  try {
    if (!client.schemas?.guildSchema) return;
    
    Logger.debug("Loading guild settings...");
    
    const guilds = await client.schemas.guildSchema.find({}).maxTimeMS(5000);
    for (const guild of guilds) {
      client.guildData.set(guild.id, guild);
    }
    
    Logger.debug(`Loaded ${guilds.length} guild settings into cache`);
  } catch (error) {
    Logger.error("Error loading guild settings:", error);
  }
}

async function loadUserData(client) {
  try {
    if (!client.schemas?.userSchema) return;
    
    Logger.debug("Loading user data...");
    
    const users = await client.schemas.userSchema.find({}).maxTimeMS(5000);
    for (const user of users) {
      client.userData.set(user.id, user);
    }
    
    Logger.debug(`Loaded ${users.length} user records into cache`);
  } catch (error) {
    Logger.error("Error loading user data:", error);
  }
}

async function loadVerificationData(client) {
  try {
    if (!client.schemas?.verificationSchema) return;
    
    Logger.debug("Loading verification data...");
    
    const verifications = await client.schemas.verificationSchema.find({ 
      verified: false 
    }).maxTimeMS(5000);
    
    // Initialize verification cache if it doesn't exist
    if (!client.verificationCache) {
      client.verificationCache = new Map();
    }
    
    for (const verification of verifications) {
      client.verificationCache.set(verification.userId, verification);
    }
    
    Logger.debug(`Loaded ${verifications.length} active verifications into cache`);
  } catch (error) {
    Logger.error("Error loading verification data:", error);
  }
}