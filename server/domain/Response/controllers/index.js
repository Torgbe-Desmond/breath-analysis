const express = require("express");
const ResponseService = require("../service");
const router = express.Router();
const responseService = new ResponseService();

// CREATE response
router.post("/", async (req, res) => {
  const { answers, email } = req.body;
  const results = await responseService.create(answers, email);
  res.status(results.status).json(results);
});

// READ all responses
router.get("/", async (req, res) => {
  const results = await responseService.getAll();
  res.status(results.status).json(results);
});

// READ single response by ID
router.get("/:id", async (req, res) => {
  const results = await responseService.getById(req.params.id);
  res.status(results.status).json(results);
});

// UPDATE response
router.put("/:id", async (req, res) => {
  const { answers } = req.body;
  const results = await responseService.update(req.params.id, answers);
  res.status(results.status).json(results);
});

// DELETE response
router.delete("/:id", async (req, res) => {
  const results = await responseService.delete(req.params.id);
  res.status(results.status).json(results);
});

// SEARCH responses by value with pagination
router.post("/search", async (req, res) => {
  const { value } = req.body;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const results = await responseService.byValue(value, page, limit, skip);
  res.status(results.status).json(results);
});

router.get("/search/:id", async (req, res) => {
  const { id } = req.params;
  const results = await responseService.getById(id);
  res.status(results.status).json(results);
});

router.post("/email", async (req, res) => {
  const { email } = req.body;
  const results = await responseService.byEmail(email);
  res.status(results.status).json(results);
});

module.exports = router;
