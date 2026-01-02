const express = require("express");
const QuestionService = require("../Services");
const mongoose = require("mongoose");

const router = express.Router();
const questionService = new QuestionService();

/* ================= CREATE QUESTION ================= */
const createQuestion = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const results = await questionService.create(req.body, { session });

    await session.commitTransaction();

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
    const results = await questionService.getAll();
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
    const limit = Number(req.query.limit) || 3;

    const results = await questionService.getCategoryInsights(
      categoryId,
      page,
      limit
    );

    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getAllDashboardQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  getInsight,
};
