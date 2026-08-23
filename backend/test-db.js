require("dotenv").config();

const mongoose = require("mongoose");

console.log("Checking MongoDB configuration...");

if (!process.env.MONGO_URI) {
  console.log("ERROR: MONGO_URI is missing.");
  process.exit(1);
}

console.log("MONGO_URI was found.");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("================================");
    console.log("MONGODB CONNECTION SUCCESSFUL");
    console.log("================================");

    process.exit(0);
  })
  .catch((error) => {
    console.log("================================");
    console.log("MONGODB CONNECTION FAILED");
    console.log("================================");
    console.log(error.message);

    process.exit(1);
  });