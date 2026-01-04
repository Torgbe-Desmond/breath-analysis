const FeedbackService = require("../services/index");
const _feedbackService = new FeedbackService();
const mongoose = require("mongoose");

const createFeedback = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const results = await _feedbackService.create(req.body, { session });
    await session.commitTransaction();
    res.status(201).json(results);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

const getFeedbacks = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const results = await _feedbackService.getAll(limit, page, skip);
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

const deleteFeedback = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    const result = await _feedbackService.delete(id, { session });

    await session.commitTransaction();
    res.status(result.status).json(result);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = {
  getFeedbacks,
  createFeedback,
  deleteFeedback
};
