import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Loader2, PackageCheck, Send, ShoppingBag, Sparkles } from 'lucide-react';
import { addCartItem, Cart, checkoutCart, getProducts, Product, sendChatMessage } from '../api/client';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  products?: Product[];
};

const getSessionId = () => {
  const existing = localStorage.getItem('buyoh_chat_session_id');
  if (existing) return existing;
  const next = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  localStorage.setItem('buyoh_chat_session_id', next);
  return next;
};

const productQueryFromMessage = (message: string): Record<string, string | number | undefined> => {
  const value = message.toLowerCase();
  const filters: Record<string, string | number | undefined> = { limit: 6 };

  if (value.includes('wedding')) filters.occasion = 'Wedding';
  if (value.includes('casual') || value.includes('everyday')) filters.occasion = 'Casual';
  if (value.includes('work') || value.includes('office') || value.includes('formal')) filters.occasion = 'Workwear';
  if (value.includes('festive') || value.includes('festival') || value.includes('celebration')) filters.occasion = 'Festive';
  if (value.includes('men') || value.includes('him') || value.includes('male')) filters.audience = 'Men';
  if (value.includes('women') || value.includes('her') || value.includes('female') || value.includes('ladies')) filters.audience = 'Women';
  if (value.includes('kid') || value.includes('child')) filters.audience = 'Kids';
  if (value.includes('dress')) filters.type = 'Dresses';
  if (value.includes('ethnic') || value.includes('kurta') || value.includes('saree')) filters.type = 'Ethnic Wear';

  const budgetMatch = value.match(/(?:under|below|budget)\s*(?:rs\.?|inr)?\s*(\d+)/i);
  if (budgetMatch) filters.max_price = Number(budgetMatch[1]);

  return filters;
};

const formatPrice = (price: number) => `Rs. ${price.toLocaleString('en-IN')}`;

