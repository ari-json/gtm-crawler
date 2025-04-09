import { Router } from 'express';
import { startCrawlJob } from '../services/crawler';

const router = Router();

// Documentation endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Natural Language Web Crawler API',
    endpoints: [
      {
        path: '/llm-crawl/{domain}',
        method: 'POST',
        description: 'Start a crawl job with natural language instructions',
        body: {
          query: 'String - Natural language instructions for the crawler',
          maxPages: 'Number (optional) - Maximum pages to crawl',
          maxDepth: 'Number (optional) - Maximum crawl depth'
        },
        response: {
          jobId: 'String - Unique identifier for tracking the job',
          status: 'String - Job status'
        }
      },
      {
        path: '/llm-crawl/jobs/{jobId}',
        method: 'GET',
        description: 'Get results of a crawl job',
        response: {
          jobId: 'String - Job identifier',
          status: 'String - Job status',
          results: 'Array - Crawl results matching the query'
        }
      }
    ]
  });
});

// Create a new crawl job with natural language instructions
router.post('/:sitedomain', async (req, res) => {
  const { sitedomain } = req.params;
  const { query, maxPages = 10, maxDepth = 3 } = req.body;
  
  if (!query) {
    return res.status(400).json({ 
      error: 'Missing query parameter. Please provide natural language instructions.'
    });
  }

  try {
    const job = await startCrawlJob({
      url: sitedomain.startsWith('http') ? sitedomain : `https://${sitedomain}`,
      nlQuery: query,
      maxPages,
      maxDepth
    });
    
    res.status(202).json({
      message: `Started crawl for ${sitedomain}`,
      jobId: job.id,
      status: job.status
    });
  } catch (error) {
    console.error('Error starting crawl job:', error);
    res.status(500).json({ 
      error: 'Failed to start crawl job',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

// Get job results
router.get('/jobs/:jobId', async (req, res) => {
  const { jobId } = req.params;
  
  // Implementation will be added later
  res.status(200).json({
    jobId,
    status: 'completed', // This will be dynamic in the real implementation
    results: [
      { title: 'Example result', url: 'https://example.com/page1', relevance: 0.95 }
    ]
  });
});

// Add more routes as needed

export default router; 