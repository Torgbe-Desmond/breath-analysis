const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "textarea", "radio", "checkbox", "dropdown"],
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

module.exports = Question;
