import type { CrawlerPlugin } from '../../../types/plugin';
import type { CrawlJob } from '../../../types/job';
// Use dynamic imports for modules that might not be available during development
// but will be installed by Railway during deployment

// Fix for TypeScript development - this avoids the "module not found" error
type OpenAIClient = {
  chat: {
    completions: {
      create(params: any): Promise<{
        choices: Array<{
          message?: {
            content?: string;
          };
        }>;
      }>;
    };
  };
};

export interface LlmPluginOptions {
  openaiApiKey?: string;
  model?: string;
  prompt?: string;
  maxTokens?: number;
}

export class LlmPlugin implements CrawlerPlugin {
  private openai: OpenAIClient | null = null;
  private readonly options: LlmPluginOptions;
  
  // Add required properties from the interface
  public name: string = 'LLM Plugin';
  public enabled: boolean = true;

  constructor(options: LlmPluginOptions = {}) {
    this.options = {
      model: 'gpt-3.5-turbo',
      maxTokens: 1000,
      prompt: 'Summarize this webpage content:',
      ...options
    };
  }

  async beforeCrawl(job: CrawlJob): Promise<void> {
    try {
      // Dynamically import OpenAI during runtime
      const { default: OpenAI } = await import('openai');
      
      const apiKey = this.options.openaiApiKey || process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key is required for LlmPlugin');
      }
      
      this.openai = new OpenAI({ apiKey });
    } catch (err) {
      console.error('Error initializing OpenAI:', err);
      throw new Error('Failed to initialize OpenAI. Please make sure the package is installed.');
    }
  }

  async afterPageLoad(page: any, job: CrawlJob): Promise<void> {
    if (!this.openai) {
      throw new Error('OpenAI client not initialized. Make sure beforeCrawl() was called');
    }
    
    // Use type assertion for Playwright Page methods
    const pageContent = await (page as any).content();
    const pageText = await (page as any).evaluate(() => document.body.innerText);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: this.options.model as string,
        messages: [
          { role: 'system', content: 'You are a web content analyzer.' },
          { role: 'user', content: `${this.options.prompt}\n\n${pageText.substring(0, 10000)}` }
        ],
        max_tokens: this.options.maxTokens
      });
      
      job.metadata = job.metadata || {};
      job.metadata.llmAnalysis = response.choices[0]?.message?.content || 'No analysis available';
    } catch (error) {
      console.error('LLM processing error:', error);
      job.metadata = job.metadata || {};
      job.metadata.llmError = String(error);
    }
  }
}

export default LlmPlugin; 