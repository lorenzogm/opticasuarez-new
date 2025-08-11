// Redsys payment integration types and utilities
// Based on Redsys REST API documentation: https://pagosonline.redsys.es/desarrolladores-inicio/continar-integracion/

export interface RedsysPaymentData {
  // Merchant parameters
  DS_MERCHANT_AMOUNT: string; // Amount in cents (e.g., "8999" for €89.99)
  DS_MERCHANT_ORDER: string; // Order number (12 characters max)
  DS_MERCHANT_MERCHANTCODE: string; // Merchant code provided by Redsys
  DS_MERCHANT_CURRENCY: string; // Currency code (978 for EUR)
  DS_MERCHANT_TRANSACTIONTYPE: string; // Transaction type (0 for authorization)
  DS_MERCHANT_TERMINAL: string; // Terminal number
  DS_MERCHANT_MERCHANTURL?: string; // Notification URL
  DS_MERCHANT_URLOK?: string; // Success return URL
  DS_MERCHANT_URLKO?: string; // Error return URL
  DS_MERCHANT_CONSUMERLANGUAGE: string; // Language (001 for Spanish)
  DS_MERCHANT_PRODUCTDESCRIPTION?: string; // Product description
  DS_MERCHANT_TITULAR?: string; // Card holder name
  DS_MERCHANT_MERCHANTNAME?: string; // Merchant name
}

export interface RedsysConfig {
  merchantCode: string;
  terminal: string;
  secretKey: string; // HMAC key provided by Redsys
  environment: 'sandbox' | 'production';
}

export interface RedsysResponse {
  Ds_Date?: string;
  Ds_Hour?: string;
  Ds_Amount?: string;
  Ds_Currency?: string;
  Ds_Order?: string;
  Ds_MerchantCode?: string;
  Ds_Terminal?: string;
  Ds_Response?: string;
  Ds_MerchantData?: string;
  Ds_SecurePayment?: string;
  Ds_TransactionType?: string;
  Ds_Card_Country?: string;
  Ds_AuthorisationCode?: string;
  Ds_ConsumerLanguage?: string;
  Ds_Card_Type?: string;
}

// Default configuration (should be moved to environment variables)
export const REDSYS_CONFIG: RedsysConfig = {
  merchantCode: '999008881', // Demo merchant code
  terminal: '001',
  secretKey: 'sq7HjrUOBfKmC576ILgskD5srU870gJ7', // Demo key
  environment: 'sandbox'
};

// Redsys API URLs
export const REDSYS_URLS = {
  sandbox: 'https://sis-t.redsys.es:25443/sis/realizarPago',
  production: 'https://sis.redsys.es/sis/realizarPago'
};

// Generate order number (12 characters max, alphanumeric)
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD${timestamp.slice(-6)}${random}`;
}

// Convert amount to cents
export function amountToCents(amount: number): string {
  return Math.round(amount * 100).toString();
}

// Create payment parameters for Redsys
export function createPaymentParams(
  amount: number,
  orderNumber: string,
  productDescription: string,
  customerName?: string
): RedsysPaymentData {
  return {
    DS_MERCHANT_AMOUNT: amountToCents(amount),
    DS_MERCHANT_ORDER: orderNumber,
    DS_MERCHANT_MERCHANTCODE: REDSYS_CONFIG.merchantCode,
    DS_MERCHANT_CURRENCY: '978', // EUR
    DS_MERCHANT_TRANSACTIONTYPE: '0', // Authorization
    DS_MERCHANT_TERMINAL: REDSYS_CONFIG.terminal,
    DS_MERCHANT_MERCHANTURL: 'http://localhost:5173/api/redsys/notification',
    DS_MERCHANT_URLOK: 'http://localhost:5173/payment/success',
    DS_MERCHANT_URLKO: 'http://localhost:5173/payment/error',
    DS_MERCHANT_CONSUMERLANGUAGE: '001', // Spanish
    DS_MERCHANT_PRODUCTDESCRIPTION: productDescription,
    DS_MERCHANT_TITULAR: customerName,
    DS_MERCHANT_MERCHANTNAME: 'Óptica Suárez'
  };
}

// For browser-side implementation, we'll use a simplified approach
// In production, signature generation should be done server-side for security
export function preparePaymentForm(
  amount: number,
  productDescription: string,
  customerName?: string
) {
  const orderNumber = generateOrderNumber();
  const params = createPaymentParams(amount, orderNumber, productDescription, customerName);
  
  // In a real implementation, this would be sent to a server endpoint
  // that generates the proper signature and returns the form data
  return {
    orderNumber,
    params,
    // For demo purposes, we'll simulate the payment
    simulatePayment: true
  };
}

// Check if payment was successful
export function isPaymentSuccessful(responseCode: string): boolean {
  const code = parseInt(responseCode);
  return code >= 0 && code <= 99;
}