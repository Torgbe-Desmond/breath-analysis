const mongoose = require("mongoose");
const Question = require("../model/Question");
const Category = require("../../Categories/model/Category");
const Response = require("../../Response/model/Response");

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
  async create(questionsData) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const createdQuestions = [];

      for (const question of questionsData) {
        const newQuestion = await Question.create([question], { session });
        if (newQuestion) {
          createdQuestions.push(...newQuestion);
          // Link to category if categoryId provided
          if (question.categoryId) {
            await Category.findByIdAndUpdate(
              question.categoryId,
              { $push: { questionIds: newQuestion[0]._id } },
              { session, new: true }
            );
          }
        }
      }

      await session.commitTransaction();
      session.endSession();

      return new ResponseModel(
        createdQuestions,
        "All questions saved successfully!",
        201
      );
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return new ResponseModel(null, err.message, 400);
    }
  }

  // READ all questions
  async getAll() {
    try {
      const questions = await Question.find();
      return new ResponseModel(questions, "Questions fetched successfully", 200);
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // READ single question by ID
  async getById(id) {
    try {
      const question = await Question.findById(id);
      if (!question) return new ResponseModel(null, "Question not found", 404);
      return new ResponseModel(question, "Question fetched successfully", 200);
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // UPDATE question
  async update(id, body) {
    try {
      const question = await Question.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });
      if (!question) return new ResponseModel(null, "Question not found", 404);
      return new ResponseModel(question, "Question updated successfully", 200);
    } catch (err) {
      return new ResponseModel(null, err.message, 400);
    }
  }

  // DELETE question + remove from category
  async delete(id) {
    try {
      const question = await Question.findById(id);
      if (!question) return new ResponseModel(null, "Question not found", 404);

      const categoryId = question.categoryId;

      await Question.deleteOne({ _id: id });

      if (categoryId) {
        await Category.updateOne(
          { _id: categoryId },
          { $pull: { questionIds: id } }
        );
      }

      return new ResponseModel(
        null,
        "Question deleted and removed from category successfully",
        200
      );
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // GET responses for a question by responseId
  async getResponsesById(responseId) {
    try {
      const response = await Response.findById(responseId).select("answers");
      if (!response)
        return new ResponseModel(null, "Response not found", 404);

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
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // SEARCH responses by value with pagination
  async searchResponses(value, page = 1, limit = 10) {
    try {
      if (!value)
        return new ResponseModel(null, "Please provide a value to filter", 400);

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
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // GET category insights
  async getCategoryInsights(categoryId, page = 1, limit = 3) {
    try {
      const skip = (page - 1) * limit;

      const category = await Category.findById(categoryId).lean();
      if (!category) return new ResponseModel(null, "Category not found", 404);

      const totalQuestions = await Question.countDocuments({ categoryId });

      const questions = await Question.find({ categoryId })
        .skip(skip)
        .limit(limit)
        .lean();

      const questionIds = questions.map((q) => q._id);

      const responses = await Response.find({
        "answers.questionId": { $in: questionIds },
      }).lean();

      questions.forEach((q) => {
        const relevantAnswers = [];
        responses.forEach((r) => {
          r.answers.forEach((a) => {
            if (a.questionId.toString() === q._id.toString()) {
              relevantAnswers.push(a.value);
            }
          });
        });

        q.totalResponses = relevantAnswers.length;

        if (q.type === "checkbox") {
          const counts = {};
          q.options.forEach((opt) => (counts[opt] = 0));
          relevantAnswers.forEach((ansArray) => {
            if (Array.isArray(ansArray)) {
              ansArray.forEach((opt) => {
                if (counts[opt] !== undefined) counts[opt]++;
              });
            }
          });
          q.answers = counts;
        } else if (q.type === "radio" || q.type === "dropdown") {
          const counts = {};
          q.options.forEach((opt) => (counts[opt] = 0));
          relevantAnswers.forEach((opt) => {
            if (counts[opt] !== undefined) counts[opt]++;
          });
          q.answers = counts;
        } else {
          q.answers = relevantAnswers;
        }
      });

      const totalPages = Math.ceil(totalQuestions / limit);
      const hasMore = page < totalPages;

      return new ResponseModel(
        { categoryId, category, page, limit, totalQuestions, totalPages, hasMore, questions },
        "Category insights fetched",
        200
      );
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }
}

module.exports = QuestionService;
