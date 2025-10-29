/**
 * Google Reviews API Route
 * Fetches reviews from Google Places API
 */

import { NextRequest, NextResponse } from 'next/server';

interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface GooglePlacesResponse {
  result: {
    rating: number;
    user_ratings_total: number;
    reviews: GoogleReview[];
  };
  status: string;
  error_message?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { placeId, maxReviews = 6 } = await req.json();

    if (!placeId) {
      return NextResponse.json(
        { error: 'Place ID is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Places API key not configured' },
        { status: 500 }
      );
    }

    // Google Places API endpoint
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews&key=${apiKey}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`);
    }

    const data: GooglePlacesResponse = await response.json();

    if (data.status !== 'OK') {
      throw new Error(data.error_message || `Google Places API error: ${data.status}`);
    }

    if (!data.result) {
      throw new Error('No place data found');
    }

    // Limit the number of reviews
    const limitedReviews = data.result.reviews?.slice(0, maxReviews) || [];

    // Return the reviews data
    return NextResponse.json({
      rating: data.result.rating || 0,
      user_ratings_total: data.result.user_ratings_total || 0,
      reviews: limitedReviews,
    });

  } catch (error) {
    console.error('Google Reviews API Error:', error);
    
    // Return a more user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reviews';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
