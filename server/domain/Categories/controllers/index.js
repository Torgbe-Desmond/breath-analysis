const mongoose = require("mongoose");
const CategoryService = require("../services");
const Category = require("../model/Category");
const Question = require("../../Questions/model/Question");
const Response = require("../../Response/model/Response");
const Insights = require("../../Insights/model/Insights");

const categoryService = new CategoryService();

/* ================= CREATE CATEGORY ================= */
const createCategory = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const results = await categoryService.create(req.body, { session });
    await session.commitTransaction();

    res.status(results.status).json(results);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/* ================= SEED CATEGORIES ================= */
const seedCategories = async (req, res, next) => {
  try {
    const results = await categoryService.seed(req.body);
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

/* ================= GET ALL CATEGORIES ================= */
const getAllCategories = async (req, res, next) => {
  try {
    const results = await categoryService.getAll();
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

/* ================= GET CATEGORY BY ID ================= */
const getCategoryById = async (req, res, next) => {
  try {
    const results = await categoryService.getById(req.params.id);
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE CATEGORY ================= */
const updateCategory = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const results = await categoryService.update(req.params.id, req.body, {
      session,
    });
    await session.commitTransaction();

    res.status(results.status).json(results);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/* ================= DELETE CATEGORY ================= */
const deleteCategory = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const results = await categoryService.delete(req.params.id, { session });
    await session.commitTransaction();
    res.status(results.status).json(results);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/* ================= POPULATE QUESTIONS & INSIGHTS ================= */
const populateCategoryInsights = async (req, res, next) => {
  try {
    const categories = await Category.find().lean();
    const allInsights = [];

    for (const category of categories) {
      const computed = await computedQuestions(category._id);
      if (!computed) continue;

      // Save/update insights in DB
      const insight = await Insights.findOneAndUpdate(
        { categoryId: category._id },
        {
          categoryId: category._id,
          questions: computed,
          computedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      allInsights.push(insight);
    }

    res.status(200).json(allInsights);
  } catch (error) {
    next(error);
  }
};

/* ================= HELPER: COMPUTE QUESTIONS ================= */
async function computedQuestions(categoryId) {
  const questions = await Question.find({ categoryId }).lean();
  const questionIds = questions.map((q) => q._id);

  // Load responses
  const responses = await Response.find({
    "answers.questionId": { $in: questionIds },
  }).lean();

  return questions.map((q) => {
    const relevantAnswers = [];

    responses.forEach((r) => {
      r.answers.forEach((a) => {
        if (a.questionId.toString() === q._id.toString()) {
          relevantAnswers.push(a.value);
        }
      });
    });

    let answers;
    if (q.type === "checkbox") {
      answers = {};
      q.options.forEach((opt) => (answers[opt] = 0));
      relevantAnswers.forEach((arr) => {
        if (Array.isArray(arr)) {
          arr.forEach((opt) => {
            if (answers[opt] !== undefined) answers[opt]++;
          });
        }
      });
    } else if (q.type === "radio" || q.type === "dropdown") {
      answers = {};
      q.options.forEach((opt) => (answers[opt] = 0));
      relevantAnswers.forEach((opt) => {
        if (answers[opt] !== undefined) answers[opt]++;
      });
    } else {
      answers = relevantAnswers;
    }

    return {
      questionId: q._id,
      label: q.label,
      type: q.type,
      totalResponses: relevantAnswers.length,
      answers,
    };
  });
}

module.exports = {
  createCategory,
  seedCategories,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  populateCategoryInsights,
};
