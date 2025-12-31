import React from 'react';

export const CTA: React.FC = () => {
  return (
    <section className="cta">
      <div className="container">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Start Shopping?</h2>
          <p className="cta-subtitle">Join thousands of happy customers and discover amazing products today</p>
          <div className="cta-buttons">
            <button 
              className="btn-primary btn-large"
              onClick={() => {
                window.location.hash = '#/chat?message=I want to start shopping for fashion products';
              }}
            >
              Get Started
            </button>
            <button 
              className="btn-secondary btn-large"
              onClick={() => {
                window.location.hash = '#/chat?message=Show me fashion and retail products';
              }}
            >
              Browse Products
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};


