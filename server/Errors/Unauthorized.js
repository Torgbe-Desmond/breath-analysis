const CustomError = require("./custom-error-handler");
const { StatusCodes } = require("http-status-codes");

class Unauthorized extends CustomError {
  constructor(message) {
    super(message, StatusCodes.UNAUTHORIZED);
    this.message = message;
    this.status = StatusCodes.UNAUTHORIZED;
  }
}

module.exports = Unauthorized;
