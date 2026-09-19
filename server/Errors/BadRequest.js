const CustomError = require("./custom-error-handler");
const { StatusCodes } = require("http-status-codes");

class BadRequest extends CustomError {
  constructor(message) {
    super(message, StatusCodes.BAD_REQUEST);
    this.message = message;
    this.status = StatusCodes.BAD_REQUEST;
  }
}

module.exports = BadRequest;
