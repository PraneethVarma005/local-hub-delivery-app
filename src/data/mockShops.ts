
export interface Shop {
  id: string
  name: string
  category: 'food' | 'grocery' | 'medicine'
  address: string
  lat: number
  lng: number
  rating: number
  deliveryTime: string
  deliveryFee: number
  image: string
  description: string
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface Product {
  id: string
  shopId: string
  name: string
  description: string
  price: number
  image: string
  category: string
  available: boolean
  rating: number
}

// Mock shops with Delhi coordinates
export const mockShops: Shop[] = [
  {
    id: '1',
    name: 'Pizza Corner',
    category: 'food',
    address: 'Connaught Place, New Delhi',
    lat: 28.6315,
    lng: 77.2167,
    rating: 4.5,
    deliveryTime: '20-30 min',
    deliveryFee: 25,
    image: '/placeholder.svg',
    description: 'Authentic Italian pizzas and pasta',
    isOpen: true,
    openTime: '11:00 AM',
    closeTime: '11:00 PM'
  },
  {
    id: '2',
    name: 'Fresh Mart Grocery',
    category: 'grocery',
    address: 'Khan Market, New Delhi',
    lat: 28.6137,
    lng: 77.2267,
    rating: 4.2,
    deliveryTime: '30-45 min',
    deliveryFee: 35,
    image: '/placeholder.svg',
    description: 'Fresh vegetables, fruits and daily essentials',
    isOpen: true,
    openTime: '8:00 AM',
    closeTime: '10:00 PM'
  },
  {
    id: '3',
    name: 'MediCare Pharmacy',
    category: 'medicine',
    address: 'Karol Bagh, New Delhi',
    lat: 28.6519,
    lng: 77.1909,
    rating: 4.7,
    deliveryTime: '15-25 min',
    deliveryFee: 20,
    image: '/placeholder.svg',
    description: '24/7 pharmacy with prescription medicines',
    isOpen: true,
    openTime: '24 hours',
    closeTime: '24 hours'
  },
  {
    id: '4',
    name: 'Burger Junction',
    category: 'food',
    address: 'Lajpat Nagar, New Delhi',
    lat: 28.5677,
    lng: 77.2433,
    rating: 4.3,
    deliveryTime: '25-35 min',
    deliveryFee: 30,
    image: '/placeholder.svg',
    description: 'Gourmet burgers and fries',
    isOpen: true,
    openTime: '12:00 PM',
    closeTime: '12:00 AM'
  },
  {
    id: '5',
    name: 'Spice Bazaar',
    category: 'grocery',
    address: 'Chandni Chowk, New Delhi',
    lat: 28.6506,
    lng: 77.2334,
    rating: 4.0,
    deliveryTime: '40-60 min',
    deliveryFee: 40,
    image: '/placeholder.svg',
    description: 'Traditional spices and Indian groceries',
    isOpen: true,
    openTime: '9:00 AM',
    closeTime: '9:00 PM'
  },
  {
    id: '6',
    name: 'Health Plus Pharmacy',
    category: 'medicine',
    address: 'Greater Kailash, New Delhi',
    lat: 28.5355,
    lng: 77.2420,
    rating: 4.6,
    deliveryTime: '20-30 min',
    deliveryFee: 25,
    image: '/placeholder.svg',
    description: 'Complete healthcare solutions',
    isOpen: true,
    openTime: '8:00 AM',
    closeTime: '10:00 PM'
  }
]

// Mock products for each shop
export const mockProducts: Product[] = [
  // Pizza Corner products
  {
    id: 'p1',
    shopId: '1',
    name: 'Margherita Pizza',
    description: 'Fresh tomato sauce, mozzarella cheese, basil',
    price: 299,
    image: '/placeholder.svg',
    category: 'Pizza',
    available: true,
    rating: 4.5
  },
  {
    id: 'p2',
    shopId: '1',
    name: 'Pepperoni Pizza',
    description: 'Pepperoni, mozzarella cheese, tomato sauce',
    price: 399,
    image: '/placeholder.svg',
    category: 'Pizza',
    available: true,
    rating: 4.7
  },
  {
    id: 'p3',
    shopId: '1',
    name: 'Chicken Alfredo Pasta',
    description: 'Creamy alfredo sauce with grilled chicken',
    price: 349,
    image: '/placeholder.svg',
    category: 'Pasta',
    available: true,
    rating: 4.4
  },

  // Fresh Mart Grocery products
  {
    id: 'p4',
    shopId: '2',
    name: 'Fresh Apples',
    description: 'Red delicious apples - 1kg',
    price: 150,
    image: '/placeholder.svg',
    category: 'Fruits',
    available: true,
    rating: 4.2
  },
  {
    id: 'p5',
    shopId: '2',
    name: 'Basmati Rice',
    description: 'Premium basmati rice - 5kg',
    price: 600,
    image: '/placeholder.svg',
    category: 'Grains',
    available: true,
    rating: 4.5
  },
  {
    id: 'p6',
    shopId: '2',
    name: 'Fresh Milk',
    description: 'Full cream milk - 1 liter',
    price: 60,
    image: '/placeholder.svg',
    category: 'Dairy',
    available: true,
    rating: 4.3
  },

  // MediCare Pharmacy products
  {
    id: 'p7',
    shopId: '3',
    name: 'Paracetamol 500mg',
    description: 'Pain relief tablets - 10 tablets',
    price: 25,
    image: '/placeholder.svg',
    category: 'Medicine',
    available: true,
    rating: 4.8
  },
  {
    id: 'p8',
    shopId: '3',
    name: 'Vitamin C Tablets',
    description: 'Immunity booster - 30 tablets',
    price: 120,
    image: '/placeholder.svg',
    category: 'Supplements',
    available: true,
    rating: 4.6
  },

  // Burger Junction products
  {
    id: 'p9',
    shopId: '4',
    name: 'Classic Cheeseburger',
    description: 'Beef patty with cheese, lettuce, tomato',
    price: 249,
    image: '/placeholder.svg',
    category: 'Burgers',
    available: true,
    rating: 4.4
  },
  {
    id: 'p10',
    shopId: '4',
    name: 'Chicken Burger',
    description: 'Grilled chicken with special sauce',
    price: 229,
    image: '/placeholder.svg',
    category: 'Burgers',
    available: true,
    rating: 4.3
  },

  // More products for other shops...
  {
    id: 'p11',
    shopId: '5',
    name: 'Turmeric Powder',
    description: 'Pure turmeric powder - 100g',
    price: 45,
    image: '/placeholder.svg',
    category: 'Spices',
    available: true,
    rating: 4.5
  },
  {
    id: 'p12',
    shopId: '6',
    name: 'Digital Thermometer',
    description: 'Fast and accurate temperature measurement',
    price: 299,
    image: '/placeholder.svg',
    category: 'Medical Devices',
    available: true,
    rating: 4.7
  }
]

export const getShopsByCategory = (category?: string) => {
  if (!category) return mockShops
  return mockShops.filter(shop => shop.category === category)
}

export const getProductsByShop = (shopId: string) => {
  return mockProducts.filter(product => product.shopId === shopId)
}

export const getShopById = (shopId: string) => {
  return mockShops.find(shop => shop.id === shopId)
}

export const getProductById = (productId: string) => {
  return mockProducts.find(product => product.id === productId)
}
