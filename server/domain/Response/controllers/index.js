const express = require("express");
const ResponseService = require("../service/service");
const router = express.Router();
const responseService = new ResponseService();
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs/promises");

// CREATE response
const createResponse = async (req, res, nest) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { answers, email } = req.body;
    const results = await responseService.create(answers, email, { session });
    await session.commitTransaction();
    res.status(201).json(results);
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

// READ all responses
const getAllResponse = async (req, res, next) => {
  try {
    const results = await responseService.getAll();
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

// READ single response by ID
const getResponse = async (req, res, next) => {
  try {
    const results = await responseService.getById(req.params.id);
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

// UPDATE response
const updateResponse = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { answers } = req.body;
    const results = await responseService.update(req.params.id, answers, {
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

// DELETE response
const deleteResponse = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const results = await responseService.delete(req.params.id, { session });
    await session.commitTransaction();
    res.status(results.status).json(results);
  } catch (error) {
    session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

const searchResponsesByValue = async (req, res, next) => {
  try {
    const { value, categoryId } = req.body;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const results = await responseService.byValue(
      value,
      categoryId,
      page,
      limit,
      skip
    );
    res.status(results.status).json(results);
  } catch (error) {
    console.log(error)
    next(error);
  }
};

const getResponseById = async (req, res, next) => {
  try {
    const results = await responseService.getById(req.params.id);
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

const getResponseByEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const results = await responseService.byEmail(email);
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

const downloadResponseJson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await responseService.generateJsonOfResponse(id);
    res.status(results.status).json(results);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createResponse,
  getAllResponse,
  getResponse,
  updateResponse,
  deleteResponse,
  searchResponsesByValue,
  getResponseById,
  getResponseByEmail,
  downloadResponseJson,
};
