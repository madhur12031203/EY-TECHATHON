// TypeScript types matching the database schema

export type Category = 'home_living' | 'electronics';
export type Channel = 'chat' | 'voice';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  loyalty_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  category: Category;
  attributes: Record<string, any>;
  price: number;
  brand?: string;
  image_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProductInventory {
  id: string;
  product_id: string;
  location_id: string;
  quantity: number;
  safety_stock: number;
  updated_at: Date;
}

export interface Cart {
  id: string;
  user_id?: string;
  status: 'active' | 'abandoned' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: Date;
}

export interface Order {
  id: string;
  user_id: string;
  cart_id?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  total_amount: number;
  payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  loyalty_points_applied: number;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: Date;
}

export interface LoyaltyAccount {
  id: string;
  user_id: string;
  points_balance: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  created_at: Date;
  updated_at: Date;
}

export interface LoyaltyTransaction {
  id: string;
  loyalty_account_id: string;
  points_delta: number;
  reason?: string;
  order_id?: string;
  created_at: Date;
}

export interface Offer {
  id: string;
  name: string;
  category_filter?: Category;
  min_cart_value: number;
  discount_type: 'percentage' | 'fixed' | 'points';
  discount_value: number;
  start_at: Date;
  end_at: Date;
  is_active: boolean;
  created_at: Date;
}

export interface OrderFulfillment {
  id: string;
  order_id: string;
  tracking_number?: string;
  carrier?: string;
  status: 'pending' | 'picked' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed';
  eta?: Date;
  address: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Conversation {
  id: string;
  user_id?: string;
  channel: Channel;
  session_id?: string;
  started_at: Date;
  last_message_at: Date;
  metadata: Record<string, any>;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  meta: Record<string, any>;
  created_at: Date;
}

