const { StatusCodes } = require("http-status-codes");

const errorMiddleware = (err, req, res, next) => {
  const status = err.status || err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "INTERNAL SERVER ERROR";

  res.status(status).json({
    message,
    status,
  });
};

module.exports = errorMiddleware;
