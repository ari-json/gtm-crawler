import express from 'express';

const router = express.Router();

// Define your routes
router.get('/', (req, res) => {
  res.json({ message: 'LLM Crawl API' });
});

// Add more routes as needed

export default router; 