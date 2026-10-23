// ZEMON STORE - Donnees produits
// Pochettes en USD ($) | Autres accessoires en FC

const IPHONE_MODELS = [
  "iPhone 11",
  "iPhone 11 Pro",
  "iPhone 11 Pro Max",
  "iPhone 12",
  "iPhone 12 Mini",
  "iPhone 12 Pro",
  "iPhone 12 Pro Max",
  "iPhone 13",
  "iPhone 13 Mini",
  "iPhone 13 Pro",
  "iPhone 13 Pro Max",
  "iPhone 14",
  "iPhone 14 Plus",
  "iPhone 14 Pro",
  "iPhone 14 Pro Max",
  "iPhone 15",
  "iPhone 15 Plus",
  "iPhone 15 Pro",
  "iPhone 15 Pro Max",
  "iPhone 16",
  "iPhone 16 Plus",
  "iPhone 16 Pro",
  "iPhone 16 Pro Max",
  "iPhone 17",
  "iPhone 17 Air",
  "iPhone 17 Pro",
  "iPhone 17 Pro Max",
  "iPhone 18",
  "iPhone 18 Pro",
  "iPhone 18 Pro Max"
];

const CATEGORIES = [
  { id: "pochettes", name: "Pochettes", type: "usd", image: "assets/images/placeholder-pochette.svg" },
  { id: "verres", name: "Verres de protection", type: "fc", image: "assets/images/placeholder-verre.svg" },
  { id: "chargeurs", name: "Chargeurs", type: "fc", image: "assets/images/placeholder-charger.svg" },
  { id: "ecouteurs", name: "Ecouteurs", type: "fc", image: "assets/images/placeholder-earphone.svg" }
];

const PRODUCTS = [
  // POCHETTES - USD
  {
    id: "pochette-classic",
    name: "Pochette iPhone Classic",
    category: "pochettes",
    currency: "usd",
    price: 0,
    priceToConfirm: true,
    images: ["assets/images/placeholder-pochette.svg"],
    description: "Pochette fine et résistante, finition soignée.",
    hasModelVariant: true,
    variants: [],
    stock: "available",
    featured: true,
    isNew: true,
    best: true
  },
  {
    id: "pochette-silicone-matte",
    name: "Pochette Silicone Matte",
    category: "pochettes",
    currency: "usd",
    price: 0,
    priceToConfirm: true,
    images: ["assets/images/placeholder-pochette.svg"],
    description: "Finition mate antidérapante, protection au quotidien.",
    hasModelVariant: true,
    variants: [],
    stock: "available",
    featured: true,
    isNew: true,
    best: false
  },
  {
    id: "pochette-renforcee",
    name: "Pochette Renforcée",
    category: "pochettes",
    currency: "usd",
    price: 0,
    priceToConfirm: true,
    images: ["assets/images/placeholder-pochette.svg"],
    description: "Renforts aux coins pour une meilleure protection.",
    hasModelVariant: true,
    variants: [],
    stock: "available",
    featured: false,
    isNew: false,
    best: true
  },

  // VERRES DE PROTECTION - FC
  {
    id: "verre-fume",
    name: "Verre de protection Fumé",
    category: "verres",
    currency: "fc",
    price: 0,
    priceToConfirm: true,
    images: ["assets/images/placeholder-verre.svg"],
    description: "Verre trempé fumé, anti-rayures et résistant aux chocs.",
    hasModelVariant: true,
    variants: [],
    stock: "available",
    featured: true,
    isNew: false,
    best: true
  },
  {
    id: "verre-transparent",
    name: "Verre de protection Transparent",
    category: "verres",
    currency: "fc",
    price: 0,
    priceToConfirm: true,
    images: ["assets/images/placeholder-verre.svg"],
    description: "Transparence maximale, touche fluide et haute résistance.",
    hasModelVariant: true,
    variants: [],
    stock: "available",
    featured: false,
    isNew: true,
    best: false
  },

  // CHARGEURS - FC
  {
    id: "chargeur-type-c",
    name: "Chargeur Type-C",
    category: "chargeurs",
    currency: "fc",
    price: 0,
    priceToConfirm: true,
    images: ["assets/images/placeholder-charger.svg"],
    description: "Chargeur complet Type-C, charge rapide et stable.",
    hasModelVariant: false,
    variants: [{ id: "std", label: "Type-C", price: 0 }],
    stock: "available",
    featured: true,
    isNew: false,
    best: true
  },
  {
    id: "chargeur-iphone-normal",
    name: "Chargeur iPhone Normal",
    category: "chargeurs",
    currency: "fc",
    price: 0,
    priceToConfirm: true,
    images: ["assets/images/placeholder-charger.svg"],
    description: "Chargeur complet pour iPhone classique.",
    hasModelVariant: false,
    variants: [{ id: "std", label: "iPhone Normal", price: 0 }],
    stock: "available",
    featured: false,
    isNew: true,
    best: false
  },

  // ECOUTEURS - FC
  {
    id: "ecouteurs",
    name: "Ecouteurs d'appel",
    category: "ecouteurs",
    currency: "fc",
    price: 0,
    priceToConfirm: true,
    images: ["assets/images/placeholder-earphone.svg"],
    description: "Son clair et pratique pour les appels et l'usage quotidien.",
    hasModelVariant: false,
    variants: [{ id: "std", label: "Standard", price: 0 }],
    stock: "available",
    featured: true,
    isNew: false,
    best: false
  }
];

const STORE_INFO = {
  name: "ZEMON STORE",
  whatsapp: "243818395949",
  mpesa: "243818395949",
  slogan: "Accessoires iPhone",
  deliveryFee: 5000,
  deliveryZone: "Kinshasa",
  hours: "24h/24, 7j/7",
  payments: ["M-Pesa (Mobile Money)", "Espèces à la livraison"]
};
