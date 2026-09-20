const Question = require("../models/question.model");
const Response = require("../models/response.model");
const Insight = require("../models/insight.model");

async function computeCategoryInsights(categoryId) {
  // 1. Load questions
  const questions = await Question.find({ categoryId }).lean();
  const questionIds = questions.map((q) => q._id);

  // 2. Load responses
  const responses = await Response.find({
    "answers.questionId": { $in: questionIds },
  }).lean();

  // 3. Compute insights
  const computedQuestions = questions.map((q) => {
    const relevantAnswers = [];

    responses.forEach((r) => {
      r.answers.forEach((a) => {
        if (a.questionId.toString() === q._id.toString()) {
          relevantAnswers.push(a.value);
        }
      });
    });

    let answers;

    if (q.type === "checkbox") {
      answers = {};
      q.options.forEach((opt) => (answers[opt] = 0));

      relevantAnswers.forEach((arr) => {
        if (Array.isArray(arr)) {
          arr.forEach((opt) => {
            if (answers[opt] !== undefined) answers[opt]++;
          });
        }
      });
    } else if (q.type === "radio" || q.type === "dropdown") {
      answers = {};
      q.options.forEach((opt) => (answers[opt] = 0));

      relevantAnswers.forEach((opt) => {
        if (answers[opt] !== undefined) answers[opt]++;
      });
    } else {
      answers = relevantAnswers;
    }

    return {
      questionId: q._id,
      label: q.label,
      type: q.type,
      totalResponses: relevantAnswers.length,
      answers,
    };
  });

  // 4. Store (UPSERT)
  await Insight.findOneAndUpdate(
    { categoryId },
    {
      categoryId,
      questions: computedQuestions,
      computedAt: new Date(),
    },
    { upsert: true, new: true },
  );
}

module.exports = computeCategoryInsights;
