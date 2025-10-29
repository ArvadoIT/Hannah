'use client';

/**
 * Google Reviews Component
 * Displays actual Google reviews fetched from Google Places API
 */

import { useState, useEffect } from 'react';
import { AnimatedElement } from './AnimatedElement';
import styles from './GoogleReviews.module.css';

interface GoogleReview {
  author_name: string;
  author_url?: string;
  profile_photo_url?: string;
  rating: number;
  relative_time_description: string;
  text: string;
  time: number;
}

interface GoogleReviewsData {
  rating: number;
  user_ratings_total: number;
  reviews: GoogleReview[];
}

interface GoogleReviewsProps {
  placeId?: string;
  maxReviews?: number;
  showAllReviewsLink?: boolean;
  allReviewsUrl?: string;
}

export default function GoogleReviews({
  placeId = process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || '',
  maxReviews = 6,
  showAllReviewsLink = true,
  allReviewsUrl = 'https://share.google/48XHuiGNWbG9DBURg'
}: GoogleReviewsProps) {
  const [reviewsData, setReviewsData] = useState<GoogleReviewsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (placeId) {
      fetchGoogleReviews();
    } else {
      setError('Google Place ID not configured');
      setLoading(false);
    }
  }, [placeId]);

  const fetchGoogleReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/google-reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ placeId, maxReviews }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setReviewsData(data);
    } catch (err) {
      console.error('Error fetching Google reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${styles.star} ${index < rating ? styles.filled : ''}`}
      >
        ★
      </span>
    ));
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <section className={styles.reviewsSection}>
        <div className="container">
          <div className={styles.reviewsHeader}>
            <h2 className={styles.sectionTitle}>What Our Clients Say</h2>
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <p>Loading reviews...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.reviewsSection}>
        <div className="container">
          <div className={styles.reviewsHeader}>
            <h2 className={styles.sectionTitle}>What Our Clients Say</h2>
            <div className={styles.errorState}>
              <p>Unable to load reviews at this time.</p>
              <a 
                href={allReviewsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.reviewsButton}
              >
                ⭐ Read Our Google Reviews
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!reviewsData || !reviewsData.reviews || reviewsData.reviews.length === 0) {
    return (
      <section className={styles.reviewsSection}>
        <div className="container">
          <div className={styles.reviewsHeader}>
            <h2 className={styles.sectionTitle}>What Our Clients Say</h2>
            <div className={styles.noReviews}>
              <p>No reviews available at this time.</p>
              <a 
                href={allReviewsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.reviewsButton}
              >
                ⭐ Read Our Google Reviews
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.reviewsSection}>
      <div className="container">
        <AnimatedElement animationType="fadeInUp" delay={100}>
          <div className={styles.reviewsHeader}>
            <h2 className={styles.sectionTitle}>What Our Clients Say</h2>
            <div className={styles.overallRating}>
              <div className={styles.ratingStars}>
                {renderStars(Math.round(reviewsData.rating))}
              </div>
              <div className={styles.ratingInfo}>
                <span className={styles.ratingNumber}>{reviewsData.rating.toFixed(1)}</span>
                <span className={styles.ratingCount}>
                  ({reviewsData.user_ratings_total} reviews)
                </span>
              </div>
            </div>
          </div>
        </AnimatedElement>

        <div className={styles.reviewsGrid}>
          {reviewsData.reviews.map((review, index) => (
            <AnimatedElement 
              key={review.time} 
              animationType="fadeInUp" 
              delay={200 + (index * 100)}
            >
              <article className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.authorInfo}>
                    {review.profile_photo_url && (
                      <img 
                        src={review.profile_photo_url} 
                        alt={`${review.author_name}'s profile`}
                        className={styles.authorPhoto}
                      />
                    )}
                    <div className={styles.authorDetails}>
                      <h4 className={styles.authorName}>
                        {review.author_url ? (
                          <a 
                            href={review.author_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={styles.authorLink}
                          >
                            {review.author_name}
                          </a>
                        ) : (
                          review.author_name
                        )}
                      </h4>
                      <span className={styles.reviewDate}>
                        {formatDate(review.time)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.reviewRating}>
                    {renderStars(review.rating)}
                  </div>
                </div>
                
                {review.text && (
                  <div className={styles.reviewContent}>
                    <p>{review.text}</p>
                  </div>
                )}
              </article>
            </AnimatedElement>
          ))}
        </div>

        {showAllReviewsLink && (
          <AnimatedElement animationType="fadeInUp" delay={800}>
            <div className={styles.reviewsFooter}>
              <a 
                href={allReviewsUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.reviewsButton}
              >
                ⭐ Read All Google Reviews
              </a>
            </div>
          </AnimatedElement>
        )}
      </div>
    </section>
  );
}
