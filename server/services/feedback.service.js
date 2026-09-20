const mongoose = require("mongoose");
const Feedback = require("../models/feedback.model");
const { NotFound, BadRequest } = require("../Errors/index");

class ResponseModel {
  constructor(data, message, status) {
    this.data = data;
    this.message = message;
    this.status = status;
  }
}

class FeedbackService {
  async create(feedback, { session }) {
    if (!feedback || !feedback.message) {
      throw new BadRequest("Feedback message is required");
    }
    const created = await Feedback.create([feedback], { session });
    return new ResponseModel(created[0], "Feedback created successfully", 201);
  }

  async getAll(limit, page, skip) {
    const totalFeedbacks = await Feedback.countDocuments();
    const totalPages = Math.ceil(totalFeedbacks / limit) || 1;
    const hasMore = page < totalPages;
    const feedback = await Feedback.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return new ResponseModel(
      { feedback, totalPages, hasMore, totalFeedbacks, page, limit },
      "Feedback fetched successfully",
      200,
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

    return new ResponseModel(null, "Feedback deleted successfully", 200);
  }
}

module.exports = FeedbackService;
