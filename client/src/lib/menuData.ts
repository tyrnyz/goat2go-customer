import { fetchProducts, fetchAddons } from './menuService'
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
  variants?: Variant[];
  isBestSeller?: boolean;
}

export interface Variant {
  id: string;
  name: string;
  price?: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon?: string;
}

/** Common add-ons available for main dishes (meat, fish, vegetables) */
const commonAddOns: AddOn[] = [
  { id: "addon-rice", name: "Extra Rice", price: 30 },
  { id: "addon-half-rice", name: "Half Rice", price: 20 },
  { id: "addon-egg", name: "Fried Egg", price: 25 },
  { id: "addon-extra-sauce", name: "Extra Sauce", price: 15 },
  { id: "addon-extra-veggies", name: "Extra Vegetables", price: 30 },
];

// Local image map: productName → local image path
const LOCAL_IMAGE_MAP: Record<string, string> = {
  "Kare-Kare": "/meat_images/kare_kare.jpg",
  "Pork Shanghai": "/meat_images/pork_shanghai.jpg",
  "Bagis na Kalabaw": "/meat_images/bagis_kalabaw.jpg",
  "Asadong Manok": "/meat_images/asadong_manok.jpg",
  "Beef with Malunggay": "/meat_images/beef_with_malunggay.jpg",
  "Crispy Pork Sisig": "/meat_images/crispy_pork_sisig.jpg",
  "Kalderetang Kambing": "/meat_images/kalderetang_kambing.jpg",
  "Kampukan": "/meat_images/kampukan.png",
  "Kilayin Kapampangan": "/meat_images/kilayin_kapampangan.jpg",
  "Lechon Kawali": "/meat_images/lechon_kawali.jpg",
  "Nilagang Baka": "/meat_images/nilagang_baka.jpg",
  "Papaitan Kambing": "/meat_images/papaitan_kambing.jpg",
  "Pork Dinuguan": "/meat_images/pork_dinuguan.jpg",
  "Spare Ribs Bulanglang": "/meat_images/spare_ribs_bulanglang.jpg",
  "Spicy Goat Adobo": "/meat_images/spicy_goat_adobo.jpg",
  "Tinolang Manok": "/meat_images/tinolang_manok.jpg",
  "Tokwa't Baboy": "/meat_images/tokwa_t_baboy.jpg",
  "Buro with Veggies": "/veggies_images/buro_with_veggies.jpg",
  "Chopseuy": "/veggies_images/chopseuy.jpg",
  "Ensalada": "/veggies_images/ensalada.jpg",
  "Ginataang Sitaw at Kalabasa": "/veggies_images/ginataang_sitaw_at_kalabasa.jpg",
  "Ginisang Upo": "/veggies_images/ginisang_upo.jpg",
  "Lagat Ampalaya": "/veggies_images/lagat_ampalaya.jpg",
  "Munggo": "/veggies_images/munggo.jpg",
  "Pinakbet": "/veggies_images/pinakbet.jpg",
  "Sayote Tops": "/veggies_images/sayote_tops.jpg",
  "Sisig Puso ng Saging": "/veggies_images/sisig_puso_ng_saging.jpg",
  "Adobong Pusit": "/fish_images/adobong_pusit.jpg",
  "Daing na Bangus": "/fish_images/daing_na_bangus.jpg",
  "Sarsiadong Tilapia": "/fish_images/sarsiadong_tilapia.jpg",
  "Sinigang na Bangus": "/fish_images/sinigang_na_bangus.jpg",
  "Sinigang na Pampano": "/fish_images/sinigang_na_pampano.jpg",
  "Steamed Pampano": "/fish_images/steamed_pampano.jpg",
  "Inihaw na Hito": "/fish_images/hito.jpg",
  "Fried Tilapia": "/fish_images/fried_tilapia.png",
  "Rice": "/other_images/rice.png",
  "Half-Rice": "/other_images/rice.png",
  "Alamang in Jar": "/others_images/alamang_in_jar.jpg",
  "Spicy Alamang Jar": "/others_images/spicy_alamang_jar.jpg",
  "Buro in Jar": "/others_images/buro_in_jar.jpg",
  "Leche Flan": "/dessert_images/leche_flan.png",
  "Turon": "/dessert_images/turon.png",
  "Canned Soda": "/drinks_images/soda.png",
  "Bottled Water": "/drinks_images/water.jpg",
  "Mountain Dew": "/drinks_images/mt_dew.jpg",
};

