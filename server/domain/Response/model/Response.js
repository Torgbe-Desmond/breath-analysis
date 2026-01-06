const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed, 
      required: true,
    },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    answers: {
      type: [answerSchema],
      required: true,
    },
    email:{
        type:String,
    }
  },
  {
    timestamps: true, // createdAt = submittedAt
  }
);

module.exports = mongoose.model("Response", responseSchema);
