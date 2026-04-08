import { fetchProducts, fetchAddons, fetchBestSellers } from './menuService'
import type { DbProduct, DbAddon } from '@/types/database'

export interface AddOn {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  addOns?: AddOn[];
  isBestSeller?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
}

export const categories: MenuCategory[] = [
  { id: "best-sellers", name: "Best Sellers" },
  { id: "meat", name: "Meat" },
  { id: "fish", name: "Fish" },
  { id: "vegetables", name: "Vegetables" },
  { id: "dessert", name: "Dessert" },
  { id: "drinks", name: "Drinks" },
  { id: "addons", name: "Add-ons" },
];

const PLACEHOLDER_IMAGE = '/other_images/tatuns_logo.png';

// Products classified as dessert regardless of DB type
const DESSERT_NAMES = new Set(["Leche Flan", "Turon"]);

function mapDbTypeToCategory(type: DbProduct['type']): string {
  switch (type) {
    case 'Vegetable': return 'vegetables';
    case 'Meat': return 'meat';
    case 'Fish': return 'fish';
    case 'Others': return 'addons';
    case 'Drinks': return 'drinks';
    default: return 'addons';
  }
}

export function mapDbProductToMenuItem(product: DbProduct, addons: DbAddon[], bestSellerIds?: Set<number>): MenuItem {
  const category = DESSERT_NAMES.has(product.productName)
    ? 'dessert'
    : mapDbTypeToCategory(product.type);

  const hasAddOns = ['meat', 'fish', 'vegetables'].includes(category);

  // Prefer Supabase Storage image when available
  const image = product.image_path
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image_path}`
    : PLACEHOLDER_IMAGE;

  return {
    id: String(product.productID),
    name: product.productName,
    category,
    price: product.price,
    description: product.description ?? `Delicious ${product.productName} served hot and fresh.`,
    image,
    addOns: hasAddOns
      ? addons.map(a => ({ id: a.id, name: a.name, price: a.price }))
      : undefined,
    isBestSeller: bestSellerIds
      ? bestSellerIds.has(product.productID)
      : (product.is_best_seller ?? false),
  };
}

export async function loadMenuFromSupabase(): Promise<MenuItem[]> {
  const [products, addons, bestSellers] = await Promise.all([
    fetchProducts(),
    fetchAddons(),
    fetchBestSellers(3).catch(() => null),
  ]);

  const bestSellerIds = bestSellers
    ? new Set(bestSellers.map(p => p.productID))
    : undefined;

  return products.map(p => mapDbProductToMenuItem(p, addons, bestSellerIds));
}
