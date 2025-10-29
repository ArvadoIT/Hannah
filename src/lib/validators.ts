/**
 * Input Validation Schemas
 * Using Zod for runtime validation
 */

import { z } from 'zod';

/**
 * Contact form validation
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens and apostrophes'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  phone: z.string()
    .regex(/^[\d\s\-\(\)\+]+$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  
  message: z.string()
    .min(10, 'Message must be at least 10 characters')
    .max(1000, 'Message must be less than 1000 characters'),
  
  consentAccepted: z.boolean()
    .refine((val) => val === true, {
      message: 'You must accept the privacy policy to continue'
    }),
});

/**
 * Booking form validation
 */
export const bookingFormSchema = z.object({
  clientName: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  clientEmail: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  clientPhone: z.string()
    .regex(/^[\d\s\-\(\)\+]+$/, 'Please enter a valid phone number')
    .min(10, 'Phone number must be at least 10 digits')
    .optional()
    .or(z.literal('')),
  
  service: z.string()
    .min(1, 'Please select a service'),
  
  stylist: z.string().optional(),
  
  startTime: z.string()
    .datetime('Invalid date/time format'),
  
  endTime: z.string()
    .datetime('Invalid date/time format'),
  
  notes: z.string()
    .max(500, 'Notes must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  
  consentAccepted: z.boolean()
    .refine((val) => val === true, {
      message: 'You must accept the privacy policy to book'
    }),
});

/**
 * Login credentials validation
 */
export const loginSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase(),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters'),
});

/**
 * SMS reminder validation
 */
export const smsReminderSchema = z.object({
  appointmentId: z.string()
    .regex(/^[a-f\d]{24}$/i, 'Invalid appointment ID'),
  
  phoneNumber: z.string()
    .regex(/^\+?1?\d{10,15}$/, 'Invalid phone number format'),
  
  message: z.string()
    .min(1)
    .max(160, 'SMS message must be 160 characters or less'),
});

/**
 * Email validation
 */
export const emailSchema = z.object({
  to: z.string().email('Invalid recipient email'),
  subject: z.string().min(1).max(200),
  text: z.string().min(1),
  html: z.string().optional(),
});

/**
 * Appointment update validation
 */
export const appointmentUpdateSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  notes: z.string().max(500).optional(),
  reminderSent: z.boolean().optional(),
});

/**
 * Type exports for TypeScript
 */
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type BookingFormData = z.infer<typeof bookingFormSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type SmsReminderData = z.infer<typeof smsReminderSchema>;
export type EmailData = z.infer<typeof emailSchema>;
export type AppointmentUpdateData = z.infer<typeof appointmentUpdateSchema>;

