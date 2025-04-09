import express from 'express';
import llmCrawlRouter from './routes/llm-crawl';

const app = express();

app.use('/llm-crawl', llmCrawlRouter);

// Export the app for use in other files
export default app;

// If this is the main entry point, start the server
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}