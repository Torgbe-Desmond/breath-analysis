const express = require("express");
const QuestionService = require("../Services");
const mongoose = require("mongoose");
const { redisClient } = require("../../../config/redis");

const DEFAULT_EXPIRATION = 3600;
const MAX_CACHED_CATEGORIES = 5;

const router = express.Router();
const questionService = new QuestionService();

class ResponseModel {
  constructor(data, message, status) {
    this.data = data;
    this.message = message;
    this.status = status;
  }
}

/* ================= CREATE QUESTION ================= */
const createQuestion = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = await questionService.create(req.body, { session });

    await session.commitTransaction();

    const allCategoryIds = results.data.map((result) => result.categoryId);
    const uniqueCategoryIds = [...new Set(allCategoryIds)];

    const pipeline = redisClient.multi();

    for (const categoryId of uniqueCategoryIds) {
      const cacheKey = `insights_${categoryId}`;
      const exists = await redisClient.exists(cacheKey);

      if (exists) pipeline.del(cacheKey);
    }

    const questionsExists = await redisClient.exists("questions");

    if (questionsExists) {
      if (exists) pipeline.del(questionsExists);
    }

    await pipeline.exec();

    res.status(results.status || 201).json(results);
  } catch (err) {
    await session.abortTransaction();
    next(err);
  } finally {
    session.endSession();
  }
};

/* ================= READ ALL QUESTIONS ================= */
const getAllQuestions = async (req, res, next) => {
  try {
    let cached = await redisClient.get(`questions`);
    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    const results = await questionService.getAll();

    await redisClient.set(`questions`, JSON.stringify(results), {
      EX: DEFAULT_EXPIRATION,
    });
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

/* ================= DASHBOARD QUESTIONS (PAGINATED) ================= */
const getAllDashboardQuestions = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const results = await questionService.getAllDashboard(page, limit, skip);
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

/* ================= READ SINGLE QUESTION ================= */
const getQuestion = async (req, res, next) => {
  try {
    const results = await questionService.getById(req.params.id);
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE QUESTION ================= */
const updateQuestion = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = await questionService.update(req.params.id, req.body, {
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

/* ================= DELETE QUESTION ================= */
const deleteQuestion = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const results = await questionService.delete(req.params.id, { session });
    await session.commitTransaction();
    res.status(results.status).json(results);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/* ================= CATEGORY INSIGHT ================= */
const getInsight = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const start = (page - 1) * limit;
    const end = start + limit;

    const cacheKey = `insights_${categoryId}`;

    // 🔹 Try cache
    let cached = await redisClient.get(cacheKey);

    if (cached) {
      await redisClient.zIncrBy("cached_categories", 1, categoryId);

      const cachedData = JSON.parse(cached);

      const totalPages = Math.ceil(cachedData.totalQuestions / limit);

      const data = {
        categoryId: cachedData.categoryId,
        category: cachedData.category,
        questions: cachedData.questions.slice(start, end),
        totalQuestions: cachedData.totalQuestions,
        totalPages,
        page,
        hasMore: page < totalPages,
      };

      return res
        .status(200)
        .json(new ResponseModel(data, "Insight retrieved successfully", 200));
    }

    // 🔹 Cache miss → fetch ALL data once
    const results = await questionService.getCategoryInsights(categoryId);

    const totalPages = Math.ceil(results.totalQuestions / limit);

    // 🔹 Cache eviction (LRU-style)
    const cachedCount = await redisClient.zCard("cached_categories");

    if (cachedCount >= MAX_CACHED_CATEGORIES) {
      const leastVisited = await redisClient.zRange("cached_categories", 0, 0);
      if (leastVisited.length) {
        await redisClient.del(`insights_${leastVisited[0]}`);
        await redisClient.zRem("cached_categories", leastVisited[0]);
      }
    }

    // 🔹 Store ONLY non-pagination data
    await redisClient.set(
      cacheKey,
      JSON.stringify({
        categoryId: results.categoryId,
        category: results.category,
        questions: results.questions,
        totalQuestions: results.totalQuestions,
      }),
      { EX: DEFAULT_EXPIRATION }
    );

    await redisClient.zAdd("cached_categories", {
      score: 1,
      value: categoryId,
    });

    // 🔹 Paginated response
    const data = {
      categoryId: results.categoryId,
      category: results.category,
      questions: results.questions.slice(start, end),
      totalQuestions: results.totalQuestions,
      totalPages,
      page,
      hasMore: page < totalPages,
    };

    return res
      .status(200)
      .json(new ResponseModel(data, "Insight retrieved successfully", 200));
  } catch (error) {
    next(error);
  }
};

// async function getOrSetCache(key, cb) {
//   try {
//     // 1️⃣ Try getting cached data
//     const cachedData = await redisClient.get(key);
//     if (cachedData) {
//       return JSON.parse(cachedData);
//     }

//     // 2️⃣ If not cached, compute fresh data
//     const freshData = await cb();

//     // 3️⃣ Save it to Redis
//     await redisClient.set(key, JSON.stringify(freshData), {
//       EX: DEFAULT_EXPIRATION,
//     });

//     return freshData;
//   } catch (err) {
//     console.error("Redis error:", err);
//     // fallback: return fresh data if Redis fails
//     return cb();
//   }
// }

module.exports = {
  createQuestion,
  getAllQuestions,
  getAllDashboardQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  getInsight,
};
