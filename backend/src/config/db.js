const mongoose = require("mongoose");

function connectDB() {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Successfully connected to the database");
    })
    .catch((err) => {
      console.log("Error connecting to database", err);
      process.exit(1);
    });
}

module.exports = connectDB;
