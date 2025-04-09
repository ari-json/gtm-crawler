import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GTM Crawler API with Claygent-like Research',
      version: '1.0.0',
      description: 'API for crawling websites and conducting AI-powered research like Claygent, using natural language instructions',
      contact: {
        name: 'API Support',
        url: 'https://github.com/yourusername/gtm-crawler'
      }
    },
    tags: [
      {
        name: 'Research',
        description: 'Claygent-like functionality for AI-powered web research'
      },
      {
        name: 'Crawler',
        description: 'Basic web crawling with LLM analysis'
      }
    ],
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