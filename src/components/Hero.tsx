import React, { useState, useEffect } from 'react';

// Banner slide data with placeholder image URLs
// TODO: Replace these placeholder URLs with actual fashion banner images
const bannerSlides = [
  {
    id: 1,
    category: 'Wedding',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1920&h=1080&fit=crop',
    headline: 'AI-Powered Personal Styling for Every Occasion',
    subheading: 'Discover curated fashion, personalized by AI & human experts',
    alt: 'Wedding wear collection - Elegant traditional and contemporary designs'
  },
  {
    id: 2,
    category: 'Casual',
    imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop',
    headline: 'Elevate Your Everyday Style',
    subheading: 'Premium casual wear that blends comfort with sophistication',
    alt: 'Casual fashion collection - Modern, comfortable, and stylish'
  },
  {
    id: 3,
    category: 'Workwear',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&h=1080&fit=crop',
    headline: 'Professional Elegance, Defined',
    subheading: 'Corporate fashion that makes a statement in the boardroom',
    alt: 'Workwear collection - Professional and polished business attire'
  }
];

export const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-slide carousel: changes slide every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Pause auto-play on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 8 seconds
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const currentBanner = bannerSlides[currentSlide];

  return (
    <section 
      className="hero-banner" 
      id="home"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Banner Image Background */}
      <div className="hero-banner-background">
        {bannerSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-banner-slide ${index === currentSlide ? 'active' : ''}`}
            style={{
              backgroundImage: `url(${slide.imageUrl})`,
            }}
            aria-hidden={index !== currentSlide}
          >
            {/* Dark overlay for text readability */}
            <div className="hero-banner-overlay"></div>
          </div>
        ))}
      </div>

      {/* Content Overlay */}
      <div className="hero-banner-content">
        <div className="container">
          <div className="hero-banner-text">
            {/* Category Badge */}
            <div className="hero-category-badge">
              {currentBanner.category} Collection
            </div>

            {/* Main Headline */}
            <h1 className="hero-banner-title">
              {currentBanner.headline}
            </h1>

            {/* Subheading */}
            <p className="hero-banner-subtitle">
              {currentBanner.subheading}
            </p>

            {/* CTA Buttons */}
            <div className="hero-banner-buttons">
              <button 
                className="btn-hero-primary"
                onClick={() => {
                  window.location.hash = '#/chat?message=Show me fashion collections';
                }}
              >
                Explore Collections
              </button>
              <button 
                className="btn-hero-secondary"
                onClick={() => {
                  window.location.hash = '#/chat?message=I need styling help for fashion';
                }}
              >
                Get Styling Help
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Indicators */}
      <div className="hero-banner-indicators">
        {bannerSlides.map((slide, index) => (
          <button
            key={slide.id}
            className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to ${slide.category} slide`}
            aria-current={index === currentSlide}
          >
            <span className="indicator-dot"></span>
            <span className="indicator-label">{slide.category}</span>
          </button>
        ))}
      </div>

      {/* Slide Navigation Arrows (optional, for manual control) */}
      <button
        className="hero-nav-arrow hero-nav-prev"
        onClick={() => goToSlide((currentSlide - 1 + bannerSlides.length) % bannerSlides.length)}
        aria-label="Previous slide"
      >
        ‹
      </button>
      <button
        className="hero-nav-arrow hero-nav-next"
        onClick={() => goToSlide((currentSlide + 1) % bannerSlides.length)}
        aria-label="Next slide"
      >
        ›
      </button>
    </section>
  );
};


