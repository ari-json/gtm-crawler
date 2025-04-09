import express from 'express';
import llmCrawlRouter from './routes/llm-crawl';

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).send('GTM Crawler is running');
});

// Routes
app.use('/llm-crawl', llmCrawlRouter);

export default app;