/**
 * Appointments API Route
 * Handles CRUD operations for appointments
 */

import { NextRequest, NextResponse } from 'next/server';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/auth/config';
import { getDatabase } from '@/lib/db';
import { bookingFormSchema } from '@/lib/validators';
import { sendAppointmentConfirmation } from '@/lib/email';
import { ZodError } from 'zod';
import { ObjectId } from 'mongodb';
// Note: sendAppointmentConfirmationSms is imported dynamically in POST handler

/**
 * GET - Retrieve appointments
 * Query params: ?date=YYYY-MM-DD, ?status=pending, ?stylist=name
 */
export async function GET(req: NextRequest) {
  try {
    // Try to connect to database, but fallback gracefully if it fails
    let appointments: any[] = [];
    
    try {
      const { searchParams } = new URL(req.url);
      const date = searchParams.get('date');
      const status = searchParams.get('status');
      const stylist = searchParams.get('stylist');

      // Build query filter
      const filter: any = {};
      
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        filter.startTime = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }
      
      if (status) {
        filter.status = status;
      }
      
      if (stylist) {
        filter.stylist = stylist;
      }

      // Fetch appointments from database
      const db = await getDatabase();
      appointments = await db
        .collection('appointments')
        .find(filter)
        .sort({ startTime: 1 })
        .toArray();
    } catch (dbError) {
      console.error('Database connection error (returning empty array):', dbError);
      // Return empty array instead of error
      appointments = [];
    }

    return NextResponse.json({
      success: true,
      appointments,
      count: appointments.length,
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    // Return empty array on any error
    return NextResponse.json({
      success: true,
      appointments: [],
      count: 0,
    });
  }
}

/**
 * POST - Create new appointment
 */
export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validated = bookingFormSchema.parse(body);

    // Check consent requirement
    if (!validated.consentAccepted) {
      return NextResponse.json(
        { error: 'Consent is required to book an appointment' },
        { status: 400 }
      );
    }

    // Create appointment document
    const db = await getDatabase();
    const appointmentsCollection = db.collection('appointments');
    
    const appointmentDoc = {
      clientName: validated.clientName,
      clientEmail: validated.clientEmail,
      clientPhone: validated.clientPhone || null,
      service: validated.service,
      stylist: validated.stylist || null,
      startTime: new Date(validated.startTime),
      endTime: new Date(validated.endTime),
      status: 'pending',
      notes: validated.notes || null,
      consentAccepted: validated.consentAccepted,
      consentDate: new Date(),
      reminderSent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await appointmentsCollection.insertOne(appointmentDoc);
    console.log('✅ Appointment created:', result.insertedId);

    // Send confirmation email
    const emailResult = await sendAppointmentConfirmation(
      validated.clientEmail,
      validated.clientName,
      validated.service,
      new Date(validated.startTime),
      validated.stylist
    );

    // Send confirmation SMS if phone provided
    let smsResult = null;
    if (validated.clientPhone) {
      const { sendAppointmentConfirmationSms } = await import('@/lib/sms');
      smsResult = await sendAppointmentConfirmationSms(
        validated.clientPhone,
        validated.clientName,
        validated.service,
        new Date(validated.startTime)
      );
    }

    return NextResponse.json({
      success: true,
      appointmentId: result.insertedId.toString(),
      emailSent: emailResult.success,
      smsSent: smsResult?.success || false,
      dryRun: emailResult.dryRun || smsResult?.dryRun,
    }, { status: 201 });

  } catch (error) {
    console.error('Create appointment error:', error);

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
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Update appointment
 */
export async function PATCH(req: NextRequest) {
  try {
    // TODO: Re-enable authentication later
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Update appointment (simplified validation for now)
    const db = await getDatabase();
    const result = await db.collection('appointments').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: {
          ...updates,
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      modified: result.modifiedCount > 0,
    });

  } catch (error) {
    console.error('Update appointment error:', error);

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
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Cancel appointment
 */
export async function DELETE(req: NextRequest) {
  try {
    // TODO: Re-enable authentication later
    // const session = await getServerSession(authOptions);
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Authentication required' },
    //     { status: 401 }
    //   );
    // }

    const { searchParams } = new URL(req.url);
    const appointmentId = searchParams.get('id');

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    // Soft delete - update status to cancelled
    const db = await getDatabase();
    const result = await db.collection('appointments').updateOne(
      { _id: new ObjectId(appointmentId) },
      { 
        $set: {
          status: 'cancelled',
          updatedAt: new Date(),
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment cancelled successfully',
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel appointment' },
      { status: 500 }
    );
  }
}

