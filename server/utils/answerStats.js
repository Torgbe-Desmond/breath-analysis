/**
 * Distinct question counting for assessment responses.
 */
function getDistinctQuestionIds(answers) {
  if (!Array.isArray(answers) || answers.length === 0) return [];
  const ids = new Set();
  for (const a of answers) {
    if (a == null || a.questionId == null) continue;
    ids.add(String(a.questionId));
  }
  return [...ids];
}

function countDistinctQuestions(answers) {
  return getDistinctQuestionIds(answers).length;
}

function getAnswerProgress(answers, totalQuestions) {
  const total = Math.max(0, Number(totalQuestions) || 0);
  const distinctQuestionIds = getDistinctQuestionIds(answers);
  const answeredCount = distinctQuestionIds.length;
  const remaining = Math.max(0, total - answeredCount);
  const isComplete = total > 0 && answeredCount >= total;
  const progressPercent =
    total === 0 ? 0 : Math.min(100, Math.round((answeredCount / total) * 100));

  return {
    answeredCount,
    totalQuestions: total,
    remaining,
    isComplete,
    progressPercent,
    distinctQuestionIds,
  };
}

module.exports = {
  getDistinctQuestionIds,
  countDistinctQuestions,
  getAnswerProgress,
};
