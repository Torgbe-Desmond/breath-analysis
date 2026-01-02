const express = require("express");
const ResponseService = require("../service/service");
const router = express.Router();
const {
  createResponse,
  getAllResponse,
  getResponse,
  updateResponse,
  deleteResponse,
  searchResponsesByValue,
  getResponseById,
  getResponseByEmail,
} = require("../controllers/index");

// CREATE response
router.post("/", createResponse);

// READ all responses
router.get("/", getAllResponse);

// READ single response by ID
router.get("/:id", getResponse);

// UPDATE response
router.put("/:id", updateResponse);

// DELETE response
router.delete("/:id", deleteResponse);

// SEARCH responses by value with pagination
router.post("/search", searchResponsesByValue);

router.get("/search/:id", getResponseById);

router.post("/email", getResponseByEmail);

module.exports = router;
