import { v4 as uuidv4 } from 'uuid';
import { ResearchTaskConfig, ResearchResult, ResearchTemplate } from '../../types/research-task';
import { WebCrawler } from '../crawler/web-crawler';
import { AIProcessor } from './ai-processor';

// In-memory storage (replace with database in production)
const researchTasks = new Map<string, ResearchResult>();
const templates = new Map<string, ResearchTemplate>();

// Initialize with some predefined templates
function initializeTemplates() {
  const defaultTemplates: ResearchTemplate[] = [
    {
      id: 'company-overview',
      name: 'Company Overview',
      description: 'Get general information about a company',
      category: 'company',
      defaultPrompt: 'Find the following information about the company: what they do, their target market, key products or services, and company size.',
      defaultOutputFields: {
        description: { 
          description: 'What the company does', 
          type: 'string' 
        },
        targetMarket: { 
          description: 'Their target market or customers', 
          type: 'string' 
        },
        products: { 
          description: 'Key products or services', 
          type: 'array' 
        },
        companySize: { 
          description: 'Approximate number of employees', 
          type: 'string' 
        }
      }
    },
    {
      id: 'funding-info',
      name: 'Funding Information',
      description: 'Research company funding details',
      category: 'company',
      defaultPrompt: 'Find the latest funding information including funding rounds, amounts raised, and lead investors.',
      defaultOutputFields: {
        fundingStage: { 
          description: 'Current funding stage', 
          type: 'string' 
        },
        totalFunding: { 
          description: 'Total funding amount', 
          type: 'string' 
        },
        latestRound: { 
          description: 'Details about the latest funding round', 
          type: 'object' 
        },
        investors: { 
          description: 'Key investors', 
          type: 'array' 
        }
      }
    },
    {
      id: 'person-profile',
      name: 'Person Profile',
      description: 'Research information about a specific person',
      category: 'person',
      defaultPrompt: 'Find professional information about this person including current role, background, education, and notable achievements.',
      defaultOutputFields: {
        currentRole: { 
          description: 'Current job title and company', 
          type: 'string' 
        },
        background: { 
          description: 'Professional background summary', 
          type: 'string' 
        },
        education: { 
          description: 'Educational background', 
          type: 'array' 
        },
        achievements: { 
          description: 'Notable achievements', 
          type: 'array' 
        }
      }
    }
  ];

  defaultTemplates.forEach(template => {
    templates.set(template.id, template);
  });
}

// Initialize templates on module load
initializeTemplates();

export async function getTemplates(): Promise<ResearchTemplate[]> {
  return Array.from(templates.values());
}

export async function startResearchTask(config: ResearchTaskConfig): Promise<ResearchResult> {
  const { query, model = 'neon', templateId, outputFields } = config;
  
  // Use template if specified
  let effectiveQuery = query;
  let effectiveOutputFields = outputFields;
  
  if (templateId && templates.has(templateId)) {
    const template = templates.get(templateId)!;
    effectiveQuery = query || template.defaultPrompt;
    effectiveOutputFields = outputFields || template.defaultOutputFields;
  }
  
  // Create research task
  const taskId = uuidv4();
  const task: ResearchResult = {
    jobId: taskId,
    status: 'pending',
    input: {
      query: effectiveQuery
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Store the task
  researchTasks.set(taskId, task);
  
  // Execute research in the background
  executeResearch(task, {
    model,
    outputFields: effectiveOutputFields
  }).catch(error => {
    console.error(`Error in research task ${taskId}:`, error);
    const failedTask = researchTasks.get(taskId);
    if (failedTask) {
      failedTask.status = 'failed';
      failedTask.error = String(error);
      failedTask.updatedAt = new Date().toISOString();
      researchTasks.set(taskId, failedTask);
    }
  });
  
  return task;
}

export async function getResearchTask(jobId: string): Promise<ResearchResult | null> {
  return researchTasks.get(jobId) || null;
}

async function executeResearch(
  task: ResearchResult, 
  options: { 
    model: ResearchTaskConfig['model'],
    outputFields?: ResearchTaskConfig['outputFields']
  }
): Promise<void> {
  try {
    // Update task status
    task.status = 'running';
    task.updatedAt = new Date().toISOString();
    researchTasks.set(task.jobId, task);
    
    // Extract potential domains/topics from the query
    const aiProcessor = new AIProcessor({ model: options.model });
    
    // Step 1: Analyze the query to determine what to research
    const queryAnalysis = await aiProcessor.analyzeQuery(task.input.query);
    
    // Step 2: Based on analysis, either:
    //   a) Search the web for relevant information
    //   b) Crawl specific websites
    //   c) Both
    const searchResults = await performWebResearch(queryAnalysis);
    
    // Step 3: Process all the gathered information
    const analysisResult = await aiProcessor.analyze({
      query: task.input.query,
      searchData: queryAnalysis,
      crawlData: searchResults,
      outputFields: options.outputFields
    });
    
    // Update task with results
    task.status = 'completed';
    task.output = analysisResult;
    task.updatedAt = new Date().toISOString();
    researchTasks.set(task.jobId, task);
    
    console.log(`Completed research task ${task.jobId}`);
  } catch (error) {
    console.error(`Error in research task ${task.jobId}:`, error);
    task.status = 'failed';
    task.error = String(error);
    task.updatedAt = new Date().toISOString();
    researchTasks.set(task.jobId, task);
    throw error;
  }
}

// Add a helper function for web research
async function performWebResearch(queryAnalysis: any): Promise<any[]> {
  // This would integrate with a search API (like Google Search)
  // and then crawl relevant pages based on search results
  
  // For now, we'll use a simulated implementation
  const webCrawler = new WebCrawler({
    maxPages: 5,
    maxDepth: 2
  });
  
  const results = [];
  
  // Process each potential domain/keyword from the query analysis
  for (const item of queryAnalysis.searchTerms.slice(0, 3)) {
    try {
      // In a real implementation, this would be a call to Google Search API
      const searchUrl = `https://${item.domain || 'google.com/search?q=' + encodeURIComponent(item.term)}`;
      
      // Crawl the site or search results
      const crawlResults = await webCrawler.crawl(searchUrl);
      results.push(...crawlResults);
    } catch (error) {
      console.error(`Error researching ${item.term || item.domain}:`, error);
    }
  }
  
  return results;
} 