const express = require("express");
const {
  createCategory,
  seedCategories,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  populateCategoryInsights,
} = require("../controllers/index");

const router = express.Router();

router.post("/", createCategory);
router.post("/seed-categories", seedCategories);

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

router.post("/populating", populateCategoryInsights);

module.exports = router;
