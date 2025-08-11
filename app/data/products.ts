import { Product } from '../types/product';

export const sampleProducts: Product[] = [
  {
    id: 'sun-1',
    name: 'Gafas de Sol Classic Ray',
    description: 'Gafas de sol clásicas con protección UV400 y lentes polarizadas. Perfectas para cualquier ocasión.',
    price: 89.99,
    originalPrice: 120.00,
    images: [
      '/images/products/sunglasses-classic-1.jpg',
      '/images/products/sunglasses-classic-2.jpg',
      '/images/products/sunglasses-classic-3.jpg'
    ],
    category: 'sunglasses',
    brand: 'Ray-Ban',
    inStock: true,
    features: [
      'Protección UV400',
      'Lentes polarizadas',
      'Montura ligera',
      'Diseño clásico atemporal',
      'Resistente a rayones'
    ],
    specifications: {
      'Material de la montura': 'Acetato',
      'Material de las lentes': 'Cristal polarizado',
      'Protección UV': 'UV400',
      'Ancho de las lentes': '54mm',
      'Puente': '18mm',
      'Longitud de las patillas': '145mm',
      'Peso': '45g'
    }
  },
  {
    id: 'sun-2',
    name: 'Gafas de Sol Deportivas Pro',
    description: 'Diseñadas para deportistas, con ajuste seguro y máxima protección. Ideales para actividades al aire libre.',
    price: 129.99,
    images: [
      '/images/products/sunglasses-sport-1.jpg',
      '/images/products/sunglasses-sport-2.jpg'
    ],
    category: 'sunglasses',
    brand: 'Oakley',
    inStock: true,
    features: [
      'Ajuste deportivo seguro',
      'Lentes antirreflejos',
      'Resistente al sudor',
      'Diseño aerodinámico',
      'Protección lateral'
    ],
    specifications: {
      'Material de la montura': 'TR90',
      'Material de las lentes': 'Policarbonato',
      'Protección UV': 'UV400',
      'Ancho de las lentes': '62mm',
      'Puente': '15mm',
      'Longitud de las patillas': '135mm',
      'Peso': '28g'
    }
  },
  {
    id: 'sun-3',
    name: 'Gafas de Sol Vintage Round',
    description: 'Estilo vintage con montura redonda y acabado dorado. Para los amantes del estilo retro.',
    price: 75.99,
    originalPrice: 95.00,
    images: [
      '/images/products/sunglasses-vintage-1.jpg',
      '/images/products/sunglasses-vintage-2.jpg'
    ],
    category: 'sunglasses',
    brand: 'Persol',
    inStock: true,
    features: [
      'Diseño vintage auténtico',
      'Montura redonda',
      'Acabado dorado',
      'Lentes degradadas',
      'Estilo unisex'
    ],
    specifications: {
      'Material de la montura': 'Metal',
      'Material de las lentes': 'Cristal',
      'Protección UV': 'UV400',
      'Ancho de las lentes': '50mm',
      'Puente': '20mm',
      'Longitud de las patillas': '140mm',
      'Peso': '52g'
    }
  },
  {
    id: 'sun-4',
    name: 'Gafas de Sol Aviator Premium',
    description: 'El clásico aviador en versión premium con cristales de alta calidad y montura de titanio.',
    price: 199.99,
    images: [
      '/images/products/sunglasses-aviator-1.jpg',
      '/images/products/sunglasses-aviator-2.jpg',
      '/images/products/sunglasses-aviator-3.jpg'
    ],
    category: 'sunglasses',
    brand: 'Maui Jim',
    inStock: false,
    features: [
      'Montura de titanio',
      'Cristales premium',
      'Diseño aviador clásico',
      'Tecnología antirreflejos',
      'Resistente a la corrosión'
    ],
    specifications: {
      'Material de la montura': 'Titanio',
      'Material de las lentes': 'Cristal polarizado',
      'Protección UV': 'UV400',
      'Ancho de las lentes': '58mm',
      'Puente': '14mm',
      'Longitud de las patillas': '140mm',
      'Peso': '35g'
    }
  }
];

// Helper function to get a product by ID
export const getProductById = (id: string): Product | undefined => {
  return sampleProducts.find(product => product.id === id);
};

// Helper function to get products by category
export const getProductsByCategory = (category: Product['category']): Product[] => {
  return sampleProducts.filter(product => product.category === category);
};