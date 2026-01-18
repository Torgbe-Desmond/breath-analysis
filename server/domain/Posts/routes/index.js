const express = require("express");
const {
  getPostsController
} = require("../controllers/index");

const router = express.Router();
router.get("/", getPostsController);


module.exports = router;
