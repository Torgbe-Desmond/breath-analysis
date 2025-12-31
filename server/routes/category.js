const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const mongoose = require("mongoose");
const Question = require("../models/Question");

// Seed categories
router.post("/seed-categories", async (req, res) => {
  try {
    const categories = req.body;
    // Insert many, skip duplicates
    const result = await Category.insertMany(categories, { ordered: false });
    res.status(201).json({
      success: true,
      message: "Categories seeded successfully",
      data: result,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error (unique constraint)
      return res.status(409).json({
        success: false,
        message: "Some categories already exist",
      });
    }
    res.status(500).json({ success: false, message: "Server error", error });
  }
});

// CREATE category
router.post("/", async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single category
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate(
      "questionIds"
    );
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE category
router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE category
// DELETE category
router.delete("/:id", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const category = await Category.findById(req.params.id).session(session);
    if (!category) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ error: "Category not found" });
    }

    // Delete all questions in this category
    if (category.questionIds.length > 0) {
      await Question.deleteMany({ _id: { $in: category.questionIds } }).session(
        session
      );
    }

    // Delete the category itself
    await Category.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: "Category and associated questions deleted successfully",
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
