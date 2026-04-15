const {Router} = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const transactionController = require("../controllers/transaction.controller")
const validate = require("../middleware/validate.middleware")
const { transactionSchema, initialFundsSchema } = require("../validators/transaction.validator")

const transactionRoutes = Router()

/**
 * - POST /api/transactions
 * - create a new transaction
 */

transactionRoutes.post("/", authMiddleware.authMiddleware, validate(transactionSchema), transactionController.createTransaction)

/**
 * - GET /api/transactions
 * - Get user transaction history
 */
transactionRoutes.get("/", authMiddleware.authMiddleware, transactionController.getUserTransactionsController);

/**
 * POST /api/transactions/system/initial-funds
 * Create initial funds for transaction from system user
 */
transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware, validate(initialFundsSchema), transactionController.createInitialFundsTransaction);


module.exports = transactionRoutes