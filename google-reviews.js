// Google Reviews Integration for Hannah's Nail Lounge
// This file fetches real Google reviews using the Google Places API

// Configuration
const CONFIG = {
    // Replace with your Google Places API key
    apiKey: 'YOUR_GOOGLE_PLACES_API_KEY_HERE',
    // Hannah's Nail Lounge Place ID (will be extracted from the Google Maps link)
    placeId: 'YOUR_PLACE_ID_HERE',
    // Number of reviews to display
    maxReviews: 6
};

// Function to fetch Google reviews
async function fetchGoogleReviews() {
    try {
        const proxyUrl = `https://cors-anywhere.herokuapp.com/https://maps.googleapis.com/maps/api/place/details/json?place_id=${CONFIG.placeId}&fields=name,rating,reviews,user_ratings_total&key=${CONFIG.apiKey}`;
        
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        if (data.status === 'OK' && data.result) {
            displayReviews(data.result);
        } else {
            console.error('Error fetching reviews:', data.status);
        }
    } catch (error) {
        console.error('Error fetching Google reviews:', error);
    }
}

// Function to display reviews on the page
function displayReviews(placeData) {
    const { rating, reviews, user_ratings_total } = placeData;
    
    // Update overall rating
    updateOverallRating(rating, user_ratings_total);
    
    // Update review cards
    if (reviews && reviews.length > 0) {
        updateReviewCards(reviews.slice(0, CONFIG.maxReviews));
    }
}

// Function to update the overall rating display
function updateOverallRating(rating, totalReviews) {
    const ratingNumberEl = document.querySelector('.rating-number');
    if (ratingNumberEl) {
        ratingNumberEl.textContent = rating.toFixed(1);
    }
    
    // Update stars
    updateStars(document.querySelector('.rating-stars'), rating);
}

// Function to update star display
function updateStars(container, rating) {
    if (!container) return;
    
    const stars = container.querySelectorAll('.star');
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    stars.forEach((star, index) => {
        if (index < fullStars) {
            star.classList.add('filled');
        } else if (index === fullStars && hasHalfStar) {
            star.classList.add('half-filled');
        } else {
            star.classList.remove('filled', 'half-filled');
        }
    });
}

// Function to update review cards
function updateReviewCards(reviews) {
    const grid = document.querySelector('.testimonials-grid');
    if (!grid) return;
    
    // Clear existing reviews
    grid.innerHTML = '';
    
    // Add new reviews
    reviews.forEach(review => {
        const card = createReviewCard(review);
        grid.appendChild(card);
    });
}

// Function to create a review card element
function createReviewCard(review) {
    const article = document.createElement('article');
    article.className = 'review-card';
    
    const stars = createStarsHTML(review.rating);
    const reviewText = review.text.length > 200 
        ? review.text.substring(0, 200) + '...' 
        : review.text;
    
    const timeAgo = getTimeAgo(review.time);
    
    article.innerHTML = `
        <div class="review-stars">
            ${stars}
        </div>
        <div class="review-content">
            <p>${reviewText}</p>
        </div>
        <div class="review-author">
            <h4>${review.author_name}</h4>
            <span class="review-date">${timeAgo}</span>
        </div>
    `;
    
    return article;
}

// Function to create stars HTML
function createStarsHTML(rating) {
    let starsHTML = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHTML += '<span class="star filled">★</span>';
        } else {
            starsHTML += '<span class="star">★</span>';
        }
    }
    return starsHTML;
}

// Function to convert timestamp to relative time
function getTimeAgo(timestamp) {
    const now = Date.now();
    const reviewTime = timestamp * 1000;
    const diff = now - reviewTime;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);
    
    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

// Initialize reviews when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Only fetch if API key is configured
    if (CONFIG.apiKey !== 'YOUR_GOOGLE_PLACES_API_KEY_HERE' && 
        CONFIG.placeId !== 'YOUR_PLACE_ID_HERE') {
        fetchGoogleReviews();
    }
});

// Export for manual use
window.GoogleReviews = {
    fetch: fetchGoogleReviews,
    updateConfig: function(key, placeId) {
        CONFIG.apiKey = key;
        CONFIG.placeId = placeId;
    }
};

