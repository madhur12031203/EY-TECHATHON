import React from 'react';

type Feature = { icon: string; title: string; description: string };

const features: Feature[] = [
  { icon: '🚀', title: 'Fast Delivery', description: 'Get your orders delivered at lightning speed with our efficient logistics network.' },
  { icon: '💰', title: 'Best Prices', description: "Competitive pricing guaranteed. We match or beat any competitor's price." },
  { icon: '🔒', title: 'Secure Shopping', description: 'Your data and payments are protected with bank-level encryption.' },
  { icon: '✨', title: 'Quality Assured', description: 'All products go through rigorous quality checks before reaching you.' },
  { icon: '🔄', title: 'Easy Returns', description: 'Not satisfied? Return within 30 days with our hassle-free policy.' },
  { icon: '💬', title: '24/7 Support', description: 'Our customer service team is always ready to help you anytime.' },
];

export const Features: React.FC = () => {
  return (
    <section className="features" id="features">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Why Choose Buyoh?</h2>
          <p className="section-subtitle">Experience the best in retail shopping</p>
        </div>
        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


