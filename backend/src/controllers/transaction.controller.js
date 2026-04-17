const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth.middleware");
/** 
  - Create a new transaction. 
  - THE 10 STEP TRANSFER FLOW:
  - 1. validate request 
  - 2. Validate idempotency key 
  - 3. Check account status  
  - 4. Derive sender balance from ledger 
  - 5. Create transaction (PENDING) 
  - 6. Create DEBIT ledger entry 
  - 7. Create CREDIT ledger entry 
  - 8. Mark transaction COMPLETED
  - 9. Commit MongoDB session
  - 10. Send email notification
*/

async function createTransaction(req, res) {
  /**
   * - validate request
   */
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "fromAccount, toAccount, amount and idempotencyKey are required!",
    });
  }

  const fromUserAccount = await accountModel.findOne({
    _id: fromAccount,
  });

  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!fromUserAccount || !toUserAccount) {
    return res.status(400).json({
      message: "Invalid fromAccount or toAccount",
    });
  }
  /**
   * - Validate idempotency key
   */
  const isTransactionAlreadyExists = await transactionModel.findOne({
    idempotencyKey: idempotencyKey,
  });

  if (isTransactionAlreadyExists) {
    if (isTransactionAlreadyExists.status === "COMPLETED") {
      return res.status(200).json({
        message: "transaction already Proceeded",
        transaction: isTransactionAlreadyExists,
      });
    }
    if (isTransactionAlreadyExists.status === "PENDING") {
      return res.status(202).json({
        message: "Transaction is still Processing",
      });
    }
    if (isTransactionAlreadyExists.status === "FAILED") {
      return res.status(500).json({
        message: "Transaction processing failed, please retry",
      });
    }
    if (isTransactionAlreadyExists.status === "REVERSED") {
      return res.status(500).json({
        message: "Transaction was reversed, please retry",
      });
    }
  }

  /**
   * - Check account status
   */
  if (
    fromUserAccount.status !== "ACTIVE" ||
    toUserAccount.status !== "ACTIVE"
  ) {
    return res.status(400).json({
      message:
        "Both accountTo and fromAccount must be ACTIVE to process transaction",
    });
  }

  /**
   * Derive sender balance from ledger
   */
  const balance = await fromUserAccount.getBalance();

  const user = await require("../models/user.model").findById(req.user._id);
  const isUnlimited = user.role === "ADMIN" || user.systemUser === true;

  if (!isUnlimited && balance < amount) {
    return res.status(400).json({
      message: `Insufficient Balance. Current balance is ${balance}. Requested amount is ${amount}`,
    });
  }

  let transaction;
  try {
    /**
     * Create transaction (PENDING)
     */
    let session = null;
    if (global.supportsTransactions !== false) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
      } catch (e) {
        session = null;
      }
    }

    transaction = (
      await transactionModel.create(
        [
          {
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: "PENDING",
          },
        ],
        session ? { session } : {},
      )
    )[0];

    await ledgerModel.create(
      [
        {
          account: fromAccount,
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      session ? { session } : {},
    );

    const creditLedgerEntry = await ledgerModel.create(
      [
        {
          account: toAccount,
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      session ? { session } : {},
    );

    await transactionModel.findOneAndUpdate(
      { _id: transaction._id },
      { status: "COMPLETED" },
      session ? { session } : {},
    );

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }
  } catch (error) {
    return res.status(400).json({
      message:
        "Transaction is Pending due to some issue, Please try after some time.",
    });
  }

  /**
   * Send email notification
   */
  await emailService.sendTransactionEmail(
    req.user.email,
    req.user.name,
    amount,
    toUserAccount._id,
  );

  return res.status(201).json({
    message: "Transaction completed successfully",
    transaction: transaction,
  });
}

async function createInitialFundsTransaction(req, res) {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message: "toAccount, amount and idempotencyKey are required!",
    });
  }
  const toUserAccount = await accountModel.findOne({
    _id: toAccount,
  });

  if (!toUserAccount) {
    return res.status(400).json({
      message: "Invalid toAccount",
    });
  }
  const fromUserAccount = await accountModel.findOne({
    user: req.user._id,
  });

  if (!fromUserAccount) {
    return res.status(400).json({
      message: "System User account not found",
    });
  }

  let session = null;
  if (global.supportsTransactions !== false) {
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch (e) {
      session = null;
    }
  }

  const [transaction] = await transactionModel.create(
    [
      {
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING",
      },
    ],
    session ? { session } : {},
  );

  await ledgerModel.create(
    [
      {
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT",
      },
    ],
    session ? { session } : {},
  );

  await ledgerModel.create(
    [
      {
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT",
      },
    ],
    session ? { session } : {},
  );

  transaction.status = "COMPLETED";
  await transaction.save(session ? { session } : {});

  if (session) {
    await session.commitTransaction();
    session.endSession();
  }

  return res.status(201).json({
    message: "Initial funds transaction completed successfully",
    transaction: transaction,
  });
}

async function getUserTransactionsController(req, res) {
  try {
    const userAccounts = await accountModel.find({ user: req.user._id }).select('_id');
    const accountIds = userAccounts.map(acc => acc._id);

    const transactions = await transactionModel
      .find({
        $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }]
      })
      .sort({ createdAt: -1 })
      .populate('fromAccount', 'currency status')
      .populate('toAccount', 'currency status');

    res.status(200).json({
      transactions
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
  getUserTransactionsController
};
