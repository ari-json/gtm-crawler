export type ResearchModelType = 'basic' | 'helium' | 'neon' | 'argon';

export interface ResearchTaskConfig {
  // Research parameters
  query: string;
  model: ResearchModelType;
  url?: string;
  maxPages?: number;
  maxDepth?: number;
  templateId?: string;
  
  // Output configuration
  outputFields?: {
    [key: string]: {
      description: string;
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    }
  };
}

export interface ResearchTemplate {
  id: string;
  name: string;
  description: string;
  defaultPrompt: string;
  defaultOutputFields: ResearchTaskConfig['outputFields'];
  category: 'company' | 'person' | 'product' | 'market' | 'custom';
}

export interface ResearchResult {
  jobId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: {
    url?: string;
    query: string;
  };
  output?: {
    [key: string]: any;
    raw?: string;
    sourceUrls?: string[];
  };
  error?: string;
  createdAt: string;
  updatedAt: string;
} 