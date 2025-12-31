const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const Category = require("../models/Category");
const mongoose = require("mongoose");
const Response = require("../models/Response");
// CREATE question
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let createdQuestions = [];
    // Create the question
    for (const question of req.body) {
      const newQuestion = await Question.create([question], { session });
      // If you want to add this question to a category

      if (newQuestion) {
        createdQuestions.push(...newQuestion);
        if (question.categoryId) {
          await Category.findByIdAndUpdate(
            question.categoryId,
            { $push: { questionIds: newQuestion[0]._id } },
            { session, new: true }
          );
        }
      } else {
        continue;
      }
    }

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: "All fields saved to database successfully!",
      questions: createdQuestions,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ success: false, error: err.message });
  }
});

// READ all questions
router.get("/", async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ single question
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findOne({ id: req.params.id });
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.status(200).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE question
router.put("/:id", async (req, res) => {
  try {
    const question = await Question.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!question) return res.status(404).json({ error: "Question not found" });
    res.status(200).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /responses/search/:id
router.get("/search/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: "Please provide an ID" });
    }

    const response = await Response.findById(id).select("answers");

    if (!response) {
      return res.status(404).json({ message: "Response not found" });
    }

    // Fetch all questions that match the answers
    const questionIds = response.answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    // Map questionId to text for easy lookup
    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id] = q.label;
    });

    // Attach question text to each answer
    const answersWithQuestions = response.answers.map((a) => ({
      ...a.toObject(),
      questionText: questionMap[a.questionId] || "Question not found",
    }));

    res.json(answersWithQuestions);
  } catch (error) {
    console.log(error);
  }
});


router.post("/search", async (req, res, next) => {
  try {
    const { value } = req.body;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    if (!value) {
      return res
        .status(400)
        .json({ message: "Please provide a value to filter" });
    }

    /**
     * This works for:
     * - answers.value: "3-5 years"
     * - answers.value: ["3-5 years", "5-7 years"]
     */
    const matchQuery = {
      "answers.value": value,
    };

    // Total count (for pagination UI)
    const total = await Response.countDocuments(matchQuery);

    // Paginated results
    const results = await Response.find(matchQuery)
      .select("_id")
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      page,
      limit,
      total,
      hasMore: skip + results.length < total,
      results,
    });
  } catch (err) {
    next(err);
  }
});


// DELETE a single question by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the question to get its categoryId
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    const categoryId = question.categoryId;

    // Delete the question
    await Question.deleteOne({ _id: id });

    // Remove the deleted questionId from its category
    await Category.updateOne(
      { _id: categoryId },
      { $pull: { questionIds: id } }
    );

    res.status(200).json({
      message: "Question deleted and removed from category successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:categoryId/insights", async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;


    const category = await Category.findById(categoryId).lean();
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // ✅ TOTAL COUNT (this is the key part)
    const totalQuestions = await Question.countDocuments({ categoryId });

    // Fetch paginated questions
    const questions = await Question.find({ categoryId })
      .skip(skip)
      .limit(limit)
      .lean();

    const questionIds = questions.map((q) => q._id);

    // Fetch responses for these questions
    const responses = await Response.find({
      "answers.questionId": { $in: questionIds },
    }).lean();

    // Map answers to questions
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

      // Format answers based on question type
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
        // text / textarea
        q.answers = relevantAnswers;
      }
    });

    const totalPages = Math.ceil(totalQuestions / limit);
    const hasMore = page < totalPages;

    res.json({
      categoryId,
      category,
      page,
      limit,
      totalQuestions,
      totalPages,
      hasMore,
      questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
