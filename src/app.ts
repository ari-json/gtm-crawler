import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import llmCrawlRouter from './routes/llm-crawl';
import researchRouter from './routes/research';

const app = express();

// Middleware
app.use(express.json());

// Mount Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }' // Optional: hide the Swagger topbar
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Natural Language Web Crawler & Research API',
    version: '1.0.0',
    description: 'Crawl websites and conduct AI-powered research using natural language instructions',
    documentation: '/docs',
    claygentFeatures: {
      description: 'AI-powered web research similar to Claygent',
      capabilities: [
        'Template-based research with predefined output schemas',
        'Multi-tier AI models (basic, helium, neon, argon)',
        'Natural language research queries',
        'Structured data extraction from websites',
        'Configurable crawl depth and breadth'
      ],
      exampleQuery: 'Based on this company website, what are their pricing tiers, target customers, and main competitors?'
    }
  });
});

// Routes
app.use('/llm-crawl', llmCrawlRouter);
app.use('/research', researchRouter);

export default app;