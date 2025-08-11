import type { MetaFunction } from 'react-router';
import { useParams } from 'react-router';
import { getProductById } from '../data/products';
import { useCart } from '../context/cart-context';
import { Button } from '../ui/components/button';
import { useState } from 'react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Producto - Óptica Suárez' },
    {
      name: 'description',
      content: 'Descubre nuestros productos de calidad con protección UV garantizada.',
    },
  ];
};

export default function ProductoDetalle() {
  const params = useParams();
  const product = getProductById(params.id as string);
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    if (product) {
      addItem(product);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  if (!product) {
    return (
      <main className="min-h-screen bg-white pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Producto no encontrado
            </h1>
            <p className="text-gray-600 mb-8">
              El producto que buscas no existe o ha sido eliminado.
            </p>
            <Button href="/productos" variant="primary">
              Ver Productos
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Button href="/" variant="secondary" size="sm" unstyled className="text-blue-600 hover:text-blue-800">
                Inicio
              </Button>
            </li>
            <li>/</li>
            <li>
              <Button href="/productos" variant="secondary" size="sm" unstyled className="text-blue-600 hover:text-blue-800">
                Productos
              </Button>
            </li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full opacity-20"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-blue-600 font-medium">Imagen principal del producto</span>
              </div>
              {!product.inStock && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-2 rounded font-medium">
                  Agotado
                </div>
              )}
              {product.originalPrice && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-2 rounded font-medium">
                  Oferta
                </div>
              )}
            </div>
            
            {/* Thumbnail images */}
            <div className="grid grid-cols-3 gap-2">
              {product.images.slice(0, 3).map((_, index) => (
                <div key={index} className="aspect-square bg-gray-100 rounded border-2 border-transparent hover:border-blue-500 cursor-pointer">
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-gray-400 text-xs">Vista {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-blue-600 text-sm font-medium mb-2">{product.brand}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Price */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl font-bold text-blue-900">
                  €{product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      €{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      Ahorra €{(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Características</h2>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specifications */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Especificaciones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="border border-gray-200 rounded p-3">
                    <dt className="text-sm font-medium text-gray-600">{key}</dt>
                    <dd className="text-sm text-gray-900 mt-1">{value}</dd>
                  </div>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="border-t pt-6">
              {product.inStock ? (
                <div className="space-y-4">
                  <Button
                    onClick={handleAddToCart}
                    variant="primary"
                    size="lg"
                    className="w-full md:w-auto"
                    disabled={isAdded}
                  >
                    {isAdded ? '✓ Añadido al carrito' : 'Añadir al carrito'}
                  </Button>
                  <div className="flex gap-4">
                    <Button href="/carrito" variant="secondary" className="flex-1 md:flex-none">
                      Ver carrito
                    </Button>
                    <Button href="/productos" variant="secondary" className="flex-1 md:flex-none">
                      Seguir comprando
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-red-800 font-medium mb-2">Producto agotado</p>
                  <p className="text-red-600 text-sm">
                    Este producto no está disponible actualmente. Contacta con nosotros para más información.
                  </p>
                  <Button href="/contacto" variant="secondary" className="mt-3">
                    Contactar
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Info */}
        <div className="mt-16 bg-blue-50 rounded-lg p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              ¿Necesitas asesoramiento?
            </h2>
            <p className="text-blue-700 mb-6">
              Nuestros ópticos especializados pueden ayudarte a elegir las gafas perfectas para ti. 
              Agenda una cita en cualquiera de nuestras dos tiendas en Jaén.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/contacto" variant="primary">
                Contactar
              </Button>
              <Button 
                href={`https://api.whatsapp.com/send?phone=34953093062&text=Hola%2C%20me%20interesa%20el%20producto%20${encodeURIComponent(product.name)}`}
                variant="secondary"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}