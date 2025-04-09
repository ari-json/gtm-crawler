import { Router } from 'express';

const router = Router();

// Define your routes
router.get('/', (req, res) => {
  res.json({ message: 'LLM Crawl API' });
});

router.post('/:sitedomain', (req, res) => {
  const { sitedomain } = req.params;
  
  // For now, just return a success response
  res.status(200).json({
    message: `Started crawl for ${sitedomain}`,
    jobId: `job-${Date.now()}`,
    status: 'accepted'
  });
});

// Add more routes as needed

export default router; 