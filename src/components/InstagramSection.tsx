'use client';

/**
 * Instagram Section Component
 * Displays Instagram photos in a beautiful gallery with link to profile
 */

import Image from 'next/image';
import Link from 'next/link';
import { StaggeredContainer } from './AnimatedElement';
import styles from './InstagramSection.module.css';

interface InstagramPhoto {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  featured?: boolean;
}

interface InstagramSectionProps {
  instagramHandle: string;
  photos: InstagramPhoto[];
  profileUrl?: string;
  featuredPhotos?: InstagramPhoto[];
}

export default function InstagramSection({ 
  instagramHandle, 
  photos, 
  profileUrl,
  featuredPhotos = []
}: InstagramSectionProps) {
  const handle = instagramHandle.startsWith('@') ? instagramHandle : `@${instagramHandle}`;
  const url = profileUrl || `https://www.instagram.com/${instagramHandle}/`;

  // Separate featured photos from regular photos
  const displayPhotos = featuredPhotos.length > 0 ? featuredPhotos : photos.slice(0, 6);

  return (
    <section className={styles.instagramSection}>
      <div className="container">
        <div className={styles.instagramHeader}>
          <h2 className={styles.sectionTitle}>Follow Hannah's Artistry</h2>
          <p className={styles.sectionSubtitle}>
            See Hannah's latest nail art creations and behind-the-scenes moments on Instagram
          </p>
        </div>
        
        {/* Featured Layout for Featured Photos */}
        {featuredPhotos.length > 0 ? (
          <StaggeredContainer 
            className={styles.instagramFeaturedGrid}
            staggerDelay={150}
            animationType="scaleIn"
          >
            <div className={styles.featuredMain}>
              <div className={styles.instagramItem}>
                <div className={styles.photoContainer}>
                  <Image
                    src={featuredPhotos[0]?.src || ''}
                    alt={featuredPhotos[0]?.alt || 'Featured nail art'}
                    width={600}
                    height={600}
                    className={styles.instagramPhoto}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
            <div className={styles.featuredSide}>
              {featuredPhotos.slice(1, 3).map((photo) => (
                <div key={photo.id} className={styles.instagramItem}>
                  <div className={styles.photoContainer}>
                    <Image
                      src={photo.src}
                      alt={photo.alt}
                      width={400}
                      height={400}
                      className={styles.instagramPhoto}
                      loading="lazy"
                    />
                  </div>
                </div>
              ))}
            </div>
          </StaggeredContainer>
        ) : (
          <StaggeredContainer 
            className={styles.instagramGrid}
            staggerDelay={100}
            animationType="fadeInUp"
          >
            {displayPhotos.map((photo) => (
              <div key={photo.id} className={styles.instagramItem}>
                <div className={styles.photoContainer}>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={300}
                    height={300}
                    className={styles.instagramPhoto}
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </StaggeredContainer>
        )}

        <div className={styles.instagramCTA}>
          <Link 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.instagramButton}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.instagramButtonIcon}
            >
              <path
                d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                fill="currentColor"
              />
            </svg>
            Follow {handle}
          </Link>
        </div>
      </div>
    </section>
  );
}
