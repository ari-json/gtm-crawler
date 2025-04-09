import express from 'express';
import llmCrawlRouter from './routes/llm-crawl';

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Natural Language Web Crawler API',
    version: '1.0.0',
    description: 'Crawl websites using natural language instructions',
    endpoints: {
      '/health': 'Health check endpoint',
      '/llm-crawl': 'Natural language crawler API documentation',
      '/llm-crawl/{domain}': 'Start a new crawl with NL instructions',
      '/llm-crawl/jobs/{jobId}': 'Get results of a crawl job'
    },
    exampleUsage: {
      url: 'POST /llm-crawl/example.com',
      body: {
        query: 'Find all pricing information and product features on this website'
      }
    }
  });
});

// Routes
app.use('/llm-crawl', llmCrawlRouter);

export default app;