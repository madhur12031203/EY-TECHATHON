import React, { useState, useEffect } from 'react';
import { X, SlidersHorizontal, ChevronDown, ChevronUp, Sparkles, ArrowLeft } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  category: string;
  occasion: string;
  type: string;
  price: number;
  size: string[];
  image: string;
};

// Mock product data - Replace with real API data later
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Classic White Shirt',
    category: 'Men',
    occasion: 'Workwear',
    type: 'Shirts',
    price: 1299,
    size: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop'
  },
  {
    id: 2,
    name: 'Elegant Silk Dress',
    category: 'Women',
    occasion: 'Wedding',
    type: 'Dresses',
    price: 2899,
    size: ['S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop'
  },
  {
    id: 3,
    name: 'Casual Denim Jacket',
    category: 'Men',
    occasion: 'Casual',
    type: 'Jackets',
    price: 2499,
    size: ['M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop'
  },
  {
    id: 4,
    name: 'Festive Kurta Set',
    category: 'Women',
    occasion: 'Festive',
    type: 'Ethnic Wear',
    price: 3499,
    size: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop'
  },
  {
    id: 5,
    name: 'Premium Blazer',
    category: 'Men',
    occasion: 'Workwear',
    type: 'Blazers',
    price: 4999,
    size: ['M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop'
  },
  {
    id: 6,
    name: 'Summer Floral Dress',
    category: 'Women',
    occasion: 'Casual',
    type: 'Dresses',
    price: 1799,
    size: ['S', 'M', 'L'],
    image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop'
  },
  {
    id: 7,
    name: 'Cotton T-Shirt',
    category: 'Men',
    occasion: 'Casual',
    type: 'T-Shirts',
    price: 699,
    size: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop'
  },
  {
    id: 8,
    name: 'Designer Saree',
    category: 'Women',
    occasion: 'Wedding',
    type: 'Ethnic Wear',
    price: 5999,
    size: ['One Size'],
    image: 'data:image/jpeg;base64,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'
  },
  {
    id: 9,
    name: 'Kids Party Dress',
    category: 'Kids',
    occasion: 'Festive',
    type: 'Dresses',
    price: 1299,
    size: ['2-3Y', '4-5Y', '6-7Y'],
    image: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=500&fit=crop'
  },
  {
    id: 10,
    name: 'Formal Trousers',
    category: 'Men',
    occasion: 'Workwear',
    type: 'Bottoms',
    price: 1899,
    size: ['30', '32', '34', '36'],
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop'
  },
  {
    id: 11,
    name: 'Casual Palazzo Pants',
    category: 'Women',
    occasion: 'Casual',
    type: 'Bottoms',
    price: 1199,
    size: ['S', 'M', 'L', 'XL'],
    image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop'
  },
  {
    id: 12,
    name: 'Kids Casual Shirt',
    category: 'Kids',
    occasion: 'Casual',
    type: 'Shirts',
    price: 799,
    size: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
    image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=500&fit=crop'
  }
];

const FashionCategoryPage = () => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    category: true,
    occasion: true,
    type: true,
    price: true,
    size: false
  });
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(MOCK_PRODUCTS);

  // Filter options
  const categories = ['Men', 'Women', 'Kids'];
  const occasions = ['Wedding', 'Casual', 'Workwear', 'Festive'];
  const types = ['Shirts', 'T-Shirts', 'Dresses', 'Ethnic Wear', 'Bottoms', 'Blazers', 'Jackets'];
  const priceRanges = [
    { label: 'All Prices', value: 'all', min: 0, max: Infinity },
    { label: 'Under ₹1000', value: 'under1000', min: 0, max: 1000 },
    { label: '₹1000 - ₹2000', value: '1000-2000', min: 1000, max: 2000 },
    { label: '₹2000 - ₹4000', value: '2000-4000', min: 2000, max: 4000 },
    { label: 'Above ₹4000', value: 'above4000', min: 4000, max: Infinity }
  ];
  const sizes = ['S', 'M', 'L', 'XL', '2-3Y', '4-5Y', '6-7Y', '8-9Y', '30', '32', '34', '36'];

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = [...MOCK_PRODUCTS];

    // Category filter
    if (selectedCategory.length > 0) {
      filtered = filtered.filter(p => selectedCategory.includes(p.category));
    }

    // Occasion filter
    if (selectedOccasion.length > 0) {
      filtered = filtered.filter(p => selectedOccasion.includes(p.occasion));
    }

    // Type filter
    if (selectedType.length > 0) {
      filtered = filtered.filter(p => selectedType.includes(p.type));
    }

    // Price filter
    if (selectedPrice !== 'all') {
      const priceRange = priceRanges.find(pr => pr.value === selectedPrice);
      if (priceRange) {
        filtered = filtered.filter(p => p.price >= priceRange.min && p.price < priceRange.max);
      }
    }

    // Size filter
    if (selectedSize.length > 0) {
      filtered = filtered.filter(p => p.size.some(s => selectedSize.includes(s)));
    }

    setFilteredProducts(filtered);
  }, [selectedCategory, selectedOccasion, selectedType, selectedPrice, selectedSize]);

  const toggleFilter = (filterName: keyof typeof expandedFilters) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  const handleCheckboxChange = (value: string, selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(v => v !== value));
    } else {
      setSelected([...selected, value]);
    }
  };

  const clearAllFilters = () => {
    setSelectedCategory([]);
    setSelectedOccasion([]);
    setSelectedType([]);
    setSelectedPrice('all');
    setSelectedSize([]);
  };

  const hasActiveFilters = selectedCategory.length > 0 || 
    selectedOccasion.length > 0 || 
    selectedType.length > 0 || 
    selectedPrice !== 'all' || 
    selectedSize.length > 0;

  // Filter Panel Component
  interface FilterPanelProps { isMobile: boolean }
  const FilterPanel: React.FC<FilterPanelProps> = ({ isMobile }) => (
    <div className={`${isMobile ? 'fixed inset-0 bg-white z-50 overflow-y-auto' : 'sticky top-24'}`}>
      {/* Mobile header */}
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className={`${isMobile ? 'p-4' : ''} space-y-6`}>
        {/* Clear all filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="w-full px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Clear All Filters
          </button>
        )}

        {/* Category Filter */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleFilter('category')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Category</h4>
            {expandedFilters.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedFilters.category && (
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedCategory.includes(cat)}
                    onChange={() => handleCheckboxChange(cat, selectedCategory, setSelectedCategory)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Occasion Filter */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleFilter('occasion')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Occasion</h4>
            {expandedFilters.occasion ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedFilters.occasion && (
            <div className="space-y-2">
              {occasions.map(occ => (
                <label key={occ} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedOccasion.includes(occ)}
                    onChange={() => handleCheckboxChange(occ, selectedOccasion, setSelectedOccasion)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{occ}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Type Filter */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleFilter('type')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Clothing Type</h4>
            {expandedFilters.type ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedFilters.type && (
            <div className="space-y-2">
              {types.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedType.includes(type)}
                    onChange={() => handleCheckboxChange(type, selectedType, setSelectedType)}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{type}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div className="border-b border-gray-200 pb-4">
          <button
            onClick={() => toggleFilter('price')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Price Range</h4>
            {expandedFilters.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedFilters.price && (
            <div className="space-y-2">
              {priceRanges.map(pr => (
                <label key={pr.value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="price"
                    checked={selectedPrice === pr.value}
                    onChange={() => setSelectedPrice(pr.value)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{pr.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Size Filter */}
        <div className="pb-4">
          <button
            onClick={() => toggleFilter('size')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Size</h4>
            {expandedFilters.size ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedFilters.size && (
            <div className="grid grid-cols-3 gap-2">
              {sizes.map(size => (
                <label
                  key={size}
                  className={`flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-all ${
                    selectedSize.includes(size)
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSize.includes(size)}
                    onChange={() => handleCheckboxChange(size, selectedSize, setSelectedSize)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{size}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile apply button */}
      {isMobile && (
        <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={() => setMobileFiltersOpen(false)}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
          >
            Apply Filters ({filteredProducts.length} items)
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fashion Collection</h1>
              <p className="text-sm text-gray-600 mt-1">Curated styles for every occasion</p>
            </div>
            <a
              href="#/home"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </header>

      {/* AI Styling Help Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="text-yellow-300" size={24} />
              <div>
                <h3 className="font-bold text-lg">Not sure what to wear?</h3>
                <p className="text-sm text-indigo-100">Get AI-powered styling recommendations</p>
              </div>
            </div>
            <button
              onClick={() => window.location.hash = '#/chat?message=I need styling help for fashion'}
              className="px-6 py-2.5 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap"
            >
              Get Styling Help
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
              <FilterPanel isMobile={false} />
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1">
            {/* Mobile filter button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal size={18} />
                <span className="font-medium">Filters</span>
                {hasActiveFilters && (
                  <span className="ml-1 px-2 py-0.5 bg-indigo-600 text-white text-xs font-bold rounded-full">
                    {[selectedCategory, selectedOccasion, selectedType, selectedSize]
                      .reduce((acc, arr) => acc + arr.length, 0) + (selectedPrice !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>
            </div>

            {/* Results count */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
              </p>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group"
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-900 rounded-full shadow-sm">
                          {product.occasion}
                        </span>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                          {product.category} • {product.type}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-lg font-bold text-gray-900 mb-3">
                        ₹{product.price.toLocaleString('en-IN')}
                      </p>

                      {/* Sizes */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {product.size.slice(0, 4).map(size => (
                          <span
                            key={size}
                            className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded"
                          >
                            {size}
                          </span>
                        ))}
                        {product.size.length > 4 && (
                          <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                            +{product.size.length - 4}
                          </span>
                        )}
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          // TODO: Integrate with product details page or quick view modal
                          window.location.hash = `#/chat?message=Tell me more about ${product.name}`;
                        }}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 px-6 py-2 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mobileFiltersOpen && (
        <div className="lg:hidden">
          <FilterPanel isMobile={true} />
        </div>
      )}
    </div>
  );
};

export default FashionCategoryPage;