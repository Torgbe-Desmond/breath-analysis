const Response = require("../models/response.model");
const Question = require("../models/question.model");
const { sendEmail } = require("../functions/notifyUsersByEmail");
const { getAnswerProgress } = require("../utils/answerStats");

/**
 * Incomplete = has email AND distinct answered questions < total Questions.
 * Uses the same counting helper as ResponseService.byEmail.
 */
async function remindIncompleteAssessments() {
  const totalQuestions = await Question.countDocuments();
  if (totalQuestions === 0) {
    console.log("[remindIncomplete] No questions in DB — skipping");
    return { sent: 0, skipped: 0, failed: 0, incomplete: 0 };
  }

  const cooldownDays = Number(process.env.REMINDER_COOLDOWN_DAYS ?? 3);
  const cooldownMs = cooldownDays * 24 * 60 * 60 * 1000;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const dryRun = process.env.REMINDER_DRY_RUN === "true";
  const now = Date.now();

  const responses = await Response.find({
    email: "123torgbe@gmail.com",
  })
    .select("email answers lastIncompleteReminderAt")
    .lean();

  const incomplete = [];

  for (const doc of responses) {
    const progress = getAnswerProgress(doc.answers, totalQuestions);

    // Complete → skip
    if (progress.isComplete) continue;

    // Cooldown → skip
    if (doc.lastIncompleteReminderAt) {
      const elapsed = now - new Date(doc.lastIncompleteReminderAt).getTime();
      if (elapsed < cooldownMs) continue;
    }

    incomplete.push({
      _id: doc._id,
      email: doc.email,
      answeredCount: progress.answeredCount,
      remaining: progress.remaining,
      progressPercent: progress.progressPercent,
    });
  }

  console.log(
    `[remindIncomplete] totalQuestions=${totalQuestions} scanned=${responses.length} incomplete=${incomplete.length}`,
  );

  let sent = 0;
  let failed = 0;
  const skipped = responses.length - incomplete.length;

  for (const row of incomplete) {
    const subject = "Please complete your Breath Analysis assessment";
    const text = [
      "Hi,",
      "",
      "You started the Breath Analysis form but have not finished every question.",
      `You have answered ${row.answeredCount} of ${totalQuestions} questions (${row.remaining} remaining).`,
      "",
      `Please continue here: ${frontendUrl}/assessment`,
      "",
      "Use the same email address so your saved answers are restored.",
      "",
      "— Breath Analysis",
    ].join("\n");

    const html = `
      <div style="font-family:system-ui,sans-serif;line-height:1.5;max-width:520px">
        <p>Hi,</p>
        <p>You started the <strong>Breath Analysis</strong> form but have not finished every question.</p>
        <p>
          Progress: <strong>${row.answeredCount}</strong> / <strong>${totalQuestions}</strong>
          (${row.remaining} remaining, ${row.progressPercent}%).
        </p>
        <p>
          <a href="${frontendUrl}/assessment"
             style="display:inline-block;padding:10px 16px;background:#1b5e4a;color:#fff;text-decoration:none;border-radius:6px">
            Complete the assessment
          </a>
        </p>
        <p style="color:#555;font-size:14px">
          Use the same email so your previous answers load automatically.
        </p>
        <p style="color:#555;font-size:14px">— Breath Analysis</p>
      </div>
    `;

    if (dryRun) {
      console.log(
        `[remindIncomplete] DRY_RUN → ${row.email} (${row.answeredCount}/${totalQuestions})`,
      );
      sent += 1;
      continue;
    }

    try {
      await sendEmail({ to: row.email, subject, text, html });
      await Response.updateOne(
        { _id: row._id },
        { $set: { lastIncompleteReminderAt: new Date() } },
      );
      sent += 1;
      console.log(`[remindIncomplete] emailed ${row.email}`);
    } catch (err) {
      failed += 1;
      console.error(`[remindIncomplete] ${row.email}:`, err.message);
    }
  }

  const summary = {
    totalQuestions,
    scanned: responses.length,
    incomplete: incomplete.length,
    sent,
    skipped,
    failed,
  };
  console.log("[remindIncomplete] done", summary);
  return summary;
}

module.exports = { remindIncompleteAssessments };
