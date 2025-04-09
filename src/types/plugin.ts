import type { Page } from 'playwright';
import type { CrawlJob } from './job';

/**
 * Interface for crawler plugins that can be used to extend crawler functionality
 */
export interface CrawlerPlugin {
  /**
   * Called before the crawl starts
   */
  beforeCrawl?(job: CrawlJob): Promise<void>;
  
  /**
   * Called after a page is loaded
   */
  afterPageLoad?(page: Page, job: CrawlJob): Promise<void>;
  
  /**
   * Called when the crawl is complete
   */
  afterCrawl?(job: CrawlJob): Promise<void>;
} 