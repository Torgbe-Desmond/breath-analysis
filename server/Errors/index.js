const { StatusCodes } = require("http-status-codes");
// love
class CustomError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.message = message;
    this.status = status;
  }
}

class NotFound extends CustomError {
  constructor(message) {
    super(message, StatusCodes.NOT_FOUND);
    this.message = message;
    this.status = StatusCodes.NOT_FOUND;
  }
}

class Unauthorized extends CustomError {
  constructor(message) {
    super(message, StatusCodes.UNAUTHORIZED);
    this.message = message;
    this.status = StatusCodes.UNAUTHORIZED;
  }
}

class BadRequest extends CustomError {
  constructor(message) {
    super(message, StatusCodes.BAD_REQUEST);
    this.message = message;
    this.status = StatusCodes.BAD_REQUEST;
  }
}

module.exports = {
  BadRequest,
  NotFound,
  Unauthorized,
  CustomError,
};
