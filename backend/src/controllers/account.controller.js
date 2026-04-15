const accountModel = require("../models/account.model");

async function createAccountController(req, res) {
  const user = req.user;

  try {
    const account = await accountModel.create({
      user: user._id,
    });

    return res.status(201).json({ account });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

async function getUserAccountsController(req, res) {

  const accounts = await accountModel.find({ user: req.user._id })

  res.status(200).json({
    accounts
  })
}

async function getAccountBalanceController(req, res) {
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id
  })

  if(!account) {
    return res.status(404).json({
      message: "Account not found"
    })
  }
  
  const balance = await account.getBalance();

  res.status(200).json({
    accountId: account._id,
    balance: balance
  })
}

async function deleteAccountController(req, res) {
  const { accountId } = req.params;

  const account = await accountModel.findOne({
    _id: accountId,
    user: req.user._id
  })

  if (!account) {
    return res.status(404).json({
      message: "Account not found"
    });
  }

  const ledgerModel = require("../models/ledger.model");
  await ledgerModel.deleteMany({ account: accountId });
  await accountModel.findByIdAndDelete(accountId);

  res.status(200).json({
    message: "Account deleted successfully"
  });
}


module.exports = {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController,
  deleteAccountController
};
