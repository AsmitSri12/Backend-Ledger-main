const mongoose = require("mongoose");
require("dotenv").config({ path: ".env" });

const userModel = require("./src/models/user.model");
const accountModel = require("./src/models/account.model");
const ledgerModel = require("./src/models/ledger.model");
const transactionModel = require("./src/models/transaction.model");

async function seed() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log("Connected to DB");

  try {
    console.log("Step 1: Creating System User");
    // 1. Create System User
    let sysUser = await userModel.findOne({ email: "system@ledger.com" });
    if (!sysUser) {
      console.log("System user not found, creating...");
      sysUser = await userModel.create({
        name: "System Bank",
        email: "system@ledger.com",
        password: "SystemPassword123!",
        role: "ADMIN",
        systemUser: true
      });
      console.log("System user created");
    } else {
      console.log("System user already exists");
    }

    console.log("Step 2: Creating System Account");
    let sysAccount = await accountModel.findOne({ user: sysUser._id });
    if (!sysAccount) {
      console.log("System account not found, creating...");
      sysAccount = await accountModel.create({
        user: sysUser._id,
        status: "ACTIVE",
        currency: "USD"
      });
      console.log("System account created");
    }

    console.log("Step 3: Cleanup and Admin Creation");
    const adminEmail = "test-admin@ledger.com";
    const adminPassword = "password123";
    
    console.log("Checking for old admin...");
    const oldAdmin = await userModel.findOne({ email: adminEmail });
    if (oldAdmin) {
      console.log("Old admin found, cleaning up...");
      await accountModel.deleteMany({ user: oldAdmin._id });
      await userModel.deleteOne({ _id: oldAdmin._id });
      console.log("Old admin cleaned up");
    }

    console.log("Creating admin user...");
    const adminUser = await userModel.create({
      name: "Super Admin",
      email: adminEmail,
      password: adminPassword,
      role: "ADMIN",
    });
    console.log("Admin user created");

    console.log("Creating admin account...");
    const adminAccount = await accountModel.create({
      user: adminUser._id,
      status: "ACTIVE",
      currency: "USD"
    });
    console.log("Admin account created");

    console.log("Step 4: Funding Admin Account");
    const amount = 1000000000;
    let session = null;
    try {
      const admin = mongoose.connection.db.admin();
      const serverStatus = await admin.serverStatus();
      if (serverStatus.repl) {
        session = await mongoose.startSession();
        session.startTransaction();
      } else {
        console.warn("MongoDB is running in standalone mode. Transactions will be disabled for seeding.");
      }
    } catch (e) {
      session = null;
      console.warn("Transactions not supported, proceeding without transaction.");
    }

    const transaction = new transactionModel({
      fromAccount: sysAccount._id,
      toAccount: adminAccount._id,
      amount,
      idempotencyKey: "SEED-" + Date.now(),
      status: "COMPLETED",
    });
    await transaction.save(session ? { session } : {});

    const debitLedger = new ledgerModel({
      account: sysAccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "DEBIT",
    });
    await debitLedger.save(session ? { session } : {});

    const creditLedger = new ledgerModel({
      account: adminAccount._id,
      amount: amount,
      transaction: transaction._id,
      type: "CREDIT",
    });
    await creditLedger.save(session ? { session } : {});

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    console.log("-----------------------------------------");
    console.log("SEEDED ADMIN ACCOUNT SUCCESSFULLY");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Initial Balance: $${amount}`);
    console.log("-----------------------------------------");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

seed();
