const { StatusCodes } = require("http-status-codes");
const { CustomError } = require("../Errors/index");

const errorMiddleware = (err, req, res, next) => {
  const errorObj = {};

  if (err instanceof CustomError) {
    errorObj.message = err.message;
    errorObj.status = err.status;
    return res.status(err.status).json(errorObj);
  }

  errorObj.status = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  errorObj.message = "INTERNAL SERVER ERROR";

  res.status(errorObj.status).json(errorObj);
};

module.exports = errorMiddleware;
