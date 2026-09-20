const express = require("express");
const {
  createQuestion,
  getAllQuestions,
  getAllDashboardQuestions,
  getQuestionsByCategory, // list for assessment
  getQuestion,
  updateQuestion,
  deleteQuestion,
  getInsight,
} = require("../controllers/question.controller");

const router = express.Router();

/* CREATE */
router.post("/", createQuestion);

/* READ — static paths first */
router.get("/", getAllQuestions); // supports ?categoryId=
router.get("/dashboard", getAllDashboardQuestions);

/* Category-scoped (before /:id) */
router.get("/category/:categoryId", getQuestionsByCategory); // assessment list
router.get("/:categoryId/insights", getInsight); // explore insights

/* SINGLE */
router.get("/:id", getQuestion);

/* UPDATE / DELETE */
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

module.exports = router;
