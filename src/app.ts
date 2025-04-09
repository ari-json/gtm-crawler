import express from 'express';
import llmCrawlRouter from './routes/llm-crawl';

const app = express();
const port = process.env.PORT || 3000;

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

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;