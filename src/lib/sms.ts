/**
 * SMS Service - Twilio Integration
 * Handles SMS sending with dry-run mode, feature flags, and CASL compliance
 */

import twilio from 'twilio';

// Twilio configuration
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;
const SMS_ENABLED = process.env.FEATURE_SMS_ENABLED === 'true';

// Initialize Twilio client
let twilioClient: ReturnType<typeof twilio> | null = null;

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && SMS_ENABLED) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

interface SmsResult {
  success: boolean;
  dryRun: boolean;
  messageSid?: string;
  error?: string;
}

/**
 * Check if SMS service is configured and enabled
 */
export function isSmsEnabled(): boolean {
  return SMS_ENABLED && !!twilioClient && !!TWILIO_PHONE_NUMBER;
}

/**
 * Format phone number to E.164 format (+1XXXXXXXXXX)
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add +1 if not present (assuming North American numbers)
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  return phone; // Return as-is if format unclear
}

/**
 * Add CASL-compliant opt-out message
 */
function addOptOutMessage(message: string): string {
  return `${message}\n\nReply STOP to unsubscribe.`;
}

/**
 * Send SMS via Twilio or dry-run mode
 */
export async function sendSms(
  to: string,
  message: string,
  includeOptOut: boolean = true
): Promise<SmsResult> {
  const formattedTo = formatPhoneNumber(to);
  const finalMessage = includeOptOut ? addOptOutMessage(message) : message;

  // Dry-run mode if feature disabled or no credentials
  if (!isSmsEnabled()) {
    console.log('📱 [DRY-RUN] SMS would be sent:', {
      to: formattedTo,
      message: finalMessage,
      length: finalMessage.length,
    });
    
    return {
      success: true,
      dryRun: true,
    };
  }

  try {
    const result = await twilioClient!.messages.create({
      body: finalMessage,
      from: TWILIO_PHONE_NUMBER,
      to: formattedTo,
    });

    console.log('✅ SMS sent successfully:', result.sid);
    
    return {
      success: true,
      dryRun: false,
      messageSid: result.sid,
    };
  } catch (error: any) {
    console.error('❌ SMS send error:', error);
    
    return {
      success: false,
      dryRun: false,
      error: error.message,
    };
  }
}

/**
 * Send appointment confirmation SMS
 */
export async function sendAppointmentConfirmationSms(
  phoneNumber: string,
  clientName: string,
  service: string,
  startTime: Date
): Promise<SmsResult> {
  const formattedDate = startTime.toLocaleDateString('en-CA', {
    month: 'short',
    day: 'numeric',
  });
  
  const formattedTime = startTime.toLocaleTimeString('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const message = `Hi ${clientName}! Your ${service} appointment is confirmed for ${formattedDate} at ${formattedTime}. See you at Lacque & Latte! 💅`;

  return sendSms(phoneNumber, message, true);
}

/**
 * Send appointment reminder SMS (24 hours before)
 */
export async function sendAppointmentReminderSms(
  phoneNumber: string,
  clientName: string,
  service: string,
  startTime: Date
): Promise<SmsResult> {
  const formattedTime = startTime.toLocaleTimeString('en-CA', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const message = `Reminder: Hi ${clientName}, your ${service} appointment is tomorrow at ${formattedTime}. We look forward to seeing you at Lacque & Latte! 💅`;

  return sendSms(phoneNumber, message, true);
}

/**
 * Send general notification SMS
 */
export async function sendNotificationSms(
  phoneNumber: string,
  message: string
): Promise<SmsResult> {
  return sendSms(phoneNumber, message, true);
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  // North American numbers: 10 or 11 digits
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

