import type { MetaFunction } from 'react-router';
import { Link } from 'react-router';
import { sampleProducts } from '../data/products';
import { Button } from '../ui/components/button';

export const meta: MetaFunction = () => {
  return [
    { title: 'Gafas de Sol - Óptica Suárez' },
    {
      name: 'description',
      content: 'Descubre nuestra colección de gafas de sol de las mejores marcas. Protección UV, estilos clásicos y modernos.',
    },
  ];
};

export default function Productos() {
  const sunglasses = sampleProducts.filter(product => product.category === 'sunglasses');

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-4">
              Gafas de Sol
            </h1>
            <p className="text-lg text-blue-700">
              Protege tus ojos con estilo. Descubre nuestra selección de gafas de sol de las mejores marcas, 
              con protección UV garantizada y los últimos diseños de moda.
            </p>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sunglasses.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
              >
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 rounded-t-lg relative overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">Imagen del producto</span>
                  </div>
                  {!product.inStock && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Agotado
                    </div>
                  )}
                  {product.originalPrice && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      Oferta
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {product.brand}
                  </p>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg font-bold text-blue-900">
                      €{product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        €{product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    href={`/productos/${product.id}`}
                    variant="primary"
                    size="sm"
                    className="w-full"
                  >
                    Ver Detalles
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              ¿Por qué elegir nuestras gafas de sol?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">🛡️</span>
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Protección UV400</h3>
                <p className="text-blue-700 text-sm">
                  Máxima protección contra los rayos UV dañinos para tus ojos.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">✨</span>
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Calidad Premium</h3>
                <p className="text-blue-700 text-sm">
                  Solo trabajamos con las mejores marcas y materiales de alta calidad.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">🎯</span>
                </div>
                <h3 className="font-semibold text-blue-900 mb-2">Asesoramiento Experto</h3>
                <p className="text-blue-700 text-sm">
                  Nuestros ópticos te ayudan a encontrar las gafas perfectas para ti.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}