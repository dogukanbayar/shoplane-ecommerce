const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShopLane E-Commerce API',
      version: '1.0.0',
      description: 'ShopLane Çok Satıcılı E-Ticaret Platformu REST API Dokümantasyonu',
      contact: {
        name: 'Doğukan Bayar',
        email: 'bayardogukan0@gmail.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5001/api',
        description: 'Yerel Geliştirme Sunucusu'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token bilginizi "Bearer <token>" formatında girin'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'İşlem başarılı' },
            data: { type: 'object' }
          }
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '6ac95d7d20ef4c9587707b77' },
            orderNumber: { type: 'string', example: 'ORD-1791581565288-1234' },
            totalAmount: { type: 'number', example: 6800 },
            status: { 
              type: 'string', 
              enum: ['Hazırlanıyor', 'Kargoya Verildi', 'Teslim Edildi', 'İptal Edildi', 'İade Talebi Alındı'],
              example: 'Hazırlanıyor' 
            },
            paymentMethod: { type: 'string', example: 'creditCard' },
            shippingAddress: {
              type: 'object',
              properties: {
                address: { type: 'string', example: 'Atatürk Cad. No:5' },
                city: { type: 'string', example: 'İstanbul' },
                postalCode: { type: 'string', example: '34000' },
                country: { type: 'string', example: 'Türkiye' }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
