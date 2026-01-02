const express = require("express");
const {
  createQuestion,
  getAllQuestions,
  getAllDashboardQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  getInsight,
} = require("../controllers");

const router = express.Router();

/* ================= CREATE ================= */
router.post("/", createQuestion);

/* ================= READ ================= */
router.get("/", getAllQuestions);
router.get("/dashboard", getAllDashboardQuestions);

/* ✅ MUST COME BEFORE `/:id` */
router.get("/:categoryId/insights", getInsight);

/* ================= SINGLE ================= */
router.get("/:id", getQuestion);

/* ================= UPDATE ================= */
router.put("/:id", updateQuestion);

/* ================= DELETE ================= */
router.delete("/:id", deleteQuestion);

module.exports = router;
