/**
 * Email Service - SendGrid Integration
 * Handles email sending with dry-run mode and feature flags
 */

import sgMail from '@sendgrid/mail';
import { EmailData } from './validators';

// Configure SendGrid
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM || 'noreply@lacqueandlatte.ca';
const SENDGRID_TO = process.env.SENDGRID_TO || 'info@lacqueandlatte.ca';
const EMAIL_ENABLED = process.env.FEATURE_EMAIL_ENABLED === 'true';

if (SENDGRID_API_KEY && EMAIL_ENABLED) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

interface EmailResult {
  success: boolean;
  dryRun: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Check if email service is configured and enabled
 */
export function isEmailEnabled(): boolean {
  return EMAIL_ENABLED && !!SENDGRID_API_KEY;
}

/**
 * Send email via SendGrid or dry-run mode
 */
export async function sendEmail(data: EmailData): Promise<EmailResult> {
  // Dry-run mode if feature disabled or no API key
  if (!isEmailEnabled()) {
    console.log('📧 [DRY-RUN] Email would be sent:', {
      to: data.to,
      subject: data.subject,
      preview: data.text.substring(0, 100) + '...',
    });
    
    return {
      success: true,
      dryRun: true,
    };
  }

  try {
    const msg = {
      to: data.to,
      from: SENDGRID_FROM,
      subject: data.subject,
      text: data.text,
      html: data.html || data.text,
    };

    const [response] = await sgMail.send(msg);
    
    console.log('✅ Email sent successfully:', data.to);
    
    return {
      success: true,
      dryRun: false,
      messageId: response.headers['x-message-id'] as string,
    };
  } catch (error: any) {
    console.error('❌ Email send error:', error);
    
    return {
      success: false,
      dryRun: false,
      error: error.message,
    };
  }
}

/**
 * Send contact form email
 */
export async function sendContactFormEmail(
  name: string,
  email: string,
  phone: string | undefined,
  message: string
): Promise<EmailResult> {
  const subject = `New Contact Form Submission from ${name}`;
  
  const text = `
New contact form submission:

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}

Message:
${message}

---
This email was sent from the Lacque & Latte contact form.
  `.trim();

  const html = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
    <h3>Message:</h3>
    <p>${message.replace(/\n/g, '<br>')}</p>
    <hr>
    <p style="color: #666; font-size: 12px;">This email was sent from the Lacque & Latte contact form.</p>
  `;

  return sendEmail({
    to: SENDGRID_TO,
    subject,
    text,
    html,
  });
}

/**
 * Send appointment confirmation email
 */
export async function sendAppointmentConfirmation(
  clientEmail: string,
  clientName: string,
  service: string,
  startTime: Date,
  stylist?: string
): Promise<EmailResult> {
  const formattedDate = startTime.toLocaleDateString('en-CA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = startTime.toLocaleTimeString('en-CA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `Appointment Confirmed - ${service}`;
  
  const text = `
Hi ${clientName},

Your appointment has been confirmed!

Service: ${service}
Date: ${formattedDate}
Time: ${formattedTime}
${stylist ? `Stylist: ${stylist}` : ''}

We look forward to seeing you at Lacque & Latte Nail Studio!

If you need to reschedule or cancel, please contact us as soon as possible.

Best regards,
Lacque & Latte Team
  `.trim();

  const html = `
    <h2>Appointment Confirmed! 💅</h2>
    <p>Hi ${clientName},</p>
    <p>Your appointment has been confirmed:</p>
    <ul>
      <li><strong>Service:</strong> ${service}</li>
      <li><strong>Date:</strong> ${formattedDate}</li>
      <li><strong>Time:</strong> ${formattedTime}</li>
      ${stylist ? `<li><strong>Stylist:</strong> ${stylist}</li>` : ''}
    </ul>
    <p>We look forward to seeing you at Lacque & Latte Nail Studio!</p>
    <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
    <p>Best regards,<br>Lacque & Latte Team</p>
  `;

  return sendEmail({
    to: clientEmail,
    subject,
    text,
    html,
  });
}

/**
 * Send appointment reminder email
 */
export async function sendAppointmentReminder(
  clientEmail: string,
  clientName: string,
  service: string,
  startTime: Date
): Promise<EmailResult> {
  const formattedDate = startTime.toLocaleDateString('en-CA', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  
  const formattedTime = startTime.toLocaleTimeString('en-CA', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const subject = `Reminder: Your ${service} appointment tomorrow`;
  
  const text = `
Hi ${clientName},

This is a friendly reminder about your upcoming appointment:

Service: ${service}
Date: ${formattedDate}
Time: ${formattedTime}

We look forward to seeing you soon!

Best regards,
Lacque & Latte Team
  `.trim();

  const html = `
    <h2>Appointment Reminder 📅</h2>
    <p>Hi ${clientName},</p>
    <p>This is a friendly reminder about your upcoming appointment:</p>
    <ul>
      <li><strong>Service:</strong> ${service}</li>
      <li><strong>Date:</strong> ${formattedDate}</li>
      <li><strong>Time:</strong> ${formattedTime}</li>
    </ul>
    <p>We look forward to seeing you soon!</p>
    <p>Best regards,<br>Lacque & Latte Team</p>
  `;

  return sendEmail({
    to: clientEmail,
    subject,
    text,
    html,
  });
}

