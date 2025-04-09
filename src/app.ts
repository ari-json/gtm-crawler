import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger';
import llmCrawlRouter from './routes/llm-crawl';

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
    name: 'Natural Language Web Crawler API',
    version: '1.0.0',
    description: 'Crawl websites using natural language instructions',
    documentation: '/docs'
  });
});

// Routes
app.use('/llm-crawl', llmCrawlRouter);

export default app;