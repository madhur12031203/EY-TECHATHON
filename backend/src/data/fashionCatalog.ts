export type CatalogProduct = {
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
  inventory?: {
    location_id: string;
    quantity: number;
    safety_stock: number;
  }[];
};

export const fallbackProducts: CatalogProduct[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    sku: 'FAS-MEN-SHIRT-WHITE-001',
    name: 'Classic White Oxford Shirt',
    description: 'Breathable cotton shirt for office, interviews, and smart casual styling.',
    category: 'fashion',
    brand: 'Buyoh Studio',
    price: 1299,
    image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Men',
      occasion: 'Workwear',
      type: 'Shirts',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White'],
      material: 'Cotton',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 42, safety_stock: 5 }],
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    sku: 'FAS-WOM-DRESS-SILK-002',
    name: 'Elegant Silk Midi Dress',
    description: 'Occasion-ready silk blend dress with a clean drape and refined finish.',
    category: 'fashion',
    brand: 'Aurelia Mode',
    price: 2899,
    image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Women',
      occasion: 'Wedding',
      type: 'Dresses',
      sizes: ['S', 'M', 'L'],
      colors: ['Rose', 'Wine'],
      material: 'Silk blend',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 21, safety_stock: 4 }],
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    sku: 'FAS-MEN-JACKET-DENIM-003',
    name: 'Casual Denim Jacket',
    description: 'Mid-weight denim jacket for layered everyday outfits.',
    category: 'fashion',
    brand: 'Urban Loom',
    price: 2499,
    image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Men',
      occasion: 'Casual',
      type: 'Jackets',
      sizes: ['M', 'L', 'XL'],
      colors: ['Blue'],
      material: 'Denim',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 18, safety_stock: 3 }],
  },
  {
    id: '44444444-4444-4444-8444-444444444444',
    sku: 'FAS-WOM-KURTA-FESTIVE-004',
    name: 'Festive Kurta Set',
    description: 'Printed kurta set with comfortable trousers for family events and festivals.',
    category: 'fashion',
    brand: 'Riwaaz',
    price: 3499,
    image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Women',
      occasion: 'Festive',
      type: 'Ethnic Wear',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Mustard', 'Maroon'],
      material: 'Viscose',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 30, safety_stock: 6 }],
  },
  {
    id: '55555555-5555-4555-8555-555555555555',
    sku: 'FAS-MEN-BLAZER-NAVY-005',
    name: 'Premium Navy Blazer',
    description: 'Structured blazer for meetings, receptions, and polished evening looks.',
    category: 'fashion',
    brand: 'Boardroom',
    price: 4999,
    image_url: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Men',
      occasion: 'Workwear',
      type: 'Blazers',
      sizes: ['M', 'L', 'XL'],
      colors: ['Navy'],
      material: 'Poly-viscose',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 12, safety_stock: 2 }],
  },
  {
    id: '66666666-6666-4666-8666-666666666666',
    sku: 'FAS-WOM-DRESS-FLORAL-006',
    name: 'Summer Floral Dress',
    description: 'Lightweight floral dress for brunches, travel, and weekend plans.',
    category: 'fashion',
    brand: 'Mysa',
    price: 1799,
    image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Women',
      occasion: 'Casual',
      type: 'Dresses',
      sizes: ['S', 'M', 'L'],
      colors: ['Floral'],
      material: 'Rayon',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 33, safety_stock: 5 }],
  },
  {
    id: '77777777-7777-4777-8777-777777777777',
    sku: 'FAS-UNI-TEE-COTTON-007',
    name: 'Soft Cotton T-Shirt',
    description: 'Everyday cotton crew neck t-shirt with a relaxed fit.',
    category: 'fashion',
    brand: 'DailyForm',
    price: 699,
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Unisex',
      occasion: 'Casual',
      type: 'T-Shirts',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Olive'],
      material: 'Cotton',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 80, safety_stock: 10 }],
  },
  {
    id: '88888888-8888-4888-8888-888888888888',
    sku: 'FAS-WOM-SAREE-DESIGNER-008',
    name: 'Designer Occasion Saree',
    description: 'Elegant saree with a soft fall, suitable for weddings and receptions.',
    category: 'fashion',
    brand: 'Riwaaz',
    price: 5999,
    image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Women',
      occasion: 'Wedding',
      type: 'Ethnic Wear',
      sizes: ['One Size'],
      colors: ['Emerald', 'Gold'],
      material: 'Chiffon blend',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 9, safety_stock: 2 }],
  },
  {
    id: '99999999-9999-4999-8999-999999999999',
    sku: 'FAS-KID-DRESS-PARTY-009',
    name: 'Kids Party Dress',
    description: 'Comfortable party dress for celebrations and school events.',
    category: 'fashion',
    brand: 'LittleJoy',
    price: 1299,
    image_url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Kids',
      occasion: 'Festive',
      type: 'Dresses',
      sizes: ['2-3Y', '4-5Y', '6-7Y'],
      colors: ['Pink', 'Lilac'],
      material: 'Cotton blend',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 24, safety_stock: 4 }],
  },
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    sku: 'FAS-MEN-TROUSER-FORMAL-010',
    name: 'Formal Stretch Trousers',
    description: 'Slim formal trousers with stretch for all-day office comfort.',
    category: 'fashion',
    brand: 'Boardroom',
    price: 1899,
    image_url: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Men',
      occasion: 'Workwear',
      type: 'Bottoms',
      sizes: ['30', '32', '34', '36'],
      colors: ['Charcoal', 'Navy'],
      material: 'Cotton stretch',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 38, safety_stock: 5 }],
  },
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    sku: 'FAS-WOM-PALAZZO-CASUAL-011',
    name: 'Casual Palazzo Pants',
    description: 'Easy-fit palazzo pants for everyday ethnic and fusion outfits.',
    category: 'fashion',
    brand: 'Mysa',
    price: 1199,
    image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Women',
      occasion: 'Casual',
      type: 'Bottoms',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Beige', 'Black'],
      material: 'Viscose',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 45, safety_stock: 5 }],
  },
  {
    id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    sku: 'FAS-KID-SHIRT-CASUAL-012',
    name: 'Kids Casual Shirt',
    description: 'Soft printed shirt for play dates, outings, and family weekends.',
    category: 'fashion',
    brand: 'LittleJoy',
    price: 799,
    image_url: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600&h=800&fit=crop',
    attributes: {
      audience: 'Kids',
      occasion: 'Casual',
      type: 'Shirts',
      sizes: ['2-3Y', '4-5Y', '6-7Y', '8-9Y'],
      colors: ['Blue', 'White'],
      material: 'Cotton',
    },
    inventory: [{ location_id: 'blr-warehouse', quantity: 52, safety_stock: 8 }],
  },
];
