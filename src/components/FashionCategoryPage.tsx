import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronUp, Loader2, ShoppingBag, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { addCartItem, getProducts, Product } from '../api/client';

const priceRanges = [
  { label: 'All Prices', value: 'all', max: undefined },
  { label: 'Under Rs. 1000', value: 'under1000', max: 1000 },
  { label: 'Under Rs. 2000', value: 'under2000', max: 2000 },
  { label: 'Under Rs. 4000', value: 'under4000', max: 4000 },
];

const formatPrice = (price: number) => `Rs. ${price.toLocaleString('en-IN')}`;

const FashionCategoryPage = () => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    audience: true,
    occasion: true,
    type: true,
    price: true,
    size: false,
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cartNotice, setCartNotice] = useState('');

  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string[]>([]);
  const [cartId, setCartId] = useState<string | undefined>(() => localStorage.getItem('buyoh_cart_id') || undefined);

  useEffect(() => {
    getProducts({ limit: 50 })
      .then(setProducts)
      .catch((err) => {
        console.error('Products failed:', err);
        setError('Could not load products. Make sure the backend is running on port 3001.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  const audiences = useMemo(() => Array.from(new Set(products.map((p) => p.attributes.audience))).sort(), [products]);
  const occasions = useMemo(() => Array.from(new Set(products.map((p) => p.attributes.occasion))).sort(), [products]);
  const types = useMemo(() => Array.from(new Set(products.map((p) => p.attributes.type))).sort(), [products]);
  const sizes = useMemo(() => Array.from(new Set(products.flatMap((p) => p.attributes.sizes))).sort(), [products]);

  const selectedPriceRange = priceRanges.find((range) => range.value === selectedPrice);
  const filteredProducts = products.filter((product) => {
    return (
      (selectedAudience.length === 0 || selectedAudience.includes(product.attributes.audience)) &&
      (selectedOccasion.length === 0 || selectedOccasion.includes(product.attributes.occasion)) &&
      (selectedType.length === 0 || selectedType.includes(product.attributes.type)) &&
      (!selectedPriceRange?.max || product.price <= selectedPriceRange.max) &&
      (selectedSize.length === 0 || product.attributes.sizes.some((size) => selectedSize.includes(size)))
    );
  });

  const toggleFilter = (filterName: keyof typeof expandedFilters) => {
    setExpandedFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const toggleSelection = (value: string, selected: string[], setSelected: React.Dispatch<React.SetStateAction<string[]>>) => {
    setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
  };

  const clearAllFilters = () => {
    setSelectedAudience([]);
    setSelectedOccasion([]);
    setSelectedType([]);
    setSelectedPrice('all');
    setSelectedSize([]);
  };

  const hasActiveFilters =
    selectedAudience.length > 0 ||
    selectedOccasion.length > 0 ||
    selectedType.length > 0 ||
    selectedPrice !== 'all' ||
    selectedSize.length > 0;

  const handleAddToCart = async (product: Product) => {
    try {
      const cart = await addCartItem(product.id, 1, product.attributes.sizes[0], cartId);
      setCartId(cart.id);
      localStorage.setItem('buyoh_cart_id', cart.id);
      setCartNotice(`${product.name} added to cart.`);
    } catch (err: any) {
      setCartNotice(err.message || 'Could not add item to cart.');
    }
  };

  const FilterGroup = ({
    name,
    title,
    values,
    selected,
    setSelected,
  }: {
    name: keyof typeof expandedFilters;
    title: string;
    values: string[];
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  }) => (
    <div className="border-b border-gray-200 pb-4">
      <button onClick={() => toggleFilter(name)} className="w-full flex items-center justify-between text-left mb-3">
        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">{title}</h4>
        {expandedFilters[name] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {expandedFilters[name] && (
        <div className="space-y-2">
          {values.map((value) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => toggleSelection(value, selected, setSelected)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">{value}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );

  const FilterPanel = ({ isMobile }: { isMobile: boolean }) => (
    <div className={`${isMobile ? 'fixed inset-0 bg-white z-50 overflow-y-auto' : 'sticky top-24'}`}>
      {isMobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>
      )}

      <div className={`${isMobile ? 'p-4' : ''} space-y-6`}>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="w-full px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
            Clear All Filters
          </button>
        )}

        <FilterGroup name="audience" title="Audience" values={audiences} selected={selectedAudience} setSelected={setSelectedAudience} />
        <FilterGroup name="occasion" title="Occasion" values={occasions} selected={selectedOccasion} setSelected={setSelectedOccasion} />
        <FilterGroup name="type" title="Clothing Type" values={types} selected={selectedType} setSelected={setSelectedType} />

        <div className="border-b border-gray-200 pb-4">
          <button onClick={() => toggleFilter('price')} className="w-full flex items-center justify-between text-left mb-3">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Price Range</h4>
            {expandedFilters.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedFilters.price && (
            <div className="space-y-2">
              {priceRanges.map((range) => (
                <label key={range.value} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name="price"
                    checked={selectedPrice === range.value}
                    onChange={() => setSelectedPrice(range.value)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900">{range.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="pb-4">
          <button onClick={() => toggleFilter('size')} className="w-full flex items-center justify-between text-left mb-3">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Size</h4>
            {expandedFilters.size ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expandedFilters.size && (
            <div className="grid grid-cols-3 gap-2">
              {sizes.map((size) => (
                <label
                  key={size}
                  className={`flex items-center justify-center px-3 py-2 border rounded-lg cursor-pointer transition-all ${
                    selectedSize.includes(size) ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input type="checkbox" checked={selectedSize.includes(size)} onChange={() => toggleSelection(size, selectedSize, setSelectedSize)} className="sr-only" />
                  <span className="text-sm font-medium">{size}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {isMobile && (
        <div className="sticky bottom-0 p-4 bg-white border-t border-gray-200">
          <button onClick={() => setMobileFiltersOpen(false)} className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors">
            Apply Filters ({filteredProducts.length} items)
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fashion Collection</h1>
              <p className="text-sm text-gray-600 mt-1">Live catalog styles for every occasion</p>
            </div>
            <a href="#/home" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              <ArrowLeft size={16} />
              Back to Home
            </a>
          </div>
        </div>
      </header>

      <div className="bg-gradient-to-r from-indigo-500 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles size={24} />
              <div>
                <h3 className="font-bold text-lg">Need styling help?</h3>
                <p className="text-sm text-indigo-50">Ask the AI assistant for product recommendations.</p>
              </div>
            </div>
            <button onClick={() => (window.location.hash = '#/chat?message=I need styling help for fashion')} className="px-6 py-2.5 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-colors whitespace-nowrap">
              Get Styling Help
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cartNotice && <div className="mb-5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 text-sm">{cartNotice}</div>}

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Filters</h3>
              <FilterPanel isMobile={false} />
            </div>
          </aside>

          <main className="flex-1">
            <div className="lg:hidden mb-4">
              <button onClick={() => setMobileFiltersOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <SlidersHorizontal size={18} />
                <span className="font-medium">Filters</span>
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-24 bg-white rounded-lg shadow-sm">
                <Loader2 className="animate-spin text-indigo-600" size={28} />
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm text-red-600">{error}</div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <article key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="relative overflow-hidden aspect-[3/4] bg-gray-100">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-gray-900 rounded-full shadow-sm">
                          {product.attributes.occasion}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                          {product.attributes.audience} / {product.attributes.type}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                      <p className="text-lg font-bold text-gray-900 mb-3">{formatPrice(product.price)}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {product.attributes.sizes.slice(0, 4).map((size) => (
                          <span key={size} className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
                            {size}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => (window.location.hash = `#/chat?message=Tell me more about ${product.name}`)} className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors">
                          Details
                        </button>
                        <button onClick={() => handleAddToCart(product)} className="py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2">
                          <ShoppingBag size={16} />
                          Add
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">No products found matching your filters.</p>
                <button onClick={clearAllFilters} className="mt-4 px-6 py-2 text-indigo-600 hover:text-indigo-700 font-medium">
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="lg:hidden">
          <FilterPanel isMobile={true} />
        </div>
      )}
    </div>
  );
};

export default FashionCategoryPage;
