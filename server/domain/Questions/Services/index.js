const mongoose = require("mongoose");
const Question = require("../model/Question");
const Category = require("../../Categories/model/Category");
const Response = require("../../Response/model/Response");
const Insights = require("../../Insights/model/Insights");
const NotFound = require("../../../Errors/Notfound");
const BadRequest = require("../../../Errors/BadRequest");

class ResponseModel {
  constructor(data, message, status) {
    this.data = data;
    this.message = message;
    this.status = status;
  }
}

class QuestionService {
  constructor(db) {
    this.db = db;
  }

  // CREATE multiple questions with transaction
  async create(questionsData, { session }) {
    const createdQuestions = [];

    for (const question of questionsData) {
      const newQuestion = await Question.create([question], { session });
      if (newQuestion) {
        createdQuestions.push(...newQuestion);
        if (question.categoryId) {
          await Category.findByIdAndUpdate(
            question.categoryId,
            { $push: { questionIds: newQuestion[0]._id } },
            { session, new: true }
          );
        }
      }
    }

    return new ResponseModel(
      createdQuestions,
      "All questions saved successfully!",
      201
    );
  }

  // READ all questions
  async getAll() {
    const questions = await Question.find();
    return new ResponseModel(questions, "Questions fetched successfully", 200);
  }

  async getAllDashboard(page = 1, limit = 10, skip) {
    try {
      const totalQuestions = await Question.countDocuments();

      const questions = await Question.find().skip(skip).limit(limit).lean();

      const totalPages = Math.ceil(totalQuestions / limit);
      const hasMore = page < totalPages;

      return new ResponseModel(
        { questions, totalPages, hasMore, totalQuestions, page, limit },
        "Questions fetched successfully",
        200
      );
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // READ single question by ID
  async getById(id) {
    const question = await Question.findById(id);
    if (!question) return new NotFound("Question not found");
    return new ResponseModel(question, "Question fetched successfully", 200);
  }

  // UPDATE question
  async delete(id, { session }) {
    const question = await Question.findById(id).session(session);

    if (!question) {
      throw new NotFound("Question not found");
    }

    const categoryId = question.categoryId;

    await Question.deleteOne({ _id: id }, { session });

    if (categoryId) {
      await Category.updateOne(
        { _id: categoryId },
        { $pull: { questionIds: id } },
        { session }
      );
    }

    return new ResponseModel(
      null,
      "Question deleted and removed from category successfully",
      200
    );
  }

  // GET responses for a question by responseId
  async getResponsesById(responseId) {
    const response = await Response.findById(responseId).select("answers");
    if (!response) return new NotFound("Response not found");

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

    return new ResponseModel(answersWithQuestions, "Answers fetched", 200);
  }

  // SEARCH responses by value with pagination
  async searchResponses(value, page = 1, limit = 10) {
    if (!value) return new BadRequest("Please provide a value to filter");

    const skip = (page - 1) * limit;

    const matchQuery = { "answers.value": value };

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
      "Search results fetched",
      200
    );
  }

  // GET category insights
  async getCategoryInsights(categoryId) {
    const category = await Category.findById(categoryId).lean();
    if (!category) throw new NotFound(null, "Category not found", 404);

    const questions = await Question.find({ categoryId }).lean();
    const totalQuestions = questions.length;

    const questionIds = questions.map((q) => q._id);

    // 🔹 Fetch only needed fields
    const responses = await Response.find(
      { "answers.questionId": { $in: questionIds } },
      { answers: 1 }
    ).lean();

    // 🔹 Build answer lookup map
    const answerMap = new Map();

    responses.forEach((r) => {
      r.answers.forEach((a) => {
        const key = a.questionId.toString();
        if (!answerMap.has(key)) {
          answerMap.set(key, []);
        }
        answerMap.get(key).push(a.value);
      });
    });

    // 🔹 Attach insights per question
    questions.forEach((q) => {
      const answers = answerMap.get(q._id.toString()) || [];

      q.totalResponses = answers.length;

      if (q.type === "checkbox") {
        const counts = {};
        q.options.forEach((opt) => (counts[opt] = 0));

        answers.forEach((arr) => {
          if (Array.isArray(arr)) {
            arr.forEach((opt) => {
              if (counts[opt] !== undefined) counts[opt]++;
            });
          }
        });

        q.answers = counts;
      } else if (q.type === "radio" || q.type === "dropdown") {
        const counts = {};
        q.options.forEach((opt) => (counts[opt] = 0));

        answers.forEach((opt) => {
          if (counts[opt] !== undefined) counts[opt]++;
        });

        q.answers = counts;
      } else {
        q.answers = answers;
      }
    });

    return {
      categoryId,
      category,
      questions,
      totalQuestions,
    };
  }
}

module.exports = QuestionService;
