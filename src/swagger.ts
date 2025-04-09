import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Natural Language Web Crawler API',
      version: '1.0.0',
      description: 'API for crawling websites using natural language instructions',
      contact: {
        name: 'API Support',
        url: 'https://github.com/yourusername/gtm-crawler'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'https://gtm-crawler-production.up.railway.app',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  },
  apis: ['./src/routes/*.ts'] // Path to the API routes with JSDoc comments
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec; 