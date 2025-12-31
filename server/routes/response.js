const express = require("express");
const router = express.Router();
const homeLayout = "../views/layouts/main";
const mongoose = require("mongoose");
const Category = require("../models/Category");
const Question = require("../models/Question");
const Response = require("../models/Response");

/* ========================= HOME ========================= */

router.get("", async (req, res) => {
  const response = await Response.find();
  if (!response) {
    return res.status(404).json({ success: false });
  }
  res.json(response);
});

router.post("/submit-assessment", async (req, res) => {
  try {
    const { answers } = req.body;
    console.log("answrs", answers);

    if (!answers || !Array.isArray(answers)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid payload" });
    }

    await Response.create({ answers });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

router.get("/:id", async (req, res) => {
  const response = await Response.findById(req.params.id).populate(
    "answers.questionId"
  );

  if (!response) {
    return res.status(404).json({ success: false });
  }

  res.json({ success: true, data: response });
});

// DELETE a single question by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the question to get its categoryId
    const response = await Response.findById(id);
    if (!response) {
      return res.status(404).json({ error: "Response not found" });
    }
    // Delete the question
    await Response.deleteOne({ _id: id });

    res.status(200).json({
      message: "Response deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a response by ID
router.put("/:id", async (req, res) => {
  const responseId = req.params.id;
  const { answers, email } = req.body;
  console.log("email", email);

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "No answers provided." });
  }

  if (!mongoose.Types.ObjectId.isValid(responseId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid response ID." });
  }

  try {
    const updatedResponse = await Response.findByIdAndUpdate(
      responseId,
      { answers, email },
      { new: true, runValidators: true }
    );

    if (!updatedResponse) {
      return res
        .status(404)
        .json({ success: false, message: "Response not found." });
    }

    res.status(200).json({
      success: true,
      message: "Response updated successfully.",
      data: updatedResponse,
    });
  } catch (err) {
    console.error("Update response error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

module.exports = router;

// [
//     {
//         "_id": "69530f844ec93d9ebcd8b601",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "3-5 years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "People react (Cover nose/ step back)",
//                     "People have told me directly",
//                     "I can smell it myself",
//                     "Tongue coating",
//                     "Medical Confirmation"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Not sure"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Thin coating"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Dry mouth",
//                     "Post-nasal drip",
//                     "Mucus in the throat",
//                     "Frequent throat clearing"
//                 ]
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b7",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Constipation",
//                     "Mucus in throat",
//                     "Gas",
//                     "Acid Reflux"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up",
//                     "After eating",
//                     "Stressed",
//                     "Talking a lot",
//                     "Not talking for a while"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285bd",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Acid reflux/GERD",
//                     "Slow digestion",
//                     "Burping",
//                     "Gas",
//                     "Constipation"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Get worse"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Diary",
//                     "Sugar",
//                     "Carbs",
//                     "Spicy foods",
//                     "Alcohol"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "None"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "None"
//             },
//             {
//                 "questionId": "695177ba8a4cdc66ca4285cc",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Never"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285cf",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Not sure"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping, Mouthwash, Antibiotics, Tonsil removal, Nasal rinses, Supplements, Oral probiotics"
//             },
//             {
//                 "questionId": "695177bc8a4cdc66ca4285d5",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "I have not found anything that helped me "
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285d8",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "I don't really know"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177c18a4cdc66ca4285e4",
//                 "categoryId": "695130baa8b7c84b27479850",
//                 "value": [
//                     "Confidence",
//                     "Social life",
//                     "Work/School",
//                     "Relationships",
//                     "Mental health"
//                 ]
//             },
//             {
//                 "questionId": "695177c28a4cdc66ca4285e7",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "They said there is nothing wrong "
//             },
//             {
//                 "questionId": "695177c38a4cdc66ca4285ea",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "They said there is nothing wrong "
//             },
//             {
//                 "questionId": "695177c38a4cdc66ca4285ed",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "PPIs, Antibiotics"
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Thin coating"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "18-25"
//             }
//         ],
//         "createdAt": "2025-12-29T23:32:20.723Z",
//         "updatedAt": "2025-12-29T23:32:20.723Z",
//         "__v": 0
//     },
//     {
//         "_id": "6953126d4ec93d9ebcd8b606",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "5+ years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "People have told me directly",
//                     "People react (Cover nose/ step back)",
//                     "Tongue coating"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Sour/acidic"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Thick coating"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Yes slightly"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "None"
//                 ]
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b7",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Mucus in throat"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285bd",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Gas",
//                     "Constipation"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Gets better"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Sugar",
//                     "Coffee",
//                     "Diary"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Not done any test"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "None"
//             },
//             {
//                 "questionId": "695177ba8a4cdc66ca4285cc",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Never"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285cf",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Not sure"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping, Mouthwash"
//             },
//             {
//                 "questionId": "695177bc8a4cdc66ca4285d5",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Brushing and gargling with baking soda"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285d8",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "None"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177c18a4cdc66ca4285e4",
//                 "categoryId": "695130baa8b7c84b27479850",
//                 "value": [
//                     "Confidence",
//                     "Social life",
//                     "Work/School",
//                     "Mental health",
//                     "Relationships"
//                 ]
//             },
//             {
//                 "questionId": "695177c28a4cdc66ca4285e7",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "Visited dentist,filled my cavities. And she told me I have white tongue "
//             },
//             {
//                 "questionId": "695177c38a4cdc66ca4285ea",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Thick coating"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "18-25"
//             }
//         ],
//         "createdAt": "2025-12-29T23:44:45.572Z",
//         "updatedAt": "2025-12-29T23:44:45.572Z",
//         "__v": 0
//     },
//     {
//         "_id": "6953149b4ec93d9ebcd8b60d",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "5+ years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "People have told me directly",
//                     "I can smell it myself",
//                     "Mouth tastes bad",
//                     "Tongue coating"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Not sure"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Yes slightly"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Dry mouth",
//                     "Bitter taste",
//                     "Mucus in the throat"
//                 ]
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b7",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Mucus in throat",
//                     "Need to swallow regularly"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up",
//                     "Talking a lot",
//                     "Swallowing mucus",
//                     "Not talking for a while"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285bd",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Burping",
//                     "Slow digestion",
//                     "Gas"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Depends on food"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Sugar",
//                     "Coffee",
//                     "Alcohol",
//                     "Spicy foods",
//                     "Not sure"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "None"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Acid reducers"
//             },
//             {
//                 "questionId": "695177ba8a4cdc66ca4285cc",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Currently"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping, Mouthwash, Tonsil removal, Nasal rinses, Supplements, Oral probiotics, Zinc products, Zinc products ( cb12 mouthwashing)"
//             },
//             {
//                 "questionId": "695177bc8a4cdc66ca4285d5",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "I don’t really know, maybe oral probiotic, but juste for a while"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285d8",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Complicated to say, when i try to wash my tongue, there is a lot of mucus a the back of my mouth which is created, and the smell is located over there"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177c18a4cdc66ca4285e4",
//                 "categoryId": "695130baa8b7c84b27479850",
//                 "value": [
//                     "Confidence",
//                     "Social life",
//                     "Work/School",
//                     "Mental health",
//                     "Relationships"
//                 ]
//             },
//             {
//                 "questionId": "695177c28a4cdc66ca4285e7",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "First one say no halitosis, and second one was not sure about the fact that i have halitosis"
//             },
//             {
//                 "questionId": "695177c38a4cdc66ca4285ea",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "Not yet"
//             },
//             {
//                 "questionId": "695177c48a4cdc66ca4285f0",
//                 "categoryId": "695130baa8b7c84b27479852",
//                 "value": "Just the fact that there are no concrete test for specifically find the real problem of our bad breath, it can be a lot of things, just one or multiple problem in our body, and it’s really hard to get through this, just hope that there will be some scientific recognitions on this disease, in order to heal"
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "18-25"
//             }
//         ],
//         "createdAt": "2025-12-29T23:54:03.809Z",
//         "updatedAt": "2025-12-29T23:54:03.809Z",
//         "__v": 0
//     },
//     {
//         "_id": "695316554ec93d9ebcd8b614",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "1–3 years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "People have told me directly",
//                     "People react (Cover nose/ step back)",
//                     "I can smell it myself",
//                     "Mouth tastes bad",
//                     "Tongue coating"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Fecal/Sewage"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Brown"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Make it worse"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Dry mouth",
//                     "Bitter taste"
//                 ]
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b7",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Frequent throat clearing",
//                     "Tonsil stones",
//                     "Chronic sore throat"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up",
//                     "Breathing through mouth",
//                     "Not talking for a while"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285bd",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Bloating"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Gets better"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Diary",
//                     "Meat",
//                     "Coffee",
//                     "Alcohol",
//                     "Spicy foods"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "None"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "None"
//             },
//             {
//                 "questionId": "695177ba8a4cdc66ca4285cc",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Never"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285cf",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping, Mouthwash"
//             },
//             {
//                 "questionId": "695177bc8a4cdc66ca4285d5",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "My breath gets slightly better after eating "
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285d8",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping "
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177c18a4cdc66ca4285e4",
//                 "categoryId": "695130baa8b7c84b27479850",
//                 "value": [
//                     "Confidence",
//                     "Social life",
//                     "Work/School",
//                     "Mental health",
//                     "Relationships"
//                 ]
//             },
//             {
//                 "questionId": "695177c28a4cdc66ca4285e7",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "Yes but they’re all useless "
//             },
//             {
//                 "questionId": "695177c38a4cdc66ca4285ea",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Brown"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "18-25"
//             }
//         ],
//         "createdAt": "2025-12-30T00:01:25.007Z",
//         "updatedAt": "2025-12-30T00:01:25.007Z",
//         "__v": 0
//     },
//     {
//         "_id": "695317ff4ec93d9ebcd8b62b",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "5+ years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "People have told me directly",
//                     "I can smell it myself",
//                     "Mouth tastes bad"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Not sure"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Yes slightly"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Dry mouth",
//                     "Mouth sores"
//                 ]
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b7",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Bloating"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285bd",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Bloating"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Depends on food"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Not sure"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "None"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "None"
//             },
//             {
//                 "questionId": "695177ba8a4cdc66ca4285cc",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Never"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285cf",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping, Mouthwash"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177c18a4cdc66ca4285e4",
//                 "categoryId": "695130baa8b7c84b27479850",
//                 "value": [
//                     "Confidence",
//                     "Social life",
//                     "Work/School"
//                 ]
//             },
//             {
//                 "questionId": "695177c28a4cdc66ca4285e7",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "No never visited "
//             },
//             {
//                 "questionId": "695177c38a4cdc66ca4285ea",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "Never visited"
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "18-25"
//             }
//         ],
//         "createdAt": "2025-12-30T00:08:31.363Z",
//         "updatedAt": "2025-12-30T00:08:31.363Z",
//         "__v": 0
//     },
//     {
//         "_id": "695318bf4ec93d9ebcd8b62e",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "5+ years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Mouth tastes bad"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Sour/acidic"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Thin coating"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Yes slightly"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Dry mouth",
//                     "Metallic taste"
//                 ]
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b7",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Mucus in throat"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Depends on food"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Not sure"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "H.pylori",
//                     "Candida"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "None"
//             },
//             {
//                 "questionId": "695177ba8a4cdc66ca4285cc",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Never"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285cf",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping, Mouthwash, Nasal rinses, Supplements, Zinc products"
//             },
//             {
//                 "questionId": "695177bc8a4cdc66ca4285d5",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Nothing "
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177c18a4cdc66ca4285e4",
//                 "categoryId": "695130baa8b7c84b27479850",
//                 "value": [
//                     "Relationships",
//                     "Mental health",
//                     "Confidence"
//                 ]
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Thin coating"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "46-50"
//             }
//         ],
//         "createdAt": "2025-12-30T00:11:43.797Z",
//         "updatedAt": "2025-12-30T00:11:43.797Z",
//         "__v": 0
//     },
//     {
//         "_id": "69531a664ec93d9ebcd8b63f",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "5+ years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "People have told me directly",
//                     "People react (Cover nose/ step back)",
//                     "I can smell it myself",
//                     "Mouth tastes bad",
//                     "Tongue coating"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Fecal/Sewage"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Thick coating"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "None"
//                 ]
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b7",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Post-nasal drip",
//                     "Mucus in throat",
//                     "Sinus congestion"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up",
//                     "Swallowing mucus"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285bd",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Acid reflux/GERD",
//                     "Gas"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Get worse"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Diary",
//                     "Sugar",
//                     "Meat",
//                     "Coffee",
//                     "Alcohol"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "GERD",
//                     "Sinusitis"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Acid reducers"
//             },
//             {
//                 "questionId": "695177ba8a4cdc66ca4285cc",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Never"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285cf",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Mouthwash, Antibiotics, Nasal rinses, Oral probiotics"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177c18a4cdc66ca4285e4",
//                 "categoryId": "695130baa8b7c84b27479850",
//                 "value": [
//                     "Confidence",
//                     "Social life",
//                     "Mental health",
//                     "Relationships"
//                 ]
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Thick coating"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "46-50"
//             }
//         ],
//         "createdAt": "2025-12-30T00:18:46.577Z",
//         "updatedAt": "2025-12-30T00:18:46.577Z",
//         "__v": 0
//     },
//     {
//         "_id": "69531bbe4ec93d9ebcd8b661",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "5+ years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "I can smell it myself",
//                     "Tongue coating"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Fecal/Sewage"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Yes slightly"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Dry mouth"
//                 ]
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b7",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Mucus in throat",
//                     "Frequent throat clearing"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up",
//                     "Breathing through mouth"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285bd",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Acid reflux/GERD",
//                     "Stomach pain"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Get worse"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Diary",
//                     "Meat",
//                     "Alcohol"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "None"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "None"
//             },
//             {
//                 "questionId": "695177ba8a4cdc66ca4285cc",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Former"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285cf",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping, Mouthwash"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177c18a4cdc66ca4285e4",
//                 "categoryId": "695130baa8b7c84b27479850",
//                 "value": [
//                     "Confidence",
//                     "Social life",
//                     "Relationships"
//                 ]
//             },
//             {
//                 "questionId": "695177c28a4cdc66ca4285e7",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177c38a4cdc66ca4285ea",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "26-35"
//             }
//         ],
//         "createdAt": "2025-12-30T00:24:30.663Z",
//         "updatedAt": "2025-12-30T00:24:30.663Z",
//         "__v": 0
//     },
//     {
//         "_id": "69531d0f4ec93d9ebcd8b664",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "5+ years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "People have told me directly",
//                     "People react (Cover nose/ step back)",
//                     "I can smell it myself"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Rotten eggs/Sulfur"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Dry mouth",
//                     "Metallic taste",
//                     "Bitter taste"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up",
//                     "Talking a lot",
//                     "Breathing through nose",
//                     "Breathing through mouth",
//                     "Not talking for a while"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285bd",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Acid reflux/GERD",
//                     "Bloating",
//                     "Constipation",
//                     "Stomach pain",
//                     "Gas"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "No change"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Diary",
//                     "Sugar",
//                     "Coffee",
//                     "Alcohol",
//                     "Spicy foods"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "H.pylori",
//                     "GERD"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "None"
//             },
//             {
//                 "questionId": "695177ba8a4cdc66ca4285cc",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Never"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285cf",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Not sure"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping, Mouthwash, Antibiotics, Supplements, Oral probiotics, Zinc products, Tooth Removal"
//             },
//             {
//                 "questionId": "695177bc8a4cdc66ca4285d5",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Nothing"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285d8",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Worsen than before I can taste it and smell it"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177be8a4cdc66ca4285de",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Nothing I didn't cured"
//             },
//             {
//                 "questionId": "695177c18a4cdc66ca4285e4",
//                 "categoryId": "695130baa8b7c84b27479850",
//                 "value": [
//                     "Confidence",
//                     "Social life",
//                     "Work/School",
//                     "Mental health",
//                     "Relationships"
//                 ]
//             },
//             {
//                 "questionId": "695177c28a4cdc66ca4285e7",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "The dentist says no tooth decade and I did ultrasound my stomach no found"
//             },
//             {
//                 "questionId": "695177c38a4cdc66ca4285ea",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177c48a4cdc66ca4285f0",
//                 "categoryId": "695130baa8b7c84b27479852",
//                 "value": "I'm tired of this kind of sickness feels like living but your body is dying"
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "18-25"
//             }
//         ],
//         "createdAt": "2025-12-30T00:30:07.959Z",
//         "updatedAt": "2025-12-30T00:30:07.959Z",
//         "__v": 0
//     },
//     {
//         "_id": "69531e0d4ec93d9ebcd8b667",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "1–3 years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "People react (Cover nose/ step back)"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Not sure"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "No coating"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "None"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up",
//                     "Talking a lot",
//                     "Breathing through nose"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "No change"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Not sure"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "None"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "None"
//             },
//             {
//                 "questionId": "695177ba8a4cdc66ca4285cc",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Never"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285cf",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping, Mouthwash, Tonsil removal, Nasal rinses, Dietary changes"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177c18a4cdc66ca4285e4",
//                 "categoryId": "695130baa8b7c84b27479850",
//                 "value": [
//                     "Confidence",
//                     "Social life",
//                     "Mental health",
//                     "Relationships"
//                 ]
//             },
//             {
//                 "questionId": "695177c28a4cdc66ca4285e7",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "Yes and everything is fine "
//             },
//             {
//                 "questionId": "695177c38a4cdc66ca4285ea",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "They don’t see anything wrong got my tonsil removed and bb seems worse "
//             },
//             {
//                 "questionId": "695177c48a4cdc66ca4285f0",
//                 "categoryId": "695130baa8b7c84b27479852",
//                 "value": "I’m tired of dealing with this people think I do t know I have bb by the way they react when I speak but I try to keep from everyone or social places even family events or my daughters school events"
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "No coating"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "26-35"
//             }
//         ],
//         "createdAt": "2025-12-30T00:34:21.005Z",
//         "updatedAt": "2025-12-30T00:34:21.005Z",
//         "__v": 0
//     },
//     {
//         "_id": "69531efc4ec93d9ebcd8b66a",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "5+ years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "People have told me directly",
//                     "People react (Cover nose/ step back)",
//                     "Mouth tastes bad",
//                     "Tongue coating"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Not sure"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "No"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Dry mouth",
//                     "Bitter taste"
//                 ]
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b7",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Mucus in throat"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up",
//                     "Not talking for a while"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285bd",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Acid reflux/GERD",
//                     "Bloating",
//                     "Constipation"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Gets better"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Sugar",
//                     "Coffee",
//                     "Alcohol"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "GERD"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "None"
//             },
//             {
//                 "questionId": "695177ba8a4cdc66ca4285cc",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Never"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285cf",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Not sure"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping, Mouthwash, Antibiotics, Dietary changes, Supplements, Oral probiotics, Tooth Removal"
//             },
//             {
//                 "questionId": "695177bc8a4cdc66ca4285d5",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Dietary changes"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285d8",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Mouthwash"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177c18a4cdc66ca4285e4",
//                 "categoryId": "695130baa8b7c84b27479850",
//                 "value": [
//                     "Confidence",
//                     "Social life",
//                     "Mental health",
//                     "Relationships"
//                 ]
//             },
//             {
//                 "questionId": "695177c28a4cdc66ca4285e7",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "Dry mouth"
//             },
//             {
//                 "questionId": "695177c38a4cdc66ca4285ea",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "Reflux issues"
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "26-35"
//             }
//         ],
//         "createdAt": "2025-12-30T00:38:20.811Z",
//         "updatedAt": "2025-12-30T00:38:20.811Z",
//         "__v": 0
//     },
//     {
//         "_id": "695320cc4ec93d9ebcd8b679",
//         "answers": [
//             {
//                 "questionId": "695177b58a4cdc66ca4285a2",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "5+ years"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "Constant (all day)"
//             },
//             {
//                 "questionId": "695177b58a4cdc66ca4285a8",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "People react (Cover nose/ step back)",
//                     "I can smell it myself",
//                     "Mouth tastes bad",
//                     "Tongue coating"
//                 ]
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ab",
//                 "categoryId": "695130baa8b7c84b27479848",
//                 "value": "Fecal/Sewage"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285ae",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "695177b68a4cdc66ca4285b1",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Yes slightly"
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b4",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Dry mouth",
//                     "Bleeding gums"
//                 ]
//             },
//             {
//                 "questionId": "695177b78a4cdc66ca4285b7",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Post-nasal drip"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285ba",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Waking up"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285bd",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Acid reflux/GERD",
//                     "Gas"
//                 ]
//             },
//             {
//                 "questionId": "695177b88a4cdc66ca4285c0",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "Gets better"
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c3",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "Diary",
//                     "None"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c6",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": [
//                     "None"
//                 ]
//             },
//             {
//                 "questionId": "695177b98a4cdc66ca4285c9",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "None"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285cf",
//                 "categoryId": "695130baa8b7c84b2747984d",
//                 "value": "Not sure"
//             },
//             {
//                 "questionId": "695177bb8a4cdc66ca4285d2",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Tongue scraping, Mouthwash, Dietary changes, Supplements, Oral probiotics"
//             },
//             {
//                 "questionId": "695177bc8a4cdc66ca4285d5",
//                 "categoryId": "695130baa8b7c84b2747984e",
//                 "value": "Castile soap and zinc mouthwash"
//             },
//             {
//                 "questionId": "695177bd8a4cdc66ca4285db",
//                 "categoryId": "695130baa8b7c84b2747984f",
//                 "value": "No improvement"
//             },
//             {
//                 "questionId": "695177c28a4cdc66ca4285e7",
//                 "categoryId": "695130baa8b7c84b27479851",
//                 "value": "Nothing"
//             },
//             {
//                 "questionId": "695179858a4cdc66ca4285f9",
//                 "categoryId": "695130baa8b7c84b2747984c",
//                 "value": "White"
//             },
//             {
//                 "questionId": "6952de042efbfa4e1480c1b5",
//                 "categoryId": "695130baa8b7c84b2747984a",
//                 "value": "36-45"
//             }
//         ],
//         "createdAt": "2025-12-30T00:46:04.701Z",
//         "updatedAt": "2025-12-30T00:46:04.701Z",
//         "__v": 0
//     }
// ]
