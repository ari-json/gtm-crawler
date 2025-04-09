import { Router } from 'express';
import { startCrawlJob } from '../services/crawler';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     CrawlJobRequest:
 *       type: object
 *       required:
 *         - query
 *       properties:
 *         query:
 *           type: string
 *           description: Natural language instructions for what to find
 *         maxPages:
 *           type: integer
 *           description: Maximum pages to crawl
 *           default: 10
 *         maxDepth:
 *           type: integer
 *           description: Maximum crawl depth
 *           default: 3
 *       example:
 *         query: "Find all pricing information and product features"
 *         maxPages: 20
 *         maxDepth: 2
 *     CrawlJobResponse:
 *       type: object
 *       properties:
 *         jobId:
 *           type: string
 *         status:
 *           type: string
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /llm-crawl:
 *   get:
 *     summary: Get API documentation
 *     tags: [Crawler]
 *     responses:
 *       200:
 *         description: API documentation
 */
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

/**
 * @swagger
 * /llm-crawl/{sitedomain}:
 *   post:
 *     summary: Start a new crawl job
 *     tags: [Crawler]
 *     parameters:
 *       - in: path
 *         name: sitedomain
 *         schema:
 *           type: string
 *         required: true
 *         description: Domain to crawl
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrawlJobRequest'
 *     responses:
 *       202:
 *         description: Job accepted
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CrawlJobResponse'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /llm-crawl/jobs/{jobId}:
 *   get:
 *     summary: Get job results
 *     tags: [Crawler]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job results
 *       404:
 *         description: Job not found
 */
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