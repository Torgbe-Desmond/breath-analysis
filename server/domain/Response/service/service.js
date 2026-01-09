const mongoose = require("mongoose");
const Response = require("../model/Response");
const Question = require("../../Questions/model/Question");
const NotFound = require("../../../Errors/Notfound");
const BadRequest = require("../../../Errors/BadRequest");
const path = require("path");
const fs = require("fs/promises");

class ResponseModel {
  constructor(data, message, status) {
    this.data = data;
    this.message = message;
    this.status = status;
  }
}

class ResponseService {
  /* ================= GET ALL ================= */
  async getAll() {
    const responses = await Response.find();

    if (!responses || responses.length === 0) {
      throw new NotFound("No responses found");
    }

    return new ResponseModel(responses, "Responses fetched successfully", 200);
  }

  /* ================= CREATE ================= */
  async create(answers, email, { session }) {
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new BadRequest("Invalid payload");
    }

    const response = await Response.create([{ answers, email }], { session });

    return new ResponseModel(
      response[0],
      "Response submitted successfully",
      201
    );
  }

  /* ================= GET BY ID ================= */
  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequest("Invalid response ID");
    }

    const response = await Response.findById(id).select("answers");

    if (!response) {
      throw new NotFound("Response not found");
    }

    const questionIds = response.answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id] = q.label;
    });

    const answersWithQuestions = response.answers.map((a) => ({
      ...a.toObject(),
      questionText: questionMap[a.questionId] || "Question not found",
    }));

    return new ResponseModel(
      answersWithQuestions,
      "Response retrieved successfully",
      200
    );
  }

  /* ================= UPDATE ================= */
  async update(id, answers, email, { session }) {
    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequest("Invalid response ID");
    }

    // Validate answers array
    if (!Array.isArray(answers) || answers.length === 0) {
      throw new BadRequest("No answers provided");
    }

    // Find existing response by email
    const existingResponse = await Response.findOne({ email }).session(session);

    if (existingResponse) {
      // Merge new answers into existing ones
      const map = new Map();

      // Add existing answers to map
      existingResponse.answers.forEach((a) => {
        map.set(a.questionId.toString(), a);
      });

      // Add/overwrite new answers
      answers.forEach((a) => {
        map.set(a.questionId.toString(), a);
      });

      // Preserve original submission order for the new answers
      const mergedAnswers = Array.from(map.values());

      existingResponse.answers = mergedAnswers;

      // Save transactionally
      await existingResponse.save({ session });

      const responseSubmittedLength = existingResponse.answers.length;
      console.log("responseSubmittedLength", responseSubmittedLength);

      return new ResponseModel(
        existingResponse,
        "Response updated successfully",
        200
      );
    }

    // If no existing response, fallback to update by ID
    const updatedResponse = await Response.findByIdAndUpdate(
      id,
      { answers, email },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedResponse) {
      throw new NotFound("Response not found");
    }

    return new ResponseModel(
      updatedResponse,
      "Response updated successfully",
      200
    );
  }

  /* ================= DELETE ================= */
  async delete(id, { session }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequest("Invalid response ID");
    }

    const response = await Response.findById(id);

    if (!response) {
      throw new NotFound("Response not found");
    }

    await Response.deleteOne({ _id: id }, { session });

    return new ResponseModel(null, "Response deleted successfully", 200);
  }

  /* ================= SEARCH BY VALUE ================= */
  async byValue(value, categoryId, questionId, page, limit, skip) {
    if (!value) {
      throw new BadRequest("Please provide a value to filter");
    }

    const matchQuery = {
      answers: {
        $elemMatch: {
          questionId: new mongoose.Types.ObjectId(questionId),
          categoryId: new mongoose.Types.ObjectId(categoryId),
          ...(Array.isArray(value) ? { value: { $in: value } } : { value }),
        },
      },
    };

    const total = await Response.countDocuments(matchQuery);

    const results = await Response.find(matchQuery)
      .select("_id")
      .skip(skip)
      .limit(limit)
      .lean();

    return new ResponseModel(
      {
        page,
        limit,
        total,
        hasMore: skip + results.length < total,
        results,
      },
      "Responses filtered successfully",
      200
    );
  }

  /* ================= GET BY EMAIL ================= */
  async byEmail(email) {
    if (!email) {
      throw new BadRequest("Email is required");
    }

    const response = await Response.findOne({ email });

    if (!response) {
      throw new NotFound("Response not found");
    }

    const formattedResponse = {
      _id: response._id,
      email: response.email,
      answers: response.answers.map((a) => ({
        questionId: a.questionId,
        value: a.value,
      })),
      totalResponses: response.answers.length,
      submittedAt: response.createdAt,
    };

    return new ResponseModel(
      formattedResponse,
      "Response retrieved successfully",
      200
    );
  }

  /* ================= GET ALL ================= */
  async generateJsonOfResponse(id) {
    const responseData = await this.getById(id);
    const response = responseData.data.map((r) => {
      return {
        value: r.value,
        questionText: r.questionText,
      };
    });
    return new ResponseModel(response, "Response retried successfully", 200);
  }
}

module.exports = ResponseService;
