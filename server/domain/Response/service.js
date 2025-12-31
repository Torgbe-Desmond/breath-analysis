const mongoose = require("mongoose");
const Response = require("../Response/model/Response");
const Question = require("../Questions/model/Question");

class ResponseModel {
  constructor(data, message, status) {
    this.data = data;
    this.message = message;
    this.status = status;
  }
}

class ResponseService {
  constructor() {}

  // GET all responses
  async getAll() {
    try {
      const responses = await Response.find();
      if (!responses) {
        return new ResponseModel(null, "No responses found", 404);
      }
      return new ResponseModel(
        responses,
        "Responses fetched successfully",
        200
      );
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // CREATE a response (submit assessment)
  async create(answers, email) {
    try {
      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return new ResponseModel(null, "Invalid payload", 400);
      }

      const response = await Response.create({ answers, email });
      return new ResponseModel(
        response,
        "Response submitted successfully",
        201
      );
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // GET single response by ID
  async getById(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return new ResponseModel(null, "Invalid response ID", 400);
      }

      const response = await Response.findById(id).select("answers");

      if (!response) {
        return new ResponseModel(null, "Response not found", 400);
      }

      // Fetch all questions that match the answers
      const questionIds = response.answers.map((a) => a.questionId);
      const questions = await Question.find({ _id: { $in: questionIds } });

      // Map questionId to text for easy lookup
      const questionMap = {};
      questions.forEach((q) => {
        questionMap[q._id] = q.label;
      });

      // Attach question text to each answer
      const answersWithQuestions = response.answers.map((a) => ({
        ...a.toObject(),
        questionText: questionMap[a.questionId] || "Question not found",
      }));

      return new ResponseModel(
        answersWithQuestions,
        "Response retrieved successfully",
        200
      );
    } catch (error) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // UPDATE response by ID
  async update(id, answers, email) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return new ResponseModel(null, "Invalid response ID", 400);
      }

      if (!answers || !Array.isArray(answers) || answers.length === 0) {
        return new ResponseModel(null, "No answers provided", 400);
      }

      const updatedResponse = await Response.findByIdAndUpdate(
        id,
        { answers, email },
        { new: true, runValidators: true }
      );

      if (!updatedResponse) {
        return new ResponseModel(null, "Response not found", 404);
      }

      return new ResponseModel(
        updatedResponse,
        "Response updated successfully",
        200
      );
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // DELETE response by ID
  async delete(id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return new ResponseModel(null, "Invalid response ID", 400);
      }

      const response = await Response.findById(id);
      if (!response) {
        return new ResponseModel(null, "Response not found", 404);
      }

      await Response.deleteOne({ _id: id });

      return new ResponseModel(null, "Response deleted successfully", 200);
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  async byValue(value, page, limit, skip) {
    try {
      if (!value) {
        return new ResponseModel(null, "Please provide a value to filter", 400);
      }

      const matchQuery = {
        "answers.value": value,
      };

      // Total count (for pagination UI)
      const total = await Response.countDocuments(matchQuery);

      // Paginated results
      const results = await Response.find(matchQuery)
        .select("_id")
        .skip(skip)
        .limit(limit)
        .lean();

      return new ResponseModel(
        { page, limit, total, hasMore: skip + results.length < total, results },
        "Please provide a value to filter",
        200
      );
    } catch (error) {
      return new ResponseModel(null, error.message, 500);
    }
  }
}

module.exports = ResponseService;