export default function BuyohAI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi, I am your Buyoh styling assistant. Tell me the occasion, budget, size, or style you want and I will recommend real products from the catalog.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [orderStatus, setOrderStatus] = useState<string>('');
  const [catalogError, setCatalogError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useMemo(getSessionId, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    getProducts({ limit: 8 })
      .then(setCatalog)
      .catch((error) => {
        console.error('Product load failed:', error);
        setCatalogError('Product catalog is unavailable. Start the backend on port 3001.');
      });
  }, []);

  const handleSendWithMessage = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);
    setOrderStatus('');

    try {
      const [chatResponse, products] = await Promise.all([
        sendChatMessage(trimmed, undefined, sessionId, 'chat').catch((error) => ({
          response: `I can still help you shop, but the AI service is unavailable: ${error.message}`,
          conversation_id: '',
          session_id: sessionId,
          fallback: true,
        })),
        getProducts(productQueryFromMessage(trimmed)).catch(() => catalog.slice(0, 4)),
      ]);

      const assistantMessage: Message = {
        role: 'assistant',
        content: chatResponse.fallback
          ? `${chatResponse.response} I found these catalog matches for you.`
          : chatResponse.response,
        products,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsProcessing(false);
      window.history.replaceState({}, '', window.location.pathname + window.location.hash);
    }
  };

  const addProductToCart = async (product: Product) => {
    setOrderStatus('');
    try {
      const selectedSize = product.attributes.sizes[0];
      const nextCart = await addCartItem(product.id, 1, selectedSize, cart?.id);
      setCart(nextCart);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `${product.name} (${selectedSize}) has been added to your cart.`,
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: error.message || 'Could not add this product to cart.',
          timestamp: new Date(),
        },
      ]);
    }
  };

  const placeOrder = async () => {
    if (!cart) return;

    setOrderStatus('Placing order...');
    try {
      const order = await checkoutCart(cart.id);
      setOrderStatus(`Order ${order.id.slice(0, 8)} confirmed for ${formatPrice(order.total_amount)}.`);
      setCart(null);
    } catch (error: any) {
      setOrderStatus(error.message || 'Checkout failed.');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialMessage = params.get('message');
    if (initialMessage && messages.length === 1) {
      setTimeout(() => handleSendWithMessage(initialMessage), 400);
    }
  }, []);

  const suggestedPrompts = [
    'I need styling help for a wedding',
    'Suggest casual outfits under 2000',
    'Show me workwear essentials',
    'Find festive ethnic wear',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="border-b border-white/10 bg-slate-950/95 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              buyoh<span className="text-cyan-300">.ai</span>
            </h1>
            <p className="text-xs text-white/55 mt-1">Connected catalog, cart, checkout, and AI assistance</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#/home"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
            >
              <ArrowLeft size={16} />
              Home
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 py-6 grid lg:grid-cols-[1fr_340px] gap-6">
        <section className="min-h-[70vh] flex flex-col">
          <div className="flex-1 space-y-5 pb-40">
            {messages.map((message, index) => (
              <div key={`${message.timestamp.getTime()}-${index}`} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[92%] ${message.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-3`}>
                  <div className={`${message.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-white/7 border border-white/10 text-white'} rounded-2xl px-5 py-4 shadow-xl`}>
                    <p className="leading-7 text-sm sm:text-base">{message.content}</p>
                  </div>

                  {message.products && message.products.length > 0 && (
                    <div className="w-full grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                      {message.products.map((product) => (
                        <article key={product.id} className="bg-white/7 border border-white/10 rounded-lg overflow-hidden">
                          <div className="aspect-[3/4] bg-slate-900 overflow-hidden">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="p-4">
                            <div className="text-xs text-cyan-300 uppercase tracking-wide">
                              {product.attributes.audience} / {product.attributes.type}
                            </div>
                            <h3 className="font-semibold mt-1 line-clamp-1">{product.name}</h3>
                            <p className="text-sm text-white/60 mt-1 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between mt-3">
                              <span className="font-bold">{formatPrice(product.price)}</span>
                              <span className="text-xs text-white/60">{product.attributes.occasion}</span>
                            </div>
                            <button
                              onClick={() => addProductToCart(product)}
                              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold py-2.5 transition-colors"
                            >
                              <ShoppingBag size={16} />
                              Add to Cart
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white/7 border border-white/10 rounded-2xl px-5 py-4 inline-flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-cyan-300" />
                  <span>Finding styles and checking the catalog...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-slate-950/95 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => setInput(prompt)}
                    className="px-3 py-2 bg-white/7 hover:bg-white/12 border border-white/10 rounded-lg text-xs sm:text-sm text-white/85 transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSendWithMessage(input);
                    }
                  }}
                  placeholder="Ask for outfits by occasion, budget, size, style, or gender..."
                  rows={1}
                  disabled={isProcessing}
                  className="flex-1 min-h-[56px] max-h-32 resize-none rounded-lg bg-white/7 border border-white/10 px-4 py-4 text-white placeholder-white/40 outline-none focus:border-cyan-300"
                />
                <button
                  onClick={() => handleSendWithMessage(input)}
                  disabled={!input.trim() || isProcessing}
                  className="w-14 h-14 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10 disabled:text-white/40 text-slate-950 flex items-center justify-center transition-colors"
                  aria-label="Send"
                >
                  <Send size={22} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24 h-fit space-y-4">
          <section className="bg-white/7 border border-white/10 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag size={20} className="text-cyan-300" />
              <h2 className="font-bold">Cart</h2>
            </div>
            {!cart || cart.items.length === 0 ? (
              <p className="text-sm text-white/60">Your cart is empty. Add a recommended product to start checkout.</p>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={`${item.product_id}-${item.size}`} className="flex gap-3">
                    <img src={item.image_url} alt={item.name} className="w-14 h-16 object-cover rounded-md bg-slate-900" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-xs text-white/50">Qty {item.quantity}{item.size ? ` / Size ${item.size}` : ''}</p>
                      <p className="text-sm mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3 text-sm space-y-1">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(cart.totals.subtotal)}</span></div>
                  <div className="flex justify-between"><span>Shipping</span><span>{cart.totals.shipping ? formatPrice(cart.totals.shipping) : 'Free'}</span></div>
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span>{formatPrice(cart.totals.total)}</span></div>
                </div>
                <button
                  onClick={placeOrder}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-semibold py-2.5 transition-colors"
                >
                  <PackageCheck size={17} />
                  Place Demo Order
                </button>
              </div>
            )}
            {orderStatus && (
              <div className="mt-4 text-sm flex gap-2 text-emerald-300">
                <CheckCircle2 size={17} />
                <span>{orderStatus}</span>
              </div>
            )}
          </section>

          <section className="bg-white/7 border border-white/10 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-cyan-300" />
              <h2 className="font-bold">Catalog Preview</h2>
            </div>
            {catalogError ? (
              <p className="text-sm text-amber-200">{catalogError}</p>
            ) : (
              <div className="space-y-3">
                {catalog.slice(0, 4).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSendWithMessage(`Tell me more about ${product.name}`)}
                    className="w-full text-left flex gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <img src={product.image_url} alt={product.name} className="w-12 h-14 object-cover rounded bg-slate-900" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold line-clamp-1">{product.name}</span>
                      <span className="block text-xs text-white/50">{formatPrice(product.price)}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}
