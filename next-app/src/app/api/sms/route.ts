/**
 * SMS API Route
 * Handles SMS sending with CASL compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth/config';
import { sendSms, isValidPhoneNumber } from '@/lib/sms';
import { smsReminderSchema } from '@/lib/validators';
import { getDatabase } from '@/lib/db';
import { ObjectId } from 'mongodb';
import { ZodError } from 'zod';

/**
 * POST - Send SMS reminder
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Require authentication (admin/stylist only)
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'stylist')) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validated = smsReminderSchema.parse(body);

    // Validate phone number
    if (!isValidPhoneNumber(validated.phoneNumber)) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Verify appointment exists
    const db = await getDatabase();
    const appointment = await db.collection('appointments').findOne({
      _id: new ObjectId(validated.appointmentId),
    });

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // Send SMS
    const result = await sendSms(
      validated.phoneNumber,
      validated.message,
      true // Include CASL opt-out message
    );

    // Update appointment if SMS sent successfully
    if (result.success && !result.dryRun) {
      await db.collection('appointments').updateOne(
        { _id: new ObjectId(validated.appointmentId) },
        { 
          $set: {
            reminderSent: true,
            updatedAt: new Date(),
          }
        }
      );
    }

    return NextResponse.json({
      success: result.success,
      dryRun: result.dryRun,
      messageSid: result.messageSid,
    }, { status: 200 });

  } catch (error) {
    console.error('SMS send error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send SMS' },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

