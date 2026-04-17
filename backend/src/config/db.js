const mongoose = require("mongoose");

function connectDB() {
  const options = {
    serverSelectionTimeoutMS: 10000,
  };
  
  mongoose
    .connect(process.env.MONGO_URL, options)
    .then(async () => {
      console.log("Successfully connected to the database");
      
      // Check if transactions are supported (requires replica set)
      try {
        const admin = mongoose.connection.db.admin();
        const serverStatus = await admin.serverStatus();
        global.supportsTransactions = !!serverStatus.repl;
        if (!global.supportsTransactions) {
          console.warn("MongoDB is running in standalone mode. Transactions will be disabled.");
        }
      } catch (e) {
        global.supportsTransactions = false;
        console.warn("Could not determine MongoDB replica set status. Transactions will be disabled.");
      }
    })
    .catch((err) => {
      console.log("Error connecting to database", err.message);
      process.exit(1);
    });
}

module.exports = connectDB;
