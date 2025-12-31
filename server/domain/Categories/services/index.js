const mongoose = require("mongoose");
const Category = require("../model/Category");
const Question = require("../../Questions/model/Question");

class ResponseModel {
  constructor(data, message, status) {
    this.data = data;
    this.message = message;
    this.status = status;
  }
}

class CategoryService {
  constructor() {}

  // Seed multiple categories (skip duplicates)
  async seedCategories(data) {
    try {
      const result = await Category.insertMany(data, { ordered: false });
      return new ResponseModel(result, "Categories seeded successfully", 201);
    } catch (error) {
      if (error.code === 11000) {
        return new ResponseModel(null, "Some categories already exist", 409);
      }
      return new ResponseModel(null, "Server error", 500);
    }
  }

  // Create a single category
  async create(data) {
    try {
      const category = await Category.create(data);
      return new ResponseModel(category, "Category created successfully", 201);
    } catch (err) {
      return new ResponseModel(null, err.message, 400);
    }
  }

  // Get all categories
  async getAll() {
    try {
      const categories = await Category.find();
      return new ResponseModel(
        categories,
        "Categories fetched successfully",
        200
      );
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // Get single category by ID (populate questions)
  async getById(id) {
    try {
      const category = await Category.findById(id).populate("questionIds");
      if (!category) {
        return new ResponseModel(null, "Category not found", 404);
      }
      return new ResponseModel(category, "Category fetched successfully", 200);
    } catch (err) {
      return new ResponseModel(null, err.message, 500);
    }
  }

  // Update category by ID
  async update(id, body) {
    try {
      const category = await Category.findByIdAndUpdate(id, body, {
        new: true,
        runValidators: true,
      });

      if (!category) {
        return new ResponseModel(null, "Category not found", 404);
      }

      return new ResponseModel(category, "Category updated successfully", 200);
    } catch (err) {
      return new ResponseModel(null, err.message, 400);
    }
  }

  // Delete category + associated questions using transaction
  async delete(id) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const category = await Category.findById(id).session(session);
      if (!category) {
        await session.abortTransaction();
        session.endSession();
        return new ResponseModel(null, "Category not found", 404);
      }

      // Delete all questions in this category
      if (category.questionIds && category.questionIds.length > 0) {
        await Question.deleteMany({
          _id: { $in: category.questionIds },
        }).session(session);
      }

      // Delete the category itself
      await Category.findByIdAndDelete(id).session(session);

      await session.commitTransaction();
      session.endSession();

      return new ResponseModel(
        null,
        "Category and associated questions deleted successfully",
        200
      );
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      return new ResponseModel(null, err.message, 500);
    }
  }
}

module.exports = CategoryService;
