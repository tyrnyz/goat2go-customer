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

export const categories: MenuCategory[] = [
  { id: "best-sellers", name: "Best Sellers" },
  { id: "meat", name: "Meat" },
  { id: "fish", name: "Fish" },
  { id: "vegetables", name: "Vegetables" },
  { id: "dessert", name: "Dessert" },
  { id: "drinks", name: "Drinks" },
  { id: "addons", name: "Add-ons" },
];

export const menuItems: MenuItem[] = [
  // MEAT CATEGORY
  {
    id: "item-1",
    name: "Kare-Kare",
    category: "meat",
    price: 220.00,
    description: "Delicious Kare-Kare served hot and fresh.",
    image: "/meat_images/kare_kare.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "item-2",
    name: "Pork Shanghai",
    category: "meat",
    price: 189.00,
    description: "Delicious Pork Shanghai served hot and fresh.",
    image: "/meat_images/pork_shanghai.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-3",
    name: "Bagis na Kalabaw",
    category: "meat",
    price: 189.00,
    description: "Delicious Bagis na Kalabaw served hot and fresh.",
    image: "/meat_images/bagis_kalabaw.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-4",
    name: "Asadong Manok",
    category: "meat",
    price: 220.00,
    description: "Delicious Asadong Manok served hot and fresh.",
    image: "/meat_images/asadong_manok.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-5",
    name: "Beef with Malunggay",
    category: "meat",
    price: 220.00,
    description: "Delicious Beef with Malunggay served hot and fresh.",
    image: "/meat_images/beef_with_malunggay.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-6",
    name: "Crispy Pork Sisig",
    category: "meat",
    price: 189.00,
    description: "Delicious Crispy Pork Sisig served hot and fresh.",
    image: "/meat_images/crispy_pork_sisig.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "item-7",
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
    id: "item-8",
    name: "Kilayin Kapampangan",
    category: "meat",
    price: 189.00,
    description: "Delicious Kilayin Kapampangan served hot and fresh.",
    image: "/meat_images/kilayin_kapampangan.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-9",
    name: "Lechon Kawali",
    category: "meat",
    price: 189.00,
    description: "Delicious Lechon Kawali served hot and fresh.",
    image: "/meat_images/lechon_kawali.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "item-10",
    name: "Nilagang Baka",
    category: "meat",
    price: 220.00,
    description: "Delicious Nilagang Baka served hot and fresh.",
    image: "/meat_images/nilagang_baka.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-11",
    name: "Papaitan Kambing",
    category: "meat",
    price: 185.00,
    description: "Delicious Papaitan Kambing served hot and fresh.",
    image: "/meat_images/papaitan_kambing.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "item-12",
    name: "Pork Dinuguan",
    category: "meat",
    price: 220.00,
    description: "Delicious Pork Dinuguan served hot and fresh.",
    image: "/meat_images/pork_dinuguan.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-13",
    name: "Spare Ribs Bulanglang",
    category: "meat",
    price: 220.00,
    description: "Delicious Spare Ribs Bulanglang served hot and fresh.",
    image: "/meat_images/spare_ribs_bulanglang.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-14",
    name: "Spicy Goat Adobo",
    category: "meat",
    price: 185.00,
    description: "Delicious Spicy Goat Adobo served hot and fresh.",
    image: "/meat_images/spicy_goat_adobo.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-15",
    name: "Tinolang Manok",
    category: "meat",
    price: 220.00,
    description: "Delicious Tinolang Manok served hot and fresh.",
    image: "/meat_images/tinolang_manok.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-16",
    name: "Tokwa't Baboy",
    category: "meat",
    price: 189.00,
    description: "Delicious Tokwa't Baboy served hot and fresh.",
    image: "/meat_images/tokwa_t_baboy.jpg",
    addOns: commonAddOns,
  },

  // VEGETABLES CATEGORY
  {
    id: "item-17",
    name: "Buro with Veggies",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Buro with Veggies served hot and fresh.",
    image: "/veggies_images/buro_with_veggies.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-18",
    name: "Chopseuy",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Chopseuy served hot and fresh.",
    image: "/veggies_images/chopseuy.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-19",
    name: "Ensalada",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Ensalada served hot and fresh.",
    image: "/veggies_images/ensalada.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-20",
    name: "Ginataang Sitaw at Kalabasa",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Ginataang Sitaw at Kalabasa served hot and fresh.",
    image: "/veggies_images/ginataang_sitaw_at_kalabasa.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "item-21",
    name: "Ginisang Upo",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Ginisang Upo served hot and fresh.",
    image: "/veggies_images/ginisang_upo.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-22",
    name: "Lagat Ampalaya",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Lagat Ampalaya served hot and fresh.",
    image: "/veggies_images/lagat_ampalaya.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-23",
    name: "Munggo",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Munggo served hot and fresh.",
    image: "/veggies_images/munggo.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-24",
    name: "Pinakbet",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Pinakbet served hot and fresh.",
    image: "/veggies_images/pinakbet.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-25",
    name: "Sayote Tops",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Sayote Tops served hot and fresh.",
    image: "/veggies_images/sayote_tops.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-26",
    name: "Sisig Puso ng Saging",
    category: "vegetables",
    price: 170.00,
    description: "Delicious Sisig Puso ng Saging served hot and fresh.",
    image: "/veggies_images/sisig_puso_ng_saging.jpg",
    addOns: commonAddOns,
  },

  // FISH CATEGORY
  {
    id: "item-27",
    name: "Adobong Pusit",
    category: "fish",
    price: 220.00,
    description: "Delicious Adobong Pusit served hot and fresh.",
    image: "/fish_images/adobong_pusit.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "item-28",
    name: "Daing na Bangus",
    category: "fish",
    price: 199.00,
    description: "Delicious Daing na Bangus served hot and fresh.",
    image: "/fish_images/daing_na_bangus.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-29",
    name: "Sarsiadong Tilapia",
    category: "fish",
    price: 189.00,
    description: "Delicious Sarsiadong Tilapia served hot and fresh.",
    image: "/fish_images/sarsiadong_tilapia.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-30",
    name: "Sinigang na Bangus",
    category: "fish",
    price: 220.00,
    description: "Delicious Sinigang na Bangus served hot and fresh.",
    image: "/fish_images/sinigang_na_bangus.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-31",
    name: "Sinigang na Pampano",
    category: "fish",
    price: 299.00,
    description: "Delicious Sinigang na Pampano served hot and fresh.",
    image: "/fish_images/sinigang_na_pampano.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "item-32",
    name: "Steamed Pampano",
    category: "fish",
    price: 220.00,
    description: "Delicious Steamed Pampano served hot and fresh.",
    image: "/fish_images/steamed_pampano.jpg",
    addOns: commonAddOns,
  },
  {
    id: "item-33",
    name: "Inihaw na Hito",
    category: "fish",
    price: 189.00,
    description: "Delicious Inihaw na Hito served hot and fresh.",
    image: "/fish_images/hito.jpg",
    isBestSeller: true,
    addOns: commonAddOns,
  },
  {
    id: "item-34",
    name: "Fried Tilapia",
    category: "fish",
    price: 189.00,
    description: "Delicious Fried Tilapia served hot and fresh.",
    image: "/fish_images/fried_tilapia.png",
    addOns: commonAddOns,
  },

  // ADDONS CATEGORY
  {
    id: "item-35",
    name: "Rice",
    category: "addons",
    price: 30.00,
    description: "Steamed white rice.",
    image: "/other_images/rice.png",
  },
  {
    id: "item-36",
    name: "Half-Rice",
    category: "addons",
    price: 20.00,
    description: "Half serving of steamed white rice.",
    image: "/other_images/rice.png",
  },
  {
    id: "item-37",
    name: "Alamang in Jar",
    category: "addons",
    price: 160.00,
    description: "Delicious Alamang in Jar.",
    image: "/others_images/alamang_in_jar.jpg",
  },
  {
    id: "item-38",
    name: "Spicy Alamang Jar",
    category: "addons",
    price: 160.00,
    description: "Spicy Alamang in a jar.",
    image: "/others_images/spicy_alamang_jar.jpg",
  },
  {
    id: "item-39",
    name: "Buro in Jar",
    category: "addons",
    price: 160.00,
    description: "Delicious Buro in Jar.",
    image: "/others_images/buro_in_jar.jpg",
  },

  // DESSERT CATEGORY
  {
    id: "item-40",
    name: "Leche Flan",
    category: "dessert",
    price: 220.00,
    description: "Creamy custard tart with caramel topping. Sweet and decadent.",
    image: "/dessert_images/leche_flan.png",
  },
  {
    id: "item-41",
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
    id: "item-43",
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

export function getMenuItemsByCategory(categoryId: string): MenuItem[] {
  if (categoryId === "best-sellers") {
    return menuItems.filter((item) => item.isBestSeller);
  }
  return menuItems.filter((item) => item.category === categoryId);
}

export function searchMenuItems(query: string): MenuItem[] {
  const lowerQuery = query.toLowerCase();
  return menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery)
  );
}
export function getMenuItemById(id: string): MenuItem | undefined {
  return menuItems.find((item) => item.id === id);
}