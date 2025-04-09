/**
 * Represents a web crawling job
 */
export interface CrawlJob {
  /**
   * Unique identifier for the job
   */
  id: string;
  
  /**
   * URL to start crawling from
   */
  url: string;
  
  /**
   * Maximum number of pages to crawl
   */
  maxPages?: number;
  
  /**
   * Maximum depth to crawl
   */
  maxDepth?: number;
  
  /**
   * Storage for metadata collected during crawl
   */
  metadata?: Record<string, any>;
  
  /**
   * Job status
   */
  status?: 'pending' | 'running' | 'completed' | 'failed';
  
  /**
   * Configuration for the job
   */
  config: {
    maxDepth: number;
    maxPages: number;
  };
} 