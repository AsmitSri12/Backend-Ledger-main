const { ZodError } = require("zod");
const AppError = require("../utils/AppError");

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const issues = (error.errors || error.issues || []).map((err) => `${err.path.join(".")}: ${err.message}`);
      return next(new AppError(`Validation Error: ${issues.join(", ")}`, 400));
    }
    next(error);
  }
};

module.exports = validate;
