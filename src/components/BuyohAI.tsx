import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ShoppingBag } from 'lucide-react';

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

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: Product[];
};

// Mock product catalog - same as FashionCategoryPage
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

// ============================================================
// MOCK AI LOGIC - PRODUCT FILTERING BASED ON USER INTENT
// ============================================================
// TODO: Replace with real AI/backend integration
// This function simulates intelligent product recommendations
// by parsing user queries and filtering the catalog accordingly
// ============================================================
const getMockAIResponse = (userMessage: string): { text: string; products: Product[] } => {
  const message = userMessage.toLowerCase();
  let products: Product[] = [];
  let text = '';

  // Wedding styling
  if (message.includes('wedding')) {
    products = MOCK_PRODUCTS.filter(p => p.occasion === 'Wedding').slice(0, 3);
    text = "Great choice! Weddings are the perfect time to dress up ✨ Based on your request, here are some wedding-appropriate styles you might like:";
  }
  // Casual styling
  else if (message.includes('casual') || message.includes('everyday')) {
    products = MOCK_PRODUCTS.filter(p => p.occasion === 'Casual').slice(0, 3);
    text = "For casual days, comfort and style go hand in hand! Here are some relaxed styles you may like:";
  }
  // Workwear
  else if (message.includes('work') || message.includes('office') || message.includes('formal')) {
    products = MOCK_PRODUCTS.filter(p => p.occasion === 'Workwear').slice(0, 3);
    text = "Professional and polished! Here are some workwear essentials that will make you look sharp:";
  }
  // Festive
  else if (message.includes('festive') || message.includes('festival') || message.includes('celebration')) {
    products = MOCK_PRODUCTS.filter(p => p.occasion === 'Festive').slice(0, 3);
    text = "Celebrations call for special outfits! ✨ Here are some festive styles perfect for the occasion:";
  }
  // Men's fashion
  else if (message.includes('men') || message.includes('him') || message.includes('male')) {
    products = MOCK_PRODUCTS.filter(p => p.category === 'Men').slice(0, 3);
    text = "Here are some great options from our men's collection:";
  }
  // Women's fashion
  else if (message.includes('women') || message.includes('her') || message.includes('female') || message.includes('ladies')) {
    products = MOCK_PRODUCTS.filter(p => p.category === 'Women').slice(0, 3);
    text = "Here are some stunning pieces from our women's collection:";
  }
  // Kids fashion
  else if (message.includes('kid') || message.includes('child') || message.includes('children')) {
    products = MOCK_PRODUCTS.filter(p => p.category === 'Kids').slice(0, 3);
    text = "Adorable styles for little ones! Here are some great options:";
  }
  // Price-based queries
  else if (message.includes('under') || message.includes('below') || message.includes('budget')) {
    const priceMatch = message.match(/\d+/);
    if (priceMatch) {
      const budget = parseInt(priceMatch[0]);
      products = MOCK_PRODUCTS.filter(p => p.price <= budget).slice(0, 3);
      text = `I found some great options under ₹${budget} for you:`;
    } else {
      products = MOCK_PRODUCTS.filter(p => p.price <= 2000).slice(0, 3);
      text = "Here are some budget-friendly options:";
    }
  }
  // Dress queries
  else if (message.includes('dress')) {
    products = MOCK_PRODUCTS.filter(p => p.type === 'Dresses').slice(0, 3);
    text = "Beautiful dresses that will make you stand out:";
  }
  // Ethnic wear
  else if (message.includes('ethnic') || message.includes('traditional') || message.includes('kurta') || message.includes('saree')) {
    products = MOCK_PRODUCTS.filter(p => p.type === 'Ethnic Wear').slice(0, 3);
    text = "Traditional elegance at its finest! Here are some ethnic wear options:";
  }
  // Default/General styling help
  else {
    products = MOCK_PRODUCTS.slice(0, 4);
    text = "I'd love to help you find the perfect outfit! Here are some popular styles from our collection. Feel free to tell me more about what you're looking for - the occasion, your style preferences, or your budget!";
  }

  return { text, products };
};

