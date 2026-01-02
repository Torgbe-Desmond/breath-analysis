const { StatusCodes } = require("http-status-codes");

const errorMiddleware = (err, req, res, next) => {
  createCustomError = {
    message: err.message || "INTERNAL SERVER ERROR",
    status: err.status || StatusCodes.INTERNAL_SERVER_ERROR,
  };
  res
    .status(createCustomError.status)
    .json({
      message: createCustomError.message,
      status: createCustomError.status,
    });
};

module.exports = errorMiddleware;
