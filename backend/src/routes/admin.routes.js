const express = require("express");
const adminController = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");
const restrictTo = require("../middleware/rbac.middleware");

const router = express.Router();

router.use(authMiddleware.authMiddleware, restrictTo('ADMIN'));

router.get("/users", adminController.getAllUsersController);
router.get("/transactions", adminController.getAllTransactionsController);
router.get("/insights", adminController.getSystemInsightsController);

module.exports = router;
