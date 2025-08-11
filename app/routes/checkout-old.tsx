import type { MetaFunction } from 'react-router';
import { useCart } from '../context/cart-context';
import { Button } from '../ui/components/button';
import { useState } from 'react';
import { preparePaymentForm } from '../lib/redsys';

export const meta: MetaFunction = () => {
  return [
    { title: 'Checkout - Óptica Suárez' },
    {
      name: 'description',
      content: 'Completa tu compra de forma segura con Redsys.',
    },
  ];
};

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    codigoPostal: '',
    provincia: ''
  });

  // Redirect to cart if empty
  if (cart.items.length === 0) {
    return (
      <main className="min-h-screen bg-white pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              No hay productos en el carrito
            </h1>
            <p className="text-gray-600 mb-8">
              Añade algunos productos antes de proceder al checkout.
            </p>
            <Button href="/productos" variant="primary">
              Ver Productos
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Validate form data
      const requiredFields = ['nombre', 'apellidos', 'email', 'telefono', 'direccion', 'ciudad', 'codigoPostal', 'provincia'];
      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        alert(`Por favor, completa los siguientes campos: ${missingFields.join(', ')}`);
        setIsProcessing(false);
        return;
      }

      // Prepare product description
      const productNames = cart.items.map(item => item.product.name).join(', ');
      const customerName = `${formData.nombre} ${formData.apellidos}`;
      
      // Prepare Redsys payment
      const paymentForm = preparePaymentForm(
        cart.total,
        `Compra en Óptica Suárez: ${productNames}`,
        customerName
      );

      if (paymentForm.simulatePayment) {
        // Simulate payment for demo
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Clear cart after successful payment
        clearCart();
        
        alert('¡Pago realizado con éxito! Recibirás un email de confirmación. Número de pedido: ' + paymentForm.orderNumber);
        
        // In a real implementation, you would redirect to a success page
        // window.location.href = '/payment/success';
      } else {
        // In production, this would redirect to Redsys payment gateway
        console.log('Redirecting to Redsys with parameters:', paymentForm);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error al procesar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-white pt-16">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Billing Form */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Información de Facturación
              </h2>
              
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellidos
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provincia
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Resumen del Pedido
              </h2>
              
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.product.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="font-medium">
                      €{(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <hr className="my-4" />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>€{cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Envío</span>
                    <span className="text-green-600">Gratis</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span className="text-blue-900">€{cart.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Método de Pago
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <input type="radio" id="redsys" name="payment" value="redsys" defaultChecked className="mr-3" />
                  <label htmlFor="redsys" className="flex-1">
                    <div className="font-medium">Tarjeta de Crédito/Débito</div>
                    <div className="text-sm text-gray-600">Pago seguro con Redsys</div>
                  </label>
                  <div className="flex space-x-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">VISA</span>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">MC</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <Button
                  onClick={handlePayment}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Procesando...' : `Pagar €${cart.total.toFixed(2)}`}
                </Button>
              </div>
              
              <div className="mt-4 text-xs text-gray-500 text-center">
                <p>Tu pago está protegido por SSL y procesado de forma segura.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}