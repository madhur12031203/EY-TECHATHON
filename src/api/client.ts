/**
 * API Client for communicating with the backend
 */

// Use webpack DefinePlugin or fallback to default
// Webpack DefinePlugin will replace process.env.API_BASE_URL at build time
export const API_BASE_URL: string = 
  typeof process !== 'undefined' && 
  process.env && 
  process.env.API_BASE_URL
    ? process.env.API_BASE_URL
    : 'http://localhost:3001/api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  session_id: string;
  fallback?: boolean;
  state?: {
    intent?: string;
    category?: string;
    active_worker?: string;
  };
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: 'fashion';
  brand: string;
  price: number;
  image_url: string;
  attributes: {
    audience: 'Men' | 'Women' | 'Kids' | 'Unisex';
    occasion: 'Wedding' | 'Casual' | 'Workwear' | 'Festive';
    type: string;
    sizes: string[];
    colors: string[];
    material: string;
  };
}

export interface CartItem {
  product_id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  size?: string;
}

export interface Cart {
  id: string;
  items: CartItem[];
  status: 'active' | 'completed';
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
}

export async function sendChatMessage(
  message: string,
  userId?: string,
  sessionId?: string,
  channel: 'chat' | 'voice' = 'chat'
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        session_id: sessionId,
        channel,
        message,
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to send message';
      try {
        const error = await response.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }
      
      // Provide helpful error messages
      if (response.status === 0 || response.status === 404) {
        errorMessage = `Cannot connect to backend at ${API_BASE_URL}. Make sure the backend server is running on port 3001.`;
      } else if (response.status === 500) {
        errorMessage = 'Backend server error. Check backend logs and ensure database is connected.';
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error: any) {
    // Network errors (CORS, connection refused, etc.)
    if (error.name === 'TypeError' || error.message.includes('fetch')) {
      throw new Error(
        `Cannot connect to backend server at ${API_BASE_URL}. ` +
        `Please ensure:\n` +
        `1. Backend server is running (npm run dev in backend folder)\n` +
        `2. Backend is accessible on port 3001\n` +
        `3. CORS is properly configured\n` +
        `Original error: ${error.message}`
      );
    }
    throw error;
  }
}

export async function getChatHistory(conversationId: string): Promise<ChatMessage[]> {
  const response = await fetch(`${API_BASE_URL}/chat/history/${conversationId}`);

  if (!response.ok) {
    throw new Error('Failed to load chat history');
  }

  const data = await response.json();
  return data.messages.map((msg: any) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
  }));
}

export async function getProducts(filters: Record<string, string | number | undefined> = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/products${params.toString() ? `?${params}` : ''}`);
  if (!response.ok) {
    throw new Error('Failed to load products');
  }

  const data = await response.json();
  return data.products;
}

export async function addCartItem(
  productId: string,
  quantity: number = 1,
  size?: string,
  cartId?: string
): Promise<Cart> {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: productId,
      quantity,
      size,
      cart_id: cartId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to add product to cart');
  }

  const data = await response.json();
  return data.cart;
}

export async function checkoutCart(
  cartId: string,
  customerEmail?: string
): Promise<{ id: string; status: string; total_amount: number }> {
  const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cart_id: cartId,
      customer_email: customerEmail || undefined,
      shipping_address: {
        city: 'Bengaluru',
        country: 'India',
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Checkout failed' }));
    throw new Error(error.error || 'Checkout failed');
  }

  const data = await response.json();
  return data.order;
}
