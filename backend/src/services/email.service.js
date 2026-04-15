const nodemailer = require("nodemailer");
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Warning: Email server connection failed (likely missing credentials). Emails will not be sent.");
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

const compileTemplate = (templateName, data) => {
  const filePath = path.join(__dirname, "../templates", `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, "utf-8");
  const template = handlebars.compile(source);
  return template(data);
};

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
}


