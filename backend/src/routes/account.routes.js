const express = require("express")
const authMiddleware = require("../middleware/auth.middleware")
const accountController = require("../controllers/account.controller")


const router = express.Router()

/**
 * - POST /api/accounts/
 * - Create a new Account
 * - Protected route
 */
router.post("/", authMiddleware.authMiddleware, accountController.createAccountController)

/**
 * - GET /api/accounts/
 * - Get all accounts of the logged-in user
 * - Protected route
 */
router.get("/", authMiddleware.authMiddleware, accountController.getUserAccountsController)

/**
 * - GET /api/accounts/balance/:accountId
 */
router.get("/balance/:accountId",
  authMiddleware.authMiddleware,
  accountController.getAccountBalanceController,
);

/**
 * - DELETE /api/accounts/:accountId
 * - Delete an account and its associated ledger entries
 * - Protected route
 */
router.delete("/:accountId", authMiddleware.authMiddleware, accountController.deleteAccountController);


module.exports = router