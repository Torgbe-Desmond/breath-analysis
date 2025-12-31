const express = require("express");
const CategoryService = require("../services");
const router = express.Router();
const _categoryService = new CategoryService();

// CREATE category
router.post("/", async (req, res) => {
  try {
    const results = await _categoryService.create(req.body);
    res.status(results.status).json(results);
  } catch (err) {
    res.status(500).json({ data: null, message: err.message, status: 500 });
  }
});

// SEED categories
router.post("/seed-categories", async (req, res) => {
  const results = await _categoryService.seed(req.body);
  res.status(results.status).json(results);
});

// READ all categories
router.get("/", async (req, res) => {
  const results = await _categoryService.getAll();
  res.status(results.status).json(results);
});

// READ single category
router.get("/:id", async (req, res) => {
  const results = await _categoryService.getById(req.params.id);
  res.status(results.status).json(results);
});

// UPDATE category
router.put("/:id", async (req, res) => {
  const results = await _categoryService.update(req.params.id, req.body);
  res.status(results.status).json(results);
});

// DELETE category
router.delete("/:id", async (req, res) => {
  const results = await _categoryService.delete(req.params.id);
  res.status(results.status).json(results);
});

module.exports = router;
