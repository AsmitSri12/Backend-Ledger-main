import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, text: string, html: string) {
  try {
    const data = await resend.emails.send({
      from: 'Backend Ledger <onboarding@resend.dev>',
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent:', data);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export async function sendRegistrationEmail(userEmail: string, name: string) {
  const subject = 'Welcome to Backend Ledger!';
  const text = `Hello ${name},\n\nThank you for registering at Backend Ledger. We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<!DOCTYPE html><html><head><style>body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; } .container { background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: auto; } .header { background-color: #4CAF50; color: white; padding: 10px; text-align: center; border-radius: 8px 8px 0 0; } .content { padding: 20px; color: #333; } .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }</style></head><body><div class="container"><div class="header"><h2>Welcome to Backend Ledger!</h2></div><div class="content"><p>Hello <strong>${name}</strong>,</p><p>Thank you for registering at Backend Ledger. We are excited to have you on board!</p><p>If you have any questions, feel free to reply to this email.</p></div><div class="footer"><p>Best regards,<br>The Backend Ledger Team</p></div></div></body></html>`;

  await sendEmail(userEmail, subject, text, html);
}