import nodemailer from 'nodemailer';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import type { SendEmailParams } from '../../types/email';
import fs from 'fs';
import path from 'path';

/**
 * Send an email using configured email service
 * This service will try multiple methods in order of preference:
 * 1. Resend.com API (if configured)
 * 2. SendGrid (if configured)
 * 3. Mailgun (if configured)
 * 4. SMTP (fallback)
 * 5. Debug mode (saves emails to disk)
 */
export async function sendEmail({ to, subject, html, text, from }: SendEmailParams): Promise<any> {
  const defaultSender = process.env.DEFAULT_EMAIL_SENDER || 'briefing@news-briefing-app.com';
  const senderEmail = from || defaultSender;

  // Check for Resend API Key
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendWithResend({ to, subject, html, text, from: senderEmail });
    } catch (error) {
      console.error('Failed to send with Resend, falling back:', error);
    }
  }

  // Check for SendGrid API Key
  if (process.env.SENDGRID_API_KEY) {
    try {
      return await sendWithSendGrid({ to, subject, html, text, from: senderEmail });
    } catch (error) {
      console.error('Failed to send with SendGrid, falling back:', error);
    }
  }

  // Check for Mailgun credentials
  if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
    try {
      return await sendWithMailgun({ to, subject, html, text, from: senderEmail });
    } catch (error) {
      console.error('Failed to send with Mailgun, falling back:', error);
    }
  }

  // Check for SMTP configuration
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    try {
      return await sendWithSMTP({ to, subject, html, text, from: senderEmail });
    } catch (error) {
      console.error('Failed to send with SMTP, falling back to debug mode:', error);
    }
  }

  // Fallback to debug mode (save email to file)
  return saveEmailToFile({ to, subject, html, text, from: senderEmail });
}

// Send using Resend.com API
async function sendWithResend({ to, subject, html, text, from }: SendEmailParams): Promise<any> {
  // This is a simple implementation - for production, use the Resend SDK
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html: html || undefined,
      text: text || undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Resend API error: ${errorData.message || response.statusText}`);
  }

  return response.json();
}

// Send using SendGrid
async function sendWithSendGrid({ to, subject, html, text, from }: SendEmailParams): Promise<any> {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  
  return await sgMail.send({
    to,
    from,
    subject,
    text: text || '',
    html: html || '',
  });
}

// Send using Mailgun
async function sendWithMailgun({ to, subject, html, text, from }: SendEmailParams): Promise<any> {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({ username: 'api', key: process.env.MAILGUN_API_KEY || '' });

  return await mg.messages.create(process.env.MAILGUN_DOMAIN || '', {
    from,
    to,
    subject,
    text: text || '',
    html: html || '',
  });
}

// Send using SMTP
async function sendWithSMTP({ to, subject, html, text, from }: SendEmailParams): Promise<any> {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  return await transporter.sendMail({
    from,
    to,
    subject,
    text: text || '',
    html: html || '',
  });
}

// Save email to file for debugging
async function saveEmailToFile({ to, subject, html, text, from }: SendEmailParams): Promise<any> {
  // Create debug-emails directory if it doesn't exist
  const debugDir = path.join(process.cwd(), 'debug-emails');
  if (!fs.existsSync(debugDir)) {
    fs.mkdirSync(debugDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${timestamp}-${subject.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}.html`;
  const filePath = path.join(debugDir, filename);

  // Create email content with metadata and body
  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${subject}</title>
        <style>
          .metadata { background: #f0f0f0; padding: 20px; margin-bottom: 20px; }
          .body { padding: 20px; }
        </style>
      </head>
      <body>
        <div class="metadata">
          <p><strong>To:</strong> ${to}</p>
          <p><strong>From:</strong> ${from}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div class="body">
          ${html || `<pre>${text || ''}</pre>`}
        </div>
      </body>
    </html>
  `;

  await fs.promises.writeFile(filePath, content);
  console.log(`Debug email saved to: ${filePath}`);

  return {
    messageId: `debug-${timestamp}`,
    filePath,
    timestamp,
  };
}
