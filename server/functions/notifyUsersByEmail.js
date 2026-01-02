// import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com", // or your SMTP provider
//   port: 587,
//   secure: false, // true for 465, false for 587
//   auth: {
//     user: process.env.MAIL_USER,
//     pass: process.env.MAIL_PASS,
//   },
// });

// /**
//  * Send email to multiple recipients
//  * @param {string[]} recipients - array of email addresses
//  * @param {string} subject
//  * @param {string} text
//  * @param {string} html
//  */
// export async function sendBulkEmail({
//   recipients,
//   subject,
//   text,
//   html,
// }) {
//   if (!Array.isArray(recipients) || recipients.length === 0) {
//     throw new Error("Recipients must be a non-empty array");
//   }

//   const mailOptions = {
//     from: `"Assessment App" <${process.env.MAIL_USER}>`,
//     to: recipients.join(","), // Nodemailer accepts comma-separated list
//     subject,
//     text,
//     html,
//   };

//   return transporter.sendMail(mailOptions);
// }
