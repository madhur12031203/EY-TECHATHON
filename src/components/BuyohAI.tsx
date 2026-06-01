import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  PackageCheck,
  Send,
  ShoppingBag,
  Sparkles,
  UserRound,
} from 'lucide-react';
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
      content:
        'Hi, I am your Buyoh styling assistant. Tell me the occasion, budget, size, or style you want and I will suggest catalog-ready outfits.',
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
  }, [messages, isProcessing]);

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

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      },
    ]);
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

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: chatResponse.fallback
            ? `${chatResponse.response} I found these catalog matches for you.`
            : chatResponse.response,
          products,
          timestamp: new Date(),
        },
      ]);
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
    'Wedding outfit under 5000',
    'Casual looks under 2000',
    'Office wear for women',
    'Festive ethnic wear',
  ];

  const cartCount = cart?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-zinc-950" style={{ fontFamily: 'Inter, sans-serif' }}>
      <header className="sticky top-0 z-30 border-b border-zinc-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a
            href="#/home"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-700 shadow-sm transition hover:bg-zinc-50"
            aria-label="Back to home"
          >
            <ArrowLeft size={18} />
          </a>

          <div className="min-w-0 flex-1 text-center">
            <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
              buyoh<span className="text-teal-600">.ai</span>
            </h1>
            <p className="hidden text-xs text-zinc-500 sm:block">AI styling assistant with live catalog and checkout</p>
          </div>

          <div className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 shadow-sm">
            <ShoppingBag size={16} className="text-teal-600" />
            <span>{cartCount}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8">
        <section className="min-w-0 pb-36">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
            {messages.map((message, index) => {
              const isUser = message.role === 'user';

              return (
                <div key={`${message.timestamp.getTime()}-${index}`} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  {!isUser && (
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm">
                      <Sparkles size={17} />
                    </div>
                  )}

                  <div className={`flex min-w-0 flex-col gap-3 ${isUser ? 'max-w-[82%] items-end' : 'max-w-[calc(100%-52px)] flex-1'}`}>
                    <div
                      className={
                        isUser
                          ? 'rounded-2xl bg-zinc-900 px-4 py-3 text-sm leading-6 text-white shadow-sm sm:text-base'
                          : 'rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm leading-6 text-zinc-800 shadow-sm sm:px-5 sm:py-4 sm:text-base'
                      }
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.products && message.products.length > 0 && (
                      <div className="grid w-full gap-3 sm:grid-cols-2">
                        {message.products.map((product) => (
                          <article key={product.id} className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm">
                            <div className="grid grid-cols-[112px_1fr]">
                              <div className="h-full min-h-[154px] bg-zinc-100">
                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                              </div>
                              <div className="flex min-w-0 flex-col p-3">
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-teal-700">
                                  {product.attributes.audience} / {product.attributes.type}
                                </div>
                                <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-zinc-950">{product.name}</h3>
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-500">{product.description}</p>
                                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                                  <span className="text-sm font-bold text-zinc-950">{formatPrice(product.price)}</span>
                                  <button
                                    onClick={() => addProductToCart(product)}
                                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-3 text-xs font-semibold text-white transition hover:bg-teal-700"
                                  >
                                    <ShoppingBag size={14} />
                                    Add
                                  </button>
                                </div>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-zinc-700 shadow-sm ring-1 ring-zinc-200">
                      <UserRound size={17} />
                    </div>
                  )}
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex gap-3">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-950 text-white shadow-sm">
                  <Sparkles size={17} />
                </div>
                <div className="inline-flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-4 text-sm text-zinc-700 shadow-sm">
                  <Loader2 size={18} className="animate-spin text-teal-600" />
                  Finding styles and checking the catalog...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </section>

        <aside className="pb-36 lg:pb-0">
          <div className="space-y-4 lg:sticky lg:top-24">
            <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={19} className="text-teal-600" />
                  <h2 className="font-semibold text-zinc-950">Cart</h2>
                </div>
                {cartCount > 0 && <span className="rounded-full bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-700">{cartCount} item</span>}
              </div>

              {!cart || cart.items.length === 0 ? (
                <p className="text-sm leading-6 text-zinc-500">Add a recommended product and checkout will appear here.</p>
              ) : (
                <div className="space-y-3">
                  {cart.items.map((item) => (
                    <div key={`${item.product_id}-${item.size}`} className="flex gap-3 rounded-lg border border-zinc-100 p-2">
                      <img src={item.image_url} alt={item.name} className="h-16 w-14 rounded-md bg-zinc-100 object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-sm font-semibold text-zinc-900">{item.name}</p>
                        <p className="text-xs text-zinc-500">
                          Qty {item.quantity}
                          {item.size ? ` / Size ${item.size}` : ''}
                        </p>
                        <p className="mt-1 text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2 border-t border-zinc-100 pt-3 text-sm">
                    <div className="flex justify-between text-zinc-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(cart.totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-600">
                      <span>Shipping</span>
                      <span>{cart.totals.shipping ? formatPrice(cart.totals.shipping) : 'Free'}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-zinc-950">
                      <span>Total</span>
                      <span>{formatPrice(cart.totals.total)}</span>
                    </div>
                  </div>

                  <button
                    onClick={placeOrder}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-zinc-950 text-sm font-semibold text-white transition hover:bg-zinc-800"
                  >
                    <PackageCheck size={17} />
                    Place Demo Order
                  </button>
                </div>
              )}

              {orderStatus && (
                <div className="mt-4 flex gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
                  <span>{orderStatus}</span>
                </div>
              )}
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles size={19} className="text-teal-600" />
                <h2 className="font-semibold text-zinc-950">Catalog Preview</h2>
              </div>

              {catalogError ? (
                <p className="rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-800">{catalogError}</p>
              ) : (
                <div className="space-y-2">
                  {catalog.slice(0, 4).map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSendWithMessage(`Tell me more about ${product.name}`)}
                      className="flex w-full gap-3 rounded-lg p-2 text-left transition hover:bg-zinc-50"
                    >
                      <img src={product.image_url} alt={product.name} className="h-14 w-12 rounded-md bg-zinc-100 object-cover" />
                      <span className="min-w-0">
                        <span className="block line-clamp-1 text-sm font-semibold text-zinc-900">{product.name}</span>
                        <span className="block text-xs text-zinc-500">{formatPrice(product.price)}</span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </aside>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200/80 bg-[#f7f7f8]/95 px-4 py-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-700 shadow-sm transition hover:bg-zinc-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="flex items-end gap-2 rounded-2xl border border-zinc-200 bg-white p-2 shadow-lg shadow-zinc-200/70">
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
              className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-zinc-950 outline-none placeholder:text-zinc-400 sm:text-base"
            />
            <button
              onClick={() => handleSendWithMessage(input)}
              disabled={!input.trim() || isProcessing}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-950 text-white transition hover:bg-zinc-800 disabled:bg-zinc-200 disabled:text-zinc-400"
              aria-label="Send"
            >
              {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
