const mongoose = require("mongoose");
const Category = require("../model/Category");
const Question = require("../../Questions/model/Question");
const Insight = require("../../Insights/model/Insights");
const BadRequest = require("../../../Errors/BadRequest");
const NotFound = require("../../../Errors/Notfound");

class ResponseModel {
  constructor(data, message, status) {
    this.data = data;
    this.message = message;
    this.status = status;
  }
}

class CategoryService {
  /* ================= SEED ================= */
  async seed(data, { session }) {
    if (!Array.isArray(data) || data.length === 0) {
      throw new BadRequest("Invalid seed payload");
    }

    try {
      const result = await Category.insertMany(data, {
        ordered: false,
        session,
      });

      return new ResponseModel(result, "Categories seeded successfully", 201);
    } catch (err) {
      // Duplicate key error
      if (err.code === 11000) {
        throw new BadRequest("Some categories already exist");
      }
      throw err;
    }
  }

  /* ================= CATEGORY INSIGHTS ================= */
  async getCategoryInsights(categoryId) {
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      throw new BadRequest("Invalid category ID");
    }

    const insight = await Insight.findOne({ categoryId }).lean();

    if (!insight) {
      return new ResponseModel(
        null,
        "Insights are being computed. Please try again shortly.",
        202
      );
    }

    return new ResponseModel(insight, "Insights fetched from cache", 200);
  }

  /* ================= CREATE ================= */
  async create(data, { session }) {
    if (!data) {
      throw new BadRequest("Invalid category payload");
    }

    const category = await Category.create([data], { session });

    return new ResponseModel(category[0], "Category created successfully", 201);
  }

  /* ================= GET ALL ================= */
  async getAll() {
    const categories = await Category.find();

    return new ResponseModel(
      categories,
      "Categories fetched successfully",
      200
    );
  }

  /* ================= GET BY ID ================= */
  async getById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequest("Invalid category ID");
    }

    const category = await Category.findById(id).populate("questionIds");

    if (!category) {
      throw new NotFound("Category not found");
    }

    return new ResponseModel(category, "Category fetched successfully", 200);
  }

  /* ================= UPDATE ================= */
  async update(id, body, { session }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequest("Invalid category ID");
    }

    const category = await Category.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
      session,
    });

    if (!category) {
      throw new NotFound("Category not found");
    }

    return new ResponseModel(category, "Category updated successfully", 200);
  }

  /* ================= DELETE ================= */
  async delete(id, { session }) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequest("Invalid category ID");
    }

    const category = await Category.findById(id).session(session);

    if (!category) {
      throw new NotFound("Category not found");
    }

    if (category.questionIds?.length) {
      await Question.deleteMany(
        { _id: { $in: category.questionIds } },
        { session }
      );
    }

    await Category.deleteOne({ _id: id }, { session });

    return new ResponseModel(
      null,
      "Category and associated questions deleted successfully",
      200
    );
  }
}

module.exports = CategoryService;
