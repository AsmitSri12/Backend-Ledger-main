const { Resend } = require("resend");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const resend = new Resend(process.env.RESEND_API_KEY);

const compileTemplate = (templateName, data) => {
  const filePath = path.join(__dirname, "../templates", `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, "utf-8");
  const template = handlebars.compile(source);
  return template(data);
};

async function sendEmail(to, subject, text, html) {
  try {
    const data = await resend.emails.send({
      from: "Backend Ledger <onboarding@resend.dev>",
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent:", data);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger!";
  const text = `Hello ${name},\n\nThank you for registering at Backend Ledger. We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
  const html = compileTemplate("welcome", { name });

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Completed Successfully - Backend Ledger";
  const text = `Hello ${name},\n\nYour transaction has been completed successfully!\n\nTransaction Details:\nAmount: ${amount}\nTo Account: ${toAccount}\n\nBest regards,\nThe Backend Ledger Team`;
  const html = compileTemplate("transaction", { name, amount, toAccount });

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionFailureEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Failed - Backend Ledger";
  const text = `Hello ${name},\n\nUnfortunately, your transaction could not be completed.\n\nTransaction Details:\nAmount: ${amount}\nTo Account: ${toAccount}\n\nPlease try again or contact support if the problem persists.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hello ${name},</p><p>Unfortunately, your transaction could not be completed.</p><p><strong>Transaction Details:</strong></p><ul><li>Amount: ${amount}</li><li>To Account: ${toAccount}</li></ul><p>Please try again or contact support if the problem persists.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(userEmail, subject, text, html);
}

module.exports = {
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailureEmail,
};