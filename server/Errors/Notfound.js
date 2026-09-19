const CustomError = require("./custom-error-handler");
const { StatusCodes } = require("http-status-codes");

class Notfound extends CustomError {
  constructor(message) {
    super(message, StatusCodes.NOT_FOUND);
    this.message = message;
    this.status = StatusCodes.NOT_FOUND;
  }
}

module.exports = Notfound;
