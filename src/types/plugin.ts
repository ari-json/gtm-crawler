// import type { Page } from 'playwright';
import type { CrawlJob } from './job';

/**
 * Interface for crawler plugins that can be used to extend crawler functionality
 */
export interface CrawlerPlugin {
  name: string;
  enabled: boolean;
  initialize?(): Promise<void>;
  beforeCrawl?(job: any): Promise<void>;
  afterPageLoad?(page: any, job: any): Promise<void>;
  
  /**
   * Called when the crawl is complete
   */
  afterCrawl?(job: CrawlJob): Promise<void>;
} 