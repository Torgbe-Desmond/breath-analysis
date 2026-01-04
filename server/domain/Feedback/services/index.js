const Feedback = require("../model/Feedback");
const BadRequest = require("../../../Errors/BadRequest");
const NotFound = require("../../../Errors/Notfound");


class ResponseModel {
  constructor(data, message, status) {
    this.data = data;
    this.message = message;
    this.status = status;
  }
}

class FeedbackService {
  constructor() {}

  async create(feedback, { session }) {
    if (!feedback) {
      throw new BadRequest("Feed back is required");
    }
    await Feedback.create([feedback], { session });
    return new ResponseModel(null, "Feedback created successfully", 201);
  }

  async getAll(limit, page, skip) {
    const totalFeedbacks = await Feedback.countDocuments();
    const totalPages = Math.ceil(totalFeedbacks / limit);
    const hasMore = page < totalPages;
    const feedback = await Feedback.find().skip(skip).limit(limit).lean();

    return new ResponseModel(
      { feedback, totalPages, hasMore, totalFeedbacks, page, limit },
      "Questions fetched successfully",
      200
    );
  }

  async delete(id, { session }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequest("Invalid feedback ID");
    }

    const feedback = await Feedback.findById(id).session(session);
    if (!feedback) {
      throw new NotFound("Feedback not found");
    }

    await Feedback.deleteOne({ _id: id }).session(session);

    return new ResponseModel(
      { feedback, totalPages, hasMore, totalFeedbacks, page, limit },
      "Questions fetched successfully",
      200
    );
  }
}

module.exports = FeedbackService;
