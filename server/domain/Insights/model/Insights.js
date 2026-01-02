const mongoose = require("mongoose");

const InsightSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },

    questions: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        label: String,
        type: String,
        totalResponses: Number,
        answers: mongoose.Schema.Types.Mixed,
      },
    ],

    computedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Insight", InsightSchema);
