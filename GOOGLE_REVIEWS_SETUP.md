# Google Reviews Setup Guide for Hannah's Nail Lounge

## ✅ What's Already Done

Your website now has a beautiful Google Reviews section with:
- ⭐ Star rating display
- 📝 Review cards with customer feedback
- 🔗 "View All Reviews" button linked to your Google Business Profile: https://maps.app.goo.gl/j2kmTynEMoHZZSni7

## 🎯 Two Ways to Add Your Real Reviews

### **Option 1: Manual (Easy & Quick)** ⚡

Just replace the placeholder reviews with your real ones!

**Step 1:** Go to your Google Business Profile on a computer
- Open: https://maps.app.goo.gl/j2kmTynEMoHZZSni7
- View all your reviews

**Step 2:** Copy your favorite reviews

**Step 3:** Open `index.html` and find the reviews section (around line 266)

**Step 4:** Replace the review cards with your real reviews. Here's the template:

```html
<article class="review-card">
    <div class="review-stars">
        <span class="star filled">★</span>
        <span class="star filled">★</span>
        <span class="star filled">★</span>
        <span class="star filled">★</span>
        <span class="star filled">★</span>
    </div>
    <div class="review-content">
        <p>Your customer's review text here</p>
    </div>
    <div class="review-author">
        <h4>Customer Name</h4>
        <span class="review-date">2 weeks ago</span>
    </div>
</article>
```

**For 4-star reviews:** Remove one `<span class="star filled">★</span>` and add `<span class="star">★</span>`

**Step 5:** Update your overall rating (line 251):
```html
<span class="rating-number">5.0</span>  <!-- Change to your actual rating -->
```

---

### **Option 2: Automatic with Google Places API** 🤖

This fetches reviews automatically from Google!

**Prerequisites:**
- Google Cloud account (free tier available)
- 15-20 minutes to set up

**Step 1: Get Google Places API Key**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Click "Enable APIs and Services"
4. Search for "Places API" and enable it
5. Go to "Credentials" → "Create Credentials" → "API Key"
6. Copy your API key

**Step 2: Find Your Place ID**

1. Go to [Place ID Finder](https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder)
2. Search for "Hannah's Nail Lounge"
3. Copy the Place ID (looks like: `ChIJN1t_tDeuEmsRUsoyG83frY4`)

**Step 3: Configure the Script**

Open `google-reviews.js` and update:

```javascript
const CONFIG = {
    apiKey: 'YOUR_API_KEY_HERE',  // Paste your API key
    placeId: 'YOUR_PLACE_ID_HERE',  // Paste your Place ID
    maxReviews: 6  // Number of reviews to show
};
```

**Step 4: Add Script to Your Website**

Open `index.html` and add this line before the closing `</body>` tag:

```html
<script src="google-reviews.js"></script>
```

**Step 5: Test**

Open your website - reviews should load automatically!

---

## 🎨 Customization Options

### Change Number of Reviews Displayed

In `index.html`, add or remove review cards in the `testimonials-grid` div.

### Change Star Color

In `styles.css`, find `.star.filled` (around line 1229) and change:

```css
.star.filled {
    color: #fbbc04;  /* Change this hex color */
}
```

### Adjust Review Card Layout

In `styles.css`, find `.testimonials-grid` and modify:

```css
.testimonials-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;  /* Space between cards */
}
```

---

## 📱 Where Reviews Appear

The reviews section appears on your homepage (`index.html`) between the "About" section and the footer.

To add reviews to other pages (Services, Portfolio):
1. Copy the entire `<!-- Google Reviews Section -->` from `index.html`
2. Paste it into the other HTML files where you want it
3. The styling is already in `styles.css` so it will work automatically

---

## 🔧 Troubleshooting

### Reviews not loading with API?
- Check browser console (F12) for errors
- Verify API key is correct
- Ensure Places API is enabled in Google Cloud Console
- Check if you've exceeded free tier limits (unlikely for small sites)

### Stars not showing?
- Make sure you haven't accidentally deleted the star span elements
- Check if CSS is loading properly

### Layout looks broken?
- Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
- Verify `styles.css` is linked in your HTML

---

## 💡 Tips

- **Best Practice:** Show your best 3-6 reviews on the homepage
- **Keep Fresh:** Update reviews monthly if using manual method
- **Respond to Reviews:** Always respond to Google reviews - it shows you care!
- **Be Authentic:** Don't edit or modify the review text

---

## 📞 Need Help?

If you have questions or need assistance:
1. Check the browser console for errors (F12 → Console tab)
2. Verify all file paths are correct
3. Make sure all quotes and brackets are properly closed in code

---

**Current Status:**
✅ Reviews section designed and styled
✅ Google Business Profile linked
⏳ Waiting for real reviews to be added (Option 1 or 2)

