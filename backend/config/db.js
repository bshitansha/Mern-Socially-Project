const mongoose = require("mongoose");

// Some networks/computers fail to look up MongoDB Atlas's address correctly.
// This line tells it to use Google's and Cloudflare's address-lookup services instead.
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);

    process.exit(1);
  }
};

module.exports = connectDB;