export default function BuyohAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your personal styling assistant 👋 I can help you find the perfect outfit for any occasion. Just tell me what you\'re looking for!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendWithMessage = async (messageText: string) => {
    if (!messageText.trim() || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    // Simulate AI processing delay for demo effect
    setTimeout(() => {
      // ============================================================
      // TODO: REAL AI/BACKEND INTEGRATION POINT
      // ============================================================
      // Replace this mock function with actual API call:
      // const response = await fetch('/api/chat', {
      //   method: 'POST',
      //   body: JSON.stringify({ message: userMessage.content })
      // });
      // const data = await response.json();
      // ============================================================
      
      const mockResponse = getMockAIResponse(userMessage.content);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: mockResponse.text,
        products: mockResponse.products,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      
      // Clear URL param after sending
      if (typeof window !== 'undefined') {
        window.history.replaceState({}, '', window.location.pathname + window.location.hash);
      }
    }, 800);
  };

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    await handleSendWithMessage(input);
    setInput('');
  };

  // Check for initial message from URL query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const initialMessage = params.get('message');
      if (initialMessage && messages.length === 1) {
        // Auto-send initial message after a brief delay
        setTimeout(() => {
          handleSendWithMessage(initialMessage);
        }, 500);
      }
    }
  }, []);

  const suggestedPrompts = [
    "I need styling help for a wedding",
    "Suggest something casual for everyday",
    "Show me workwear essentials",
    "Find me ethnic wear under ₹3000"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col relative overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <header className="relative border-b border-white/5 bg-black/30 backdrop-blur-xl sticky top-0 z-10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-5 flex items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em' }}>
            buyoh<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">.ai</span>
          </h1>
          <div className="flex items-center gap-3 text-xs sm:text-sm text-white/70 flex-wrap justify-end">
            {/* Demo Mode Badge */}
            <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              🎭 Demo Mode
            </div>
            <a
              href="#/home"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all shadow-lg shadow-cyan-500/10"
            >
              ← Back to Home
            </a>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="hidden sm:inline font-medium tracking-wide">AI Styling Assistant</span>
              <span className="sm:hidden font-medium tracking-wide">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="relative flex-1 flex justify-center px-6 sm:px-8 lg:px-10 py-10 sm:py-12 pb-48 sm:pb-40">
        <div className="w-full max-w-5xl flex-1 flex flex-col">
          {/* Messages Area */}
          {messages.length > 1 && (
            <div className="w-full space-y-6 mb-10 flex-1 overflow-y-auto">
              {messages.slice(1).map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] ${msg.role === 'user' ? 'flex flex-col items-end' : 'flex flex-col items-start'}`}>
                  {/* Message Bubble */}
                  <div className={`${msg.role === 'user' ? 'bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 text-white shadow-xl shadow-cyan-600/30' : 'bg-white/5 text-white backdrop-blur-xl border border-white/10'} rounded-3xl px-6 sm:px-8 py-5 sm:py-6 shadow-2xl transition-all duration-300 hover:shadow-cyan-500/20`}>
                    <p className="leading-relaxed text-[15px] sm:text-base text-white/95 font-normal" style={{ lineHeight: '1.7' }}>{msg.content}</p>
                  </div>
                  
                  {/* Product Suggestions */}
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-4 w-full">
                      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {msg.products.map((product) => (
                          <div
                            key={product.id}
                            className="flex-shrink-0 w-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-white/20 transition-all duration-300 group"
                          >
                            {/* Product Image */}
                            <div className="relative aspect-[3/4] bg-gray-800 overflow-hidden">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                                  {product.occasion}
                                </span>
                              </div>
                            </div>
                            
                            {/* Product Details */}
                            <div className="p-4">
                              <div className="mb-1">
                                <span className="text-xs font-medium text-cyan-400 uppercase tracking-wide">
                                  {product.category} • {product.type}
                                </span>
                              </div>
                              <h4 className="text-sm font-semibold text-white mb-2 line-clamp-1">
                                {product.name}
                              </h4>
                              <p className="text-lg font-bold text-white mb-3">
                                ₹{product.price.toLocaleString('en-IN')}
                              </p>
                              
                              {/* View Button */}
                              <button
                                onClick={() => {
                                  window.location.hash = `#/fashion`;
                                }}
                                className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                              >
                                <ShoppingBag size={16} />
                                View Product
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Follow-up message for products */}
                      <div className="mt-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-4">
                        <p className="text-sm text-white/80">
                          💡 Want to see more options? Ask me about specific styles, colors, or price ranges!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 backdrop-blur-xl border border-white/10 shadow-xl">
                    <Sparkles size={26} className="text-cyan-400 animate-pulse" />
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl px-7 py-5 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" />
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.15s' }} />
                    <div className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-indigo-400 rounded-full animate-bounce shadow-lg shadow-cyan-400/50" style={{ animationDelay: '0.3s' }} />
                    <span className="text-white/85 text-base ml-3 font-semibold">Finding perfect styles...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
            </div>
          )}

          {/* Centered Input Area - When no messages */}
          {messages.length === 1 && (
            <div className="flex-1 flex flex-col items-center justify-center w-full">
              <div className="w-full space-y-8">
              {/* Welcome Message */}
              <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-cyan-500/20 to-purple-500/20 border border-white/10 mb-8 shadow-2xl backdrop-blur-md">
                  <Sparkles className="text-cyan-400" size={42} />
                </div>
                <h2 className="text-5xl sm:text-6xl font-bold text-white mb-5 bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                  Your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Styling Assistant</span>
                </h2>
                <p className="text-white/70 text-lg sm:text-xl max-w-2xl mx-auto mb-4" style={{ lineHeight: '1.7' }}>
                  Tell me about the occasion, your style preferences, or budget - I'll find the perfect outfit for you!
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-400/20 rounded-full text-amber-300 text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Demo Mode - AI responses simulated with catalog data
                </div>
              </div>

              {/* Suggested Prompts */}
              <div className="flex flex-wrap gap-3 justify-center mb-10">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(prompt)}
                    className="px-6 py-3 bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 rounded-xl text-sm text-white/85 transition-all duration-200 hover:scale-105 active:scale-95 hover:border-white/20 shadow-lg hover:shadow-xl font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Centered Input Bar */}
              <div className="flex gap-4 items-end justify-center">
                <div className="flex-1 max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-white/20 transition-all duration-300">
                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask me about styling for any occasion..."
                    className="w-full bg-transparent text-white placeholder-white/40 px-6 sm:px-7 py-5 sm:py-6 outline-none resize-none text-base sm:text-lg"
                    rows={1}
                    disabled={isProcessing}
                    style={{ minHeight: '72px', maxHeight: '140px', lineHeight: '1.6' }}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  className="px-8 py-6 bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:via-cyan-500 hover:to-indigo-500 disabled:from-white/10 disabled:to-white/10 disabled:cursor-not-allowed text-white rounded-3xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-cyan-600/30 hover:shadow-2xl hover:shadow-cyan-600/40 disabled:shadow-none flex items-center justify-center min-w-[80px]"
                >
                  <Send size={26} />
                </button>
              </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Fixed Input Area - When messages exist */}
      {messages.length > 1 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-indigo-950/98 to-transparent backdrop-blur-xl border-t border-white/5 shadow-2xl">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-10 py-6 sm:py-7">
            <div className="flex gap-4 items-end justify-center w-full">
              <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-white/20 transition-all duration-300">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me about styling for any occasion..."
                  className="w-full bg-transparent text-white placeholder-white/40 px-6 sm:px-7 py-5 sm:py-6 outline-none resize-none text-base sm:text-lg"
                  rows={1}
                  disabled={isProcessing}
                  style={{ minHeight: '64px', maxHeight: '140px', lineHeight: '1.6' }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="px-7 sm:px-8 py-5 sm:py-6 bg-gradient-to-r from-indigo-600 via-cyan-600 to-indigo-600 hover:from-indigo-500 hover:via-cyan-500 hover:to-indigo-500 disabled:from-white/10 disabled:to-white/10 disabled:cursor-not-allowed text-white rounded-3xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-cyan-600/30 hover:shadow-2xl hover:shadow-cyan-600/40 disabled:shadow-none flex items-center justify-center min-w-[72px] sm:min-w-[80px]"
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}