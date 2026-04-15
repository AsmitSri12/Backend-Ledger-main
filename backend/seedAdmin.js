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
    // 1. Create System User
    let sysUser = await userModel.findOne({ systemUser: true });
    if (!sysUser) {
      sysUser = await userModel.create({
        name: "System Bank",
        email: "system@ledger.com",
        password: "SystemPassword123!",
        role: "ADMIN",
        systemUser: true
      });
    }

    let sysAccount = await accountModel.findOne({ user: sysUser._id });
    if (!sysAccount) {
      sysAccount = await accountModel.create({
        user: sysUser._id,
        status: "ACTIVE",
        currency: "USD"
      });
    }

    // 2. Create the test Admin User
    const adminEmail = "test-admin@ledger.com";
    const adminPassword = "password123";
    
    // Cleanup old if exists
    const oldAdmin = await userModel.findOne({ email: adminEmail });
    if (oldAdmin) {
      await accountModel.deleteMany({ user: oldAdmin._id });
      await userModel.deleteOne({ _id: oldAdmin._id });
    }

    const adminUser = await userModel.create({
      name: "Super Admin",
      email: adminEmail,
      password: adminPassword,
      role: "ADMIN",
    });

    const adminAccount = await accountModel.create({
      user: adminUser._id,
      status: "ACTIVE",
      currency: "USD"
    });

    // 3. Fund the admin account with 1,000,000,000
    const amount = 1000000000;
    const session = await mongoose.startSession();
    session.startTransaction();

    const [transaction] = await transactionModel.create(
      [{
        fromAccount: sysAccount._id,
        toAccount: adminAccount._id,
        amount,
        idempotencyKey: "SEED-" + Date.now(),
        status: "COMPLETED",
      }],
      { session }
    );

    await ledgerModel.create(
      [{
        account: sysAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      }],
      { session }
    );

    await ledgerModel.create(
      [{
        account: adminAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

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