const DESCRIPTION_MAP: Record<string, string> = {
  "Kare-Kare": "Delicious Kare-Kare served hot and fresh.",
  "Pork Shanghai": "Delicious Pork Shanghai served hot and fresh.",
  "Bagis na Kalabaw": "Delicious Bagis na Kalabaw served hot and fresh.",
  "Asadong Manok": "Delicious Asadong Manok served hot and fresh.",
  "Beef with Malunggay": "Delicious Beef with Malunggay served hot and fresh.",
  "Crispy Pork Sisig": "Delicious Crispy Pork Sisig served hot and fresh.",
  "Kalderetang Kambing": "Delicious Kalderetang Kambing served hot and fresh.",
  "Kampukan": "Goat meat stew with liver and other offal, cooked in a rich broth.",
  "Kilayin Kapampangan": "Delicious Kilayin Kapampangan served hot and fresh.",
  "Lechon Kawali": "Delicious Lechon Kawali served hot and fresh.",
  "Nilagang Baka": "Delicious Nilagang Baka served hot and fresh.",
  "Papaitan Kambing": "Delicious Papaitan Kambing served hot and fresh.",
  "Pork Dinuguan": "Delicious Pork Dinuguan served hot and fresh.",
  "Spare Ribs Bulanglang": "Delicious Spare Ribs Bulanglang served hot and fresh.",
  "Spicy Goat Adobo": "Delicious Spicy Goat Adobo served hot and fresh.",
  "Tinolang Manok": "Delicious Tinolang Manok served hot and fresh.",
  "Tokwa't Baboy": "Delicious Tokwa't Baboy served hot and fresh.",
  "Buro with Veggies": "Delicious Buro with Veggies served hot and fresh.",
  "Chopseuy": "Delicious Chopseuy served hot and fresh.",
  "Ensalada": "Delicious Ensalada served hot and fresh.",
  "Ginataang Sitaw at Kalabasa": "Delicious Ginataang Sitaw at Kalabasa served hot and fresh.",
  "Ginisang Upo": "Delicious Ginisang Upo served hot and fresh.",
  "Lagat Ampalaya": "Delicious Lagat Ampalaya served hot and fresh.",
  "Munggo": "Delicious Munggo served hot and fresh.",
  "Pinakbet": "Delicious Pinakbet served hot and fresh.",
  "Sayote Tops": "Delicious Sayote Tops served hot and fresh.",
  "Sisig Puso ng Saging": "Delicious Sisig Puso ng Saging served hot and fresh.",
  "Adobong Pusit": "Delicious Adobong Pusit served hot and fresh.",
  "Daing na Bangus": "Delicious Daing na Bangus served hot and fresh.",
  "Sarsiadong Tilapia": "Delicious Sarsiadong Tilapia served hot and fresh.",
  "Sinigang na Bangus": "Delicious Sinigang na Bangus served hot and fresh.",
  "Sinigang na Pampano": "Delicious Sinigang na Pampano served hot and fresh.",
  "Steamed Pampano": "Delicious Steamed Pampano served hot and fresh.",
  "Inihaw na Hito": "Delicious Inihaw na Hito served hot and fresh.",
  "Fried Tilapia": "Delicious Fried Tilapia served hot and fresh.",
  "Rice": "Steamed white rice.",
  "Half-Rice": "Half serving of steamed white rice.",
  "Alamang in Jar": "Delicious Alamang in Jar.",
  "Spicy Alamang Jar": "Spicy Alamang in a jar.",
  "Buro in Jar": "Delicious Buro in Jar.",
  "Leche Flan": "Creamy custard tart with caramel topping. Sweet and decadent.",
  "Turon": "Crispy banana roll with caramel.",
  "Canned Soda": "Ice cold canned sodas.",
  "Bottled Water": "Refreshing bottled mineral water.",
  "Mountain Dew": "Refreshing Mountain Dew.",
};

const BEST_SELLERS = new Set([
  "Kare-Kare",
  "Kalderetang Kambing",
  "Kampukan",
  "Lechon Kawali",
  "Crispy Pork Sisig",
  "Papaitan Kambing",
  "Adobong Pusit",
  "Sinigang na Pampano",
  "Inihaw na Hito",
  "Ginataang Sitaw at Kalabasa",
]);

