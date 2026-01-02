const express = require("express");
const router = express.Router();
const homeLayout = "../views/layouts/main";
const response = require("../data/response.json");
const path = require("path");
const fs = require("fs");
const Category = require("../models/Category");
const Question = require("../models/Question");
const Response = require("../models/Response");

router.get("/", async (req, res) => {
  const locals = {
    title: "Bad Breath Patterns",
    description:
      "Analyzing real experiences of bad breath to identify patterns beyond oral hygiene.",
  };

  const totalResponses = await Response.countDocuments();

  const stats = {
    totalResponses,
    commonSmell: "Sulfur",
    commonTrigger: "Food / Gut",
  };

  res.render("home", { locals, stats, layout: homeLayout });
});

/* ========================= EXPLORE ========================= */
router.get("/explore", async (req, res) => {
  const locals = {
    title: "Explore",
    description: "Explore patterns and causes based on community responses.",
  };

  const categories = await Category.find().populate("questionIds");
  const responses = await Response.find();

  res.render("explore", {
    locals,
    layout: homeLayout,
    categories,
    responses,
  });
});

router.get("/contribute", async (req, res) => {
  const locals = {
    title: "Contribute",
    description: "Share your experience to help identify real-world patterns.",
  };

  const categories = await Category.find().lean();

  res.render("contribute", {
    locals,
    layout: homeLayout,
    categories,
  });
});

router.get("/about", (req, res) => {
  const locals = {
    title: "About",
    description:
      "This project analyzes real experiences of bad breath to identify patterns, symptoms, and possible causes beyond oral hygiene.",
  };

  res.render("about", {
    locals,
    layout: homeLayout,
  });
});

router.get("/edit-questions", async (req, res) => {
  const questions = await Question.find();
  const categories = await Category.find();

  res.render("edit", {
    layout: homeLayout,
    questions,
    categories,
  });
});

router.get("/assess", async (req, res) => {
  const categories = await Category.find().populate("questionIds");

  res.render("assess", {
    layout: homeLayout,
    categories,
  });
});



router.get("/data", async (req, res) => {
  const questions = await Question.find().lean();
  res.json({ success: true, questions });
});

module.exports = router;
