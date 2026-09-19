const express = require("express");
const {
  createResponse,
  getAllResponse,
  searchResponsesByValue,
  getResponseByEmail,
  downloadResponseJson,
  getResponseById,
  getResponse,
  updateResponse,
  deleteResponse,
} = require("../controllers/response.controller");
const router = express.Router();

// Static / specific routes BEFORE /:id
router.post("/", createResponse);
router.get("/", getAllResponse);
router.post("/search", searchResponsesByValue);
router.post("/email", getResponseByEmail);
router.get("/download/:id", downloadResponseJson);
router.get("/search/:id", getResponseById);

router.get("/:id", getResponse);
router.put("/:id", updateResponse);
router.delete("/:id", deleteResponse);

module.exports = router;
