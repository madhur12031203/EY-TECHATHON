import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/client';
import { logger } from '../config/logger';
import { CatalogProduct, fallbackProducts } from '../data/fashionCatalog';

const router = Router();

type CartItem = {
  product_id: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  size?: string;
};

type GuestCart = {
  id: string;
  items: CartItem[];
  status: 'active' | 'completed';
  created_at: string;
  updated_at: string;
};

const guestCarts = new Map<string, GuestCart>();

const productQuerySchema = z.object({
  q: z.string().optional(),
  audience: z.string().optional(),
  occasion: z.string().optional(),
  type: z.string().optional(),
  max_price: z.coerce.number().optional(),
  limit: z.coerce.number().min(1).max(50).default(24),
});

const addCartItemSchema = z.object({
  cart_id: z.string().optional(),
  product_id: z.string(),
  quantity: z.number().int().min(1).max(10).default(1),
  size: z.string().optional(),
});

const checkoutSchema = z.object({
  cart_id: z.string(),
  user_id: z.string().uuid().optional(),
  customer_email: z.string().email().optional(),
  shipping_address: z.record(z.any()).optional(),
});

function toApiProduct(product: any): CatalogProduct {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description || '',
    category: product.category,
    brand: product.brand || 'Buyoh',
    price: Number(product.price),
    image_url: product.image_url || '',
    attributes: product.attributes || {},
  };
}

function filterProducts(products: CatalogProduct[], query: z.infer<typeof productQuerySchema>) {
  const search = query.q?.toLowerCase();

  return products
    .filter((product) => {
      const attrs = product.attributes;
      const haystack = [
        product.name,
        product.description,
        product.brand,
        attrs.audience,
        attrs.occasion,
        attrs.type,
        ...(attrs.colors || []),
        ...(attrs.sizes || []),
      ].join(' ').toLowerCase();

      return (
        (!search || haystack.includes(search)) &&
        (!query.audience || attrs.audience === query.audience) &&
        (!query.occasion || attrs.occasion === query.occasion) &&
        (!query.type || attrs.type === query.type) &&
        (!query.max_price || product.price <= query.max_price)
      );
    })
    .slice(0, query.limit);
}

async function queryProducts(query: z.infer<typeof productQuerySchema>) {
  try {
    const where: string[] = ["category = 'fashion'"];
    const values: any[] = [];

    if (query.q) {
      values.push(`%${query.q}%`);
      where.push(`(name ILIKE $${values.length} OR description ILIKE $${values.length} OR brand ILIKE $${values.length})`);
    }
    if (query.audience) {
      values.push(query.audience);
      where.push(`attributes->>'audience' = $${values.length}`);
    }
    if (query.occasion) {
      values.push(query.occasion);
      where.push(`attributes->>'occasion' = $${values.length}`);
    }
    if (query.type) {
      values.push(query.type);
      where.push(`attributes->>'type' = $${values.length}`);
    }
    if (query.max_price) {
      values.push(query.max_price);
      where.push(`price <= $${values.length}`);
    }

    values.push(query.limit);
    const result = await pool.query(
      `SELECT id, sku, name, description, category, attributes, price, brand, image_url
       FROM products
       WHERE ${where.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${values.length}`,
      values
    );

    return { products: result.rows.map(toApiProduct), source: 'database' };
  } catch (error) {
    logger.error('Product API database lookup failed, using fallback catalog:', error);
    return { products: filterProducts(fallbackProducts, query), source: 'fallback' };
  }
}

async function getProduct(productId: string): Promise<CatalogProduct | undefined> {
  try {
    const result = await pool.query(
      `SELECT id, sku, name, description, category, attributes, price, brand, image_url
       FROM products
       WHERE id = $1`,
      [productId]
    );
    return result.rows[0] ? toApiProduct(result.rows[0]) : undefined;
  } catch {
    return fallbackProducts.find((product) => product.id === productId);
  }
}

function cartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 1999 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

function createGuestCart() {
  const now = new Date().toISOString();
  const cart: GuestCart = {
    id: uuidv4(),
    items: [],
    status: 'active',
    created_at: now,
    updated_at: now,
  };
  guestCarts.set(cart.id, cart);
  return cart;
}

async function loadCart(cartId?: string): Promise<GuestCart> {
  if (cartId && guestCarts.has(cartId)) {
    return guestCarts.get(cartId)!;
  }

  return createGuestCart();
}

router.get('/products', async (req: Request, res: Response) => {
  const query = productQuerySchema.parse(req.query);
  const result = await queryProducts(query);
  res.json(result);
});

router.get('/products/:id', async (req: Request, res: Response) => {
  const product = await getProduct(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ product });
});

router.post('/cart/items', async (req: Request, res: Response) => {
  const input = addCartItemSchema.parse(req.body);
  const product = await getProduct(input.product_id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const cart = await loadCart(input.cart_id);
  const existing = cart.items.find(
    (item) => item.product_id === product.id && item.size === input.size
  );

  if (existing) {
    existing.quantity += input.quantity;
  } else {
    cart.items.push({
      product_id: product.id,
      sku: product.sku,
      name: product.name,
      price: product.price,
      quantity: input.quantity,
      image_url: product.image_url,
      size: input.size,
    });
  }

  cart.updated_at = new Date().toISOString();

  res.status(201).json({
    cart: {
      ...cart,
      totals: cartTotals(cart.items),
    },
  });
});

router.get('/cart/:cart_id', async (req: Request, res: Response) => {
  const cart = guestCarts.get(req.params.cart_id);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  res.json({ cart: { ...cart, totals: cartTotals(cart.items) } });
});

router.post('/orders/checkout', async (req: Request, res: Response) => {
  const input = checkoutSchema.parse(req.body);
  const cart = guestCarts.get(input.cart_id);

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty or unavailable' });
  }

  const totals = cartTotals(cart.items);
  const orderId = uuidv4();
  cart.status = 'completed';
  cart.updated_at = new Date().toISOString();

  res.status(201).json({
    order: {
      id: orderId,
      cart_id: cart.id,
      status: 'confirmed',
      payment_status: 'pending',
      total_amount: totals.total,
      items: cart.items,
      shipping_address: input.shipping_address || null,
      customer_email: input.customer_email || null,
      created_at: new Date().toISOString(),
      note: 'Demo checkout created. Wire a payment provider before collecting real payments.',
    },
  });
});

export default router;
