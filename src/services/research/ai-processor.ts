import { ResearchModelType, ResearchTaskConfig } from '../../types/research-task';

interface AIProcessorOptions {
  model: ResearchModelType;
  apiKey?: string;
}

interface AnalyzeOptions {
  query: string;
  crawlData: Array<{
    url: string;
    title: string;
    content: string;
    metadata: Record<string, any>;
  }>;
  outputFields?: ResearchTaskConfig['outputFields'];
}

export class AIProcessor {
  private readonly options: AIProcessorOptions;
  private openai: any = null;
  
  constructor(options: AIProcessorOptions) {
    this.options = {
      model: options.model,
      apiKey: options.apiKey || process.env.OPENAI_API_KEY
    };
  }
  
  async initialize() {
    if (!this.openai) {
      const { default: OpenAI } = await import('openai');
      this.openai = new OpenAI({ apiKey: this.options.apiKey });
    }
  }
  
  async analyze(options: {
    query: string;
    searchData?: any;
    crawlData: any[];
    outputFields?: ResearchTaskConfig['outputFields'];
  }): Promise<any> {
    await this.initialize();
    
    // Select model based on research tier
    const modelName = this.getModelForTier(this.options.model);
    
    // Prepare content summary (limit to control token usage)
    const contentSummary = options.crawlData.map(page => ({
      url: page.url,
      title: page.title,
      content: this.truncateText(page.content, 1000) // Limit content to control token usage
    }));
    
    // Build structured output request if outputFields specified
    let outputFormatInstructions = '';
    if (options.outputFields) {
      outputFormatInstructions = `
Format your response as a JSON object with the following structure:
\`\`\`json
{
${Object.entries(options.outputFields).map(([key, field]) => 
  `  "${key}": // ${field.description} (${field.type})`
).join(',\n')}
}
\`\`\`
`;
    }
    
    // Create the system prompt
    const systemPrompt = `
You are Claygent, a web research assistant that processes crawled webpage content to answer questions. 
Your task is to analyze the provided web content and answer the user's research query.

${outputFormatInstructions}

Always include a "sourceUrls" array with the URLs that contained relevant information for your answer.
Provide a thorough, accurate analysis based only on the content provided.
`;

    // Create the user prompt with the query and content
    const userPrompt = `
Research Query: ${options.query}

I've crawled the following web pages. Use this content to answer my query:

${contentSummary.map((page, index) => `
--- PAGE ${index + 1}: ${page.title} (${page.url}) ---
${page.content}
`).join('\n')}
`;
    
    try {
      // Call OpenAI API
      const response = await this.openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2, // Lower temperature for more factual responses
        max_tokens: 2000,
        response_format: options.outputFields ? { type: 'json_object' } : undefined
      });
      
      const responseContent = response.choices[0]?.message?.content || '';
      
      // Handle structured output
      if (options.outputFields) {
        try {
          // Extract JSON from the response if it's wrapped in backticks
          const jsonMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          const jsonStr = jsonMatch ? jsonMatch[1] : responseContent;
          const parsed = JSON.parse(jsonStr);
          
          // Add source URLs if they're not already included
          if (!parsed.sourceUrls) {
            parsed.sourceUrls = contentSummary.map(page => page.url);
          }
          
          // Include raw response for debugging
          parsed.raw = responseContent;
          
          return parsed;
        } catch (err) {
          console.error('Error parsing structured output:', err);
          return {
            raw: responseContent,
            sourceUrls: contentSummary.map(page => page.url),
            error: 'Failed to parse structured output'
          };
        }
      }
      
      // Return unstructured response
      return {
        result: responseContent,
        sourceUrls: contentSummary.map(page => page.url)
      };
    } catch (error) {
      console.error('Error calling AI model:', error);
      throw new Error(`AI processing failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  async analyzeQuery(query: string): Promise<any> {
    await this.initialize();
    
    const modelName = this.getModelForTier(this.options.model);
    
    const systemPrompt = `
You are a web research planner that helps determine how to research a query effectively.
Given a research query, analyze it to extract:
1. Key entities (companies, people, products)
2. Specific domains that should be crawled
3. Search terms that should be used
4. Types of information being requested
`;

    const userPrompt = `Research Query: ${query}`;
    
    try {
      const response = await this.openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });
      
      const responseContent = response.choices[0]?.message?.content || '';
      
      try {
        const parsed = JSON.parse(responseContent);
        return {
          entities: parsed.entities || [],
          domains: parsed.domains || [],
          searchTerms: parsed.searchTerms || [],
          informationTypes: parsed.informationTypes || []
        };
      } catch (err) {
        console.error('Error parsing query analysis:', err);
        return {
          entities: [],
          domains: [],
          searchTerms: [{term: query}],
          informationTypes: []
        };
      }
    } catch (error) {
      console.error('Error analyzing query:', error);
      throw new Error(`Query analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  private getModelForTier(tier: ResearchModelType): string {
    switch (tier) {
      case 'basic':
        return 'gpt-3.5-turbo';
      case 'helium':
        return 'gpt-4';
      case 'neon':
        return 'gpt-4-turbo';
      case 'argon':
        return 'gpt-4-turbo';
      default:
        return 'gpt-3.5-turbo';
    }
  }
  
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
} 