# Google Reviews Setup Guide

## Overview
Your website now includes a Google Reviews component that displays actual reviews from your Google Business Profile. This implementation fetches real reviews using the Google Places API.

## Required Environment Variables

Add these variables to your `.env.local` file:

```bash
# Google Places API Key
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here

# Google Place ID for your business
NEXT_PUBLIC_GOOGLE_PLACE_ID=your_google_place_id_here
```

## Setup Instructions

### Step 1: Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Places API"
   - Click "Enable"
4. Create an API key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

### Step 2: Find Your Place ID

1. Go to [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
2. Search for "Hannah's Nail Lounge" or your business name
3. Copy the Place ID (looks like: `ChIJN1t_tDeuEmsRUsoyG83frY4`)

### Step 3: Configure Environment Variables

Create a `.env.local` file in your project root and add:

```bash
GOOGLE_PLACES_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_GOOGLE_PLACE_ID=your_actual_place_id_here
```

### Step 4: Test the Implementation

1. Start your development server: `npm run dev`
2. Visit your homepage
3. The Google Reviews section should load automatically
4. Check the browser console for any errors

## Features

- **Real Reviews**: Displays actual reviews from your Google Business Profile
- **Responsive Design**: Works on all devices
- **Loading States**: Shows loading spinner while fetching reviews
- **Error Handling**: Graceful fallback if API fails
- **Star Ratings**: Visual star display for each review
- **Author Photos**: Shows reviewer profile pictures when available
- **Clickable Links**: Links to reviewer profiles and all reviews

## Customization

### Change Number of Reviews
Modify the `maxReviews` prop in the homepage:

```tsx
<GoogleReviews 
  placeId={process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID}
  maxReviews={8} // Change this number
  showAllReviewsLink={true}
  allReviewsUrl="https://share.google/48XHuiGNWbG9DBURg"
/>
```

### Customize Styling
Edit `src/components/GoogleReviews.module.css` to modify:
- Colors
- Spacing
- Card layouts
- Star colors
- Button styles

## Troubleshooting

### Reviews Not Loading
1. Check browser console for errors
2. Verify API key is correct
3. Ensure Places API is enabled
4. Check if Place ID is valid
5. Verify environment variables are loaded

### API Quota Exceeded
- Google Places API has usage limits
- Check your Google Cloud Console for quota usage
- Consider upgrading your API plan if needed

### CORS Issues
- The API route handles CORS automatically
- If you encounter issues, check the API route configuration

## Security Notes

- Never expose your API key in client-side code
- The API key is only used server-side in the API route
- Consider restricting your API key to specific domains/IPs in Google Cloud Console

## Cost Considerations

- Google Places API has pricing based on usage
- Review fetching is relatively low-cost
- Monitor your usage in Google Cloud Console
- Consider caching reviews to reduce API calls

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all environment variables are set correctly
3. Test the API key with a simple request
4. Check Google Cloud Console for API status and quotas
