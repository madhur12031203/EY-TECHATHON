import React from 'react';

type Category = {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
};

const categories: Category[] = [
  { id: 1, name: 'Fashion', description: 'Trendy clothing, accessories, and style essentials for every occasion', icon: '👗', color: '#EC4899' },
];

export const ProductShowcase: React.FC = () => {
  return (
    <section className="product-showcase" id="products">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Browse through our extensive collection of products</p>
        </div>
        <div className="product-grid">
          {categories.map((product) => (
            <div className="product-card" key={product.id}>
              <div
                className="product-icon"
                style={{
                  background: `linear-gradient(135deg, ${product.color}22, ${product.color}44)`,
                  border: `2px solid ${product.color}33`,
                }}
              >
                <span className="icon">{product.icon}</span>
              </div>
              <h3 className="product-name">{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <button 
                className="btn-outline" 
                style={{ borderColor: product.color, color: product.color }}
                onClick={() => {
                  // Navigate to fashion category page
                  window.location.hash = '#/fashion';
                }}
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};