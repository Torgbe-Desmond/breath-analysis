const express = require("express");
const QuestionService = require("../Services");
const router = express.Router();
const questionService = new QuestionService();

// CREATE questions
router.post("/", async (req, res) => {
  const results = await questionService.create(req.body);
  res.status(results.status).json(results);
});

// READ all questions
router.get("/", async (req, res) => {
  const results = await questionService.getAll();
  res.status(results.status).json(results);
});

// READ single question
router.get("/:id", async (req, res) => {
  const results = await questionService.getById(req.params.id);
  res.status(results.status).json(results);
});

// UPDATE question
router.put("/:id", async (req, res) => {
  const results = await questionService.update(req.params.id, req.body);
  res.status(results.status).json(results);
});

// DELETE question
router.delete("/:id", async (req, res) => {
  const results = await questionService.delete(req.params.id);
  res.status(results.status).json(results);
});

// GET insights for a category
router.get("/:categoryId/insights", async (req, res) => {
  const { categoryId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 3;

  const results = await questionService.getCategoryInsights(
    categoryId,
    page,
    limit
  );

  res.status(results.status).json(results);
});

module.exports = router;
