const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    message: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Feedback = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedback;
