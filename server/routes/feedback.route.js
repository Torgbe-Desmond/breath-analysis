const express = require("express");
const {
  getFeedbacks,
  createFeedback,
  deleteFeedback,
} = require("../controllers/feedback.controller");

const router = express.Router();

router.post("/", createFeedback);

router.get("/", getFeedbacks);

router.delete("/:id", deleteFeedback);

module.exports = router;
