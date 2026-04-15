const userModel = require("../models/user.model");
const transactionModel = require("../models/transaction.model");
const accountModel = require("../models/account.model");

async function getAllUsersController(req, res) {
  const users = await userModel.find().select('-password');
  res.status(200).json({ users });
}

async function getAllTransactionsController(req, res) {
  const transactions = await transactionModel.find()
    .sort({ createdAt: -1 })
    .populate('fromAccount', 'currency status')
    .populate('toAccount', 'currency status');
  res.status(200).json({ transactions });
}

async function getSystemInsightsController(req, res) {
  const totalUsers = await userModel.countDocuments();
  const totalTransactions = await transactionModel.countDocuments();
  const totalAccounts = await accountModel.countDocuments();

  res.status(200).json({
    insights: {
      totalUsers,
      totalTransactions,
      totalAccounts
    }
  });
}

module.exports = {
  getAllUsersController,
  getAllTransactionsController,
  getSystemInsightsController
};
