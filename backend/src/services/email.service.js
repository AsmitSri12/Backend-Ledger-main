require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.BREVO_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

async function sendEmail(to, subject, text, html) {
  try {
    const info = await transporter.sendMail({
      from: '"Backend Ledger" <' + process.env.BREVO_SMTP_USER + ">",
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent to:", to, "MessageId:", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email to", to, ":", error);
    throw error;
  }
}

async function sendRegistrationEmail(userEmail, name) {
  const subject = "Welcome to Backend Ledger!";
  const text = `Hello ${name},\n\nThank you for registering at Backend Ledger. We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; } .container { background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; } .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; } .content { padding: 20px; color: #333; } .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }</style></head><body><div class="container"><div class="header"><h2>Welcome to Backend Ledger!</h2></div><div class="content"><p>Hello <strong>${name}</strong>,</p><p>Thank you for registering at Backend Ledger. We are excited to have you on board!</p><p>If you have any questions, feel free to reply to this email.</p></div><div class="footer"><p>Best regards,<br>The Backend Ledger Team</p></div></div></body></html>`;

  await sendEmail(userEmail, subject, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount) {
  const subject = "Transaction Completed Successfully - Backend Ledger";
  const text = `Hello ${name},\n\nYour transaction has been completed successfully!\n\nTransaction Details:\nAmount: ${amount}\nTo Account: ${toAccount}\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; } .container { background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; } .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; } .content { padding: 20px; color: #333; } .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }</style></head><body><div class="container"><div class="header"><h2>Transaction Successful!</h2></div><div class="content"><p>Hello <strong>${name}</strong>,</p><p>Your transaction has been completed successfully!</p><p><strong>Transaction Details:</strong></p><ul><li>Amount: ${amount}</li><li>To Account: ${toAccount}</li></ul></div><div class="footer"><p>Best regards,<br>The Backend Ledger Team</p></div></div></body></html>`;

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