// Products that are desserts regardless of their DB type
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

export function mapDbProductToMenuItem(product: DbProduct, addons: DbAddon[]): MenuItem {
  const category = DESSERT_NAMES.has(product.productName)
    ? 'dessert'
    : mapDbTypeToCategory(product.type);

  const hasAddOns = ['meat', 'fish', 'vegetables'].includes(category);

  // Prefer Supabase Storage image, fall back to local image
  const supabaseImageUrl = product.image_path
    ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image_path}`
    : null;

  return {
    id: String(product.productID),
    name: product.productName,
    category,
    price: product.price,
    description: product.description ?? DESCRIPTION_MAP[product.productName] ?? `Delicious ${product.productName} served hot and fresh.`,
    image: supabaseImageUrl ?? LOCAL_IMAGE_MAP[product.productName] ?? '/other_images/tatuns_logo.png',
    addOns: hasAddOns
      ? addons.map(a => ({ id: a.id, name: a.name, price: a.price }))
      : undefined,
    isBestSeller: product.is_best_seller ?? BEST_SELLERS.has(product.productName),
  };
}

export async function loadMenuFromSupabase(): Promise<MenuItem[]> {
  const [products, addons] = await Promise.all([fetchProducts(), fetchAddons()]);
  return products.map(p => mapDbProductToMenuItem(p, addons));
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

export const fallbackMenuItems: MenuItem[] = [
  // MEAT CATEGORY
  {
    id: "18",
    name: "Kare-Kare",
    category: "meat",
    price: 220.00,
    description: "Delicious Kare-Kare served hot and fresh.",
    image: "/meat_images/kare_kare.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "21",
    name: "Pork Shanghai",
    category: "meat",
    price: 189.00,
    description: "Delicious Pork Shanghai served hot and fresh.",
    image: "/meat_images/pork_shanghai.jpg",
    addOns: commonAddOns,
  },
  {
    id: "22",
    name: "Bagis na Kalabaw",
    category: "meat",
    price: 189.00,
    description: "Delicious Bagis na Kalabaw served hot and fresh.",
    image: "/meat_images/bagis_kalabaw.jpg",
    addOns: commonAddOns,
  },
  {
    id: "15",
    name: "Asadong Manok",
    category: "meat",
    price: 220.00,
    description: "Delicious Asadong Manok served hot and fresh.",
    image: "/meat_images/asadong_manok.jpg",
    addOns: commonAddOns,
  },
  {
    id: "23",
    name: "Beef with Malunggay",
    category: "meat",
    price: 220.00,
    description: "Delicious Beef with Malunggay served hot and fresh.",
    image: "/meat_images/beef_with_malunggay.jpg",
    addOns: commonAddOns,
  },
  {
    id: "24",
    name: "Crispy Pork Sisig",
    category: "meat",
    price: 189.00,
    description: "Delicious Crispy Pork Sisig served hot and fresh.",
    image: "/meat_images/crispy_pork_sisig.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "25",
    name: "Kalderetang Kambing",
    category: "meat",
    price: 185.00,
    description: "Delicious Kalderetang Kambing served hot and fresh.",
    image: "/meat_images/kalderetang_kambing.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "item-7b",
    name: "Kampukan",
    category: "meat",
    price: 195.00,
    description: "Goat meat stew with liver and other offal, cooked in a rich broth.",
    image: "/meat_images/kampukan.png",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "26",
    name: "Kilayin Kapampangan",
    category: "meat",
    price: 189.00,
    description: "Delicious Kilayin Kapampangan served hot and fresh.",
    image: "/meat_images/kilayin_kapampangan.jpg",
    addOns: commonAddOns,
  },
  {
    id: "27",
    name: "Lechon Kawali",
    category: "meat",
    price: 189.00,
    description: "Delicious Lechon Kawali served hot and fresh.",
    image: "/meat_images/lechon_kawali.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "28",
    name: "Nilagang Baka",
    category: "meat",
    price: 220.00,
    description: "Delicious Nilagang Baka served hot and fresh.",
    image: "/meat_images/nilagang_baka.jpg",
    addOns: commonAddOns,
  },
  {
    id: "29",
    name: "Papaitan Kambing",
    category: "meat",
    price: 185.00,
    description: "Delicious Papaitan Kambing served hot and fresh.",
    image: "/meat_images/papaitan_kambing.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "30",
    name: "Pork Dinuguan",
    category: "meat",
    price: 220.00,
    description: "Delicious Pork Dinuguan served hot and fresh.",
    image: "/meat_images/pork_dinuguan.jpg",
    addOns: commonAddOns,
  },
  {
    id: "31",
    name: "Spare Ribs Bulanglang",
    category: "meat",
    price: 220.00,
    description: "Delicious Spare Ribs Bulanglang served hot and fresh.",
    image: "/meat_images/spare_ribs_bulanglang.jpg",
    addOns: commonAddOns,
  },
  {
    id: "32",
    name: "Spicy Goat Adobo",
    category: "meat",
    price: 185.00,
    description: "Delicious Spicy Goat Adobo served hot and fresh.",
    image: "/meat_images/spicy_goat_adobo.jpg",
    addOns: commonAddOns,
  },
  {
    id: "33",
    name: "Tinolang Manok",
    category: "meat",
    price: 220.00,
    description: "Delicious Tinolang Manok served hot and fresh.",
    image: "/meat_images/tinolang_manok.jpg",
    addOns: commonAddOns,
  },
  {
    id: "34",
    name: "Tokwa't Baboy",
    category: "meat",
    price: 189.00,
    description: "Delicious Tokwa't Baboy served hot and fresh.",
    image: "/meat_images/tokwa_t_baboy.jpg",
    addOns: commonAddOns,
  },

  // VEGETABLES CATEGORY
  {
    id: "14",
    name: "Buro with Veggies",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Buro with Veggies served hot and fresh.",
    image: "/veggies_images/buro_with_veggies.jpg",
    addOns: commonAddOns,
  },
  {
    id: "13",
    name: "Chopseuy",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Chopseuy served hot and fresh.",
    image: "/veggies_images/chopseuy.jpg",
    addOns: commonAddOns,
  },
  {
    id: "12",
    name: "Ensalada",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Ensalada served hot and fresh.",
    image: "/veggies_images/ensalada.jpg",
    addOns: commonAddOns,
  },
  {
    id: "11",
    name: "Ginataang Sitaw at Kalabasa",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Ginataang Sitaw at Kalabasa served hot and fresh.",
    image: "/veggies_images/ginataang_sitaw_at_kalabasa.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "10",
    name: "Ginisang Upo",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Ginisang Upo served hot and fresh.",
    image: "/veggies_images/ginisang_upo.jpg",
    addOns: commonAddOns,
  },
  {
    id: "9",
    name: "Lagat Ampalaya",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Lagat Ampalaya served hot and fresh.",
    image: "/veggies_images/lagat_ampalaya.jpg",
    addOns: commonAddOns,
  },
  {
    id: "8",
    name: "Munggo",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Munggo served hot and fresh.",
    image: "/veggies_images/munggo.jpg",
    addOns: commonAddOns,
  },
  {
    id: "7",
    name: "Pinakbet",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Pinakbet served hot and fresh.",
    image: "/veggies_images/pinakbet.jpg",
    addOns: commonAddOns,
  },
  {
    id: "6",
    name: "Sayote Tops",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Sayote Tops served hot and fresh.",
    image: "/veggies_images/sayote_tops.jpg",
    addOns: commonAddOns,
  },
  {
    id: "5",
    name: "Sisig Puso ng Saging",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Sisig Puso ng Saging served hot and fresh.",
    image: "/veggies_images/sisig_puso_ng_saging.jpg",
    addOns: commonAddOns,
  },

  // FISH CATEGORY
  {
    id: "35",
    name: "Adobong Pusit",
    category: "fish",
    price: 220.00,
    description: "Delicious Adobong Pusit served hot and fresh.",
    image: "/fish_images/adobong_pusit.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "36",
    name: "Daing na Bangus",
    category: "fish",
    price: 199.00,
    description: "Delicious Daing na Bangus served hot and fresh.",
    image: "/fish_images/daing_na_bangus.jpg",
    addOns: commonAddOns,
  },
  {
    id: "37",
    name: "Sarsiadong Tilapia",
    category: "fish",
    price: 189.00,
    description: "Delicious Sarsiadong Tilapia served hot and fresh.",
    image: "/fish_images/sarsiadong_tilapia.jpg",
    addOns: commonAddOns,
  },
  {
    id: "38",
    name: "Sinigang na Bangus",
    category: "fish",
    price: 220.00,
    description: "Delicious Sinigang na Bangus served hot and fresh.",
    image: "/fish_images/sinigang_na_bangus.jpg",
    addOns: commonAddOns,
  },
  {
    id: "39",
    name: "Sinigang na Pampano",
    category: "fish",
    price: 299.00,
    description: "Delicious Sinigang na Pampano served hot and fresh.",
    image: "/fish_images/sinigang_na_pampano.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "40",
    name: "Steamed Pampano",
    category: "fish",
    price: 220.00,
    description: "Delicious Steamed Pampano served hot and fresh.",
    image: "/fish_images/steamed_pampano.jpg",
    addOns: commonAddOns,
  },
  {
    id: "41",
    name: "Inihaw na Hito",
    category: "fish",
    price: 189.00,
    description: "Delicious Inihaw na Hito served hot and fresh.",
    image: "/fish_images/hito.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "42",
    name: "Fried Tilapia",
    category: "fish",
    price: 189.00,
    description: "Delicious Fried Tilapia served hot and fresh.",
    image: "/fish_images/fried_tilapia.png",
    addOns: commonAddOns,
  },

  // ADDONS CATEGORY
  {
    id: "43",
    name: "Rice",
    category: "addons",
    price: 30.00,
    description: "Steamed white rice.",
    image: "/other_images/rice.png",
  },
  {
    id: "45",
    name: "Half-Rice",
    category: "addons",
    price: 20.00,
    description: "Half serving of steamed white rice.",
    image: "/other_images/rice.png",
  },
  {
    id: "46",
    name: "Alamang in Jar",
    category: "addons",
    price: 160.00,
    description: "Delicious Alamang in Jar.",
    image: "/others_images/alamang_in_jar.jpg",
  },
  {
    id: "47",
    name: "Spicy Alamang Jar",
    category: "addons",
    price: 160.00,
    description: "Spicy Alamang in a jar.",
    image: "/others_images/spicy_alamang_jar.jpg",
  },
  {
    id: "48",
    name: "Buro in Jar",
    category: "addons",
    price: 160.00,
    description: "Delicious Buro in Jar.",
    image: "/others_images/buro_in_jar.jpg",
  },

  // DESSERT CATEGORY
  {
    id: "49",
    name: "Leche Flan",
    category: "dessert",
    price: 220.00,
    description: "Creamy custard tart with caramel topping. Sweet and decadent.",
    image: "/dessert_images/leche_flan.png",
  },
  {
    id: "50",
    name: "Turon",
    category: "dessert",
    price: 25.00,
    description: "Crispy banana roll with caramel.",
    image: "/dessert_images/turon.png",
  },

  // DRINKS CATEGORY
  {
    id: "item-42",
    name: "Canned Soda",
    category: "drinks",
    price: 60.00,
    description: "Ice cold canned sodas.",
    image: "/drinks_images/soda.png",
    variants: [
      { id: "soda-coke", name: "Coke" },
      { id: "soda-coke-zero", name: "Coke Zero" },
      { id: "soda-royal", name: "Royal" },
      { id: "soda-sprite", name: "Sprite" },
    ],
  },
  {
    id: "51",
    name: "Bottled Water",
    category: "drinks",
    price: 30.00,
    description: "Refreshing bottled mineral water.",
    image: "/drinks_images/water.jpg",
  },
  {
    id: "item-44",
    name: "Mountain Dew",
    category: "drinks",
    price: 40.00,
    description: "Refreshing Mountain Dew.",
    image: "/drinks_images/mt_dew.jpg",
  },
];

// Alias for backward compatibility
export const menuItems = fallbackMenuItems;

export function getMenuItemsByCategory(categoryId: string): MenuItem[] {
  if (categoryId === "best-sellers") {
    return fallbackMenuItems.filter((item) => item.isBestSeller);
  }
  return fallbackMenuItems.filter((item) => item.category === categoryId);
}

export function searchMenuItems(query: string): MenuItem[] {
  const lowerQuery = query.toLowerCase();
  return fallbackMenuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
  );
}

export function getMenuItemById(id: string): MenuItem | undefined {
  return fallbackMenuItems.find((item) => item.id === id);
}