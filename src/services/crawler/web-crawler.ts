import { chromium, Browser, Page } from 'playwright';

interface CrawlOptions {
  maxPages?: number;
  maxDepth?: number;
  allowedDomains?: string[];
}

interface PageData {
  url: string;
  title: string;
  content: string; 
  html: string;
  links: string[];
  metadata: Record<string, any>;
}

export class WebCrawler {
  private readonly options: Required<CrawlOptions>;
  
  constructor(options: CrawlOptions = {}) {
    this.options = {
      maxPages: options.maxPages || 10,
      maxDepth: options.maxDepth || 3,
      allowedDomains: options.allowedDomains || []
    };
  }
  
  async crawl(startUrl: string): Promise<PageData[]> {
    console.log(`Starting crawl of ${startUrl} with max ${this.options.maxPages} pages at depth ${this.options.maxDepth}`);
    
    // Extract domain from startUrl to stay on the same site by default
    const urlObj = new URL(startUrl);
    const baseDomain = urlObj.hostname;
    
    // If no allowed domains specified, default to the base domain
    const allowedDomains = this.options.allowedDomains.length > 0 
      ? this.options.allowedDomains 
      : [baseDomain];
    
    // Launch browser
    const browser = await chromium.launch();
    
    try {
      const context = await browser.newContext({
        userAgent: 'GTM-Crawler/1.0 (+https://github.com/yourusername/gtm-crawler)'
      });
      
      // Initialize structures for tracking
      const visited = new Set<string>();
      const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];
      const results: PageData[] = [];
      
      // Process queue
      while (queue.length > 0 && results.length < this.options.maxPages) {
        const { url, depth } = queue.shift()!;
        
        // Skip if already visited or exceeded depth
        if (visited.has(url) || depth > this.options.maxDepth) {
          continue;
        }
        
        // Mark as visited
        visited.add(url);
        
        try {
          // Process the page
          const page = await context.newPage();
          const pageData = await this.processPage(page, url, allowedDomains);
          results.push(pageData);
          
          // Add links to queue if within depth limit
          if (depth < this.options.maxDepth) {
            for (const link of pageData.links) {
              if (!visited.has(link)) {
                queue.push({ url: link, depth: depth + 1 });
              }
            }
          }
          
          await page.close();
        } catch (error) {
          console.error(`Error processing ${url}:`, error);
        }
      }
      
      return results;
    } finally {
      await browser.close();
    }
  }
  
  private async processPage(page: Page, url: string, allowedDomains: string[]): Promise<PageData> {
    console.log(`Processing page: ${url}`);
    
    // Navigate to the URL with timeout
    await page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });
    
    // Extract page title
    const title = await page.title();
    
    // Extract page content (visible text)
    const content = await page.evaluate(() => document.body.innerText);
    
    // Extract HTML
    const html = await page.content();
    
    // Extract metadata
    const metadata = await page.evaluate(() => {
      const metaTags = Array.from(document.getElementsByTagName('meta'));
      const result: Record<string, string> = {};
      
      metaTags.forEach(tag => {
        const name = tag.getAttribute('name') || tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (name && content) {
          result[name] = content;
        }
      });
      
      return result;
    });
    
    // Extract links that stay within allowed domains
    const links = await page.evaluate((domains: string[]) => {
      return Array.from(document.links)
        .map(link => link.href)
        .filter(href => {
          try {
            const url = new URL(href);
            return (
              // Only keep http/https links
              (url.protocol === 'http:' || url.protocol === 'https:') &&
              // Check if domain is allowed
              domains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`))
            );
          } catch {
            return false;
          }
        });
    }, allowedDomains);
    
    // Return structured page data
    return {
      url,
      title,
      content,
      html,
      links: [...new Set(links)],
      metadata
    };
  }
} 