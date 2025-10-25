/**
 * Contact Form API Route
 * Handles contact form submissions with PIPEDA compliance
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { contactFormSchema } from '@/lib/validators';
import { sendContactFormEmail } from '@/lib/email';
import { ZodError } from 'zod';

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validated = contactFormSchema.parse(body);

    // Check consent requirement
    const consentRequired = process.env.FEATURE_CONSENT_REQUIRED === 'true';
    if (consentRequired && !validated.consentAccepted) {
      return NextResponse.json(
        { 
          error: 'Consent is required to submit this form',
          field: 'consentAccepted' 
        },
        { status: 400 }
      );
    }

    // Save message to database
    const db = await getDatabase();
    const messagesCollection = db.collection('messages');
    
    const messageDoc = {
      name: validated.name,
      email: validated.email,
      phone: validated.phone || null,
      message: validated.message,
      consentAccepted: validated.consentAccepted,
      consentDate: new Date(),
      status: 'new',
      responded: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await messagesCollection.insertOne(messageDoc);
    console.log('✅ Contact form message saved:', result.insertedId);

    // Send email notification
    const emailResult = await sendContactFormEmail(
      validated.name,
      validated.email,
      validated.phone,
      validated.message
    );

    // Return success response
    return NextResponse.json({
      success: true,
      messageId: result.insertedId.toString(),
      emailSent: emailResult.success,
      dryRun: emailResult.dryRun,
    }, { status: 200 });

  } catch (error) {
    console.error('Contact form error:', error);

    // Handle validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
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

