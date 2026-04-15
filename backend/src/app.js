/*
 app.js ka kaam hota h server ko create krna and config krna 
config ke aandar middleware and api used baare mein likhte h
*/
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");
const logger = require("./utils/logger");
const globalErrorHandler = require("./middleware/error.middleware");

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [process.env.CLIENT_URL || "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use("/api", limiter);

// Request Parsing
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

// Logging
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));

/**
 * - Routes required
 */
const authRouter = require("./routes/auth.routes");
const accountRouter = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");
const adminRoutes = require("./routes/admin.routes");

/**
 * - Use Routes
 */
app.get("/",(req, res) => {
    res.send("Ledger Service is up and running.")
})

/**
 * - API Documentation
 */
const swaggerDocument = YAML.load(path.join(__dirname, "../swagger.yaml"));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authRouter);
app.use("/api/accounts", accountRouter);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
