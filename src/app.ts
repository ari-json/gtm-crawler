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

// Add after your other routes
app.get('/docs', (req, res) => {
  res.status(200).json({
    title: "Natural Language Web Crawler API Documentation",
    version: "1.0.0",
    description: "API for crawling websites using natural language instructions",
    baseUrl: process.env.API_URL || "https://gtm-crawler-production.up.railway.app",
    endpoints: [
      {
        path: "/health",
        method: "GET",
        description: "Check if the API is running properly",
        response: {
          status: "String - Service status"
        }
      },
      {
        path: "/llm-crawl/{domain}",
        method: "POST",
        description: "Start a new crawl job with natural language instructions",
        urlParams: {
          domain: "String - Website domain to crawl (e.g., example.com)"
        },
        requestBody: {
          query: "String - Natural language instructions for what to find",
          maxPages: "Number (optional) - Maximum pages to crawl (default: 10)",
          maxDepth: "Number (optional) - Maximum crawl depth (default: 3)"
        },
        response: {
          jobId: "String - Unique identifier for the crawl job",
          status: "String - Job status (accepted, running, completed, failed)",
          message: "String - Additional information about the job"
        },
        example: {
          request: {
            url: "/llm-crawl/example.com",
            method: "POST",
            body: {
              query: "Find all pricing information and product features"
            }
          },
          response: {
            jobId: "job-1637589302123",
            status: "accepted",
            message: "Started crawl for example.com"
          }
        }
      },
      {
        path: "/llm-crawl/jobs/{jobId}",
        method: "GET",
        description: "Get the results of a previously started crawl job",
        urlParams: {
          jobId: "String - The job ID returned when starting the crawl"
        },
        response: {
          jobId: "String - Job identifier",
          status: "String - Current job status",
          results: "Array - Crawl results matching the query"
        },
        example: {
          request: {
            url: "/llm-crawl/jobs/job-1637589302123",
            method: "GET"
          },
          response: {
            jobId: "job-1637589302123",
            status: "completed",
            results: [
              {
                title: "Product Features",
                url: "https://example.com/features",
                relevance: 0.95,
                summary: "The product offers the following features..."
              }
            ]
          }
        }
      }
    ],
    testing: {
      curl: [
        "curl -X POST -H 'Content-Type: application/json' -d '{\"query\":\"Find pricing information\"}' https://gtm-crawler-production.up.railway.app/llm-crawl/example.com",
        "curl https://gtm-crawler-production.up.railway.app/llm-crawl/jobs/job-1637589302123"
      ],
      postman: "Import the collection from docs/postman-collection.json"
    }
  });
});

export default app;