import { Router } from 'express';
import { startResearchTask, getResearchTask, getTemplates } from '../services/research/research-service';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ResearchRequest:
 *       type: object
 *       required:
 *         - query
 *       properties:
 *         query:
 *           type: string
 *           description: Natural language query or instruction (just like talking to Claygent)
 *         model:
 *           type: string
 *           enum: [basic, helium, neon, argon]
 *           default: neon
 *           description: AI model tier to use
 *         templateId:
 *           type: string
 *           description: Optional template ID to use predefined research patterns
 *         outputFields:
 *           type: object
 *           description: Structure for organizing results (optional)
 *       example:
 *         query: "What are the funding details for Anthropic? Who are their main competitors?"
 *         model: "neon"
 */

/**
 * @swagger
 * /research:
 *   post:
 *     summary: Start a research task with any natural language query
 *     tags: [Research]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResearchRequest'
 *     responses:
 *       202:
 *         description: Research task accepted
 */
router.post('/', async (req, res) => {
  const { query, model = 'neon', templateId, outputFields } = req.body;
  
  if (!query) {
    return res.status(400).json({
      error: 'Missing query',
      message: 'Please provide a natural language query for research'
    });
  }
  
  try {
    const job = await startResearchTask({
      query,
      model,
      templateId,
      outputFields
    });
    
    res.status(202).json({
      message: 'Started research task',
      jobId: job.jobId,
      status: job.status
    });
  } catch (error) {
    console.error('Error starting research task:', error);
    res.status(500).json({ 
      error: 'Failed to start research',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * @swagger
 * /research/templates:
 *   get:
 *     summary: Get available research templates
 *     tags: [Research]
 *     responses:
 *       200:
 *         description: List of available templates
 */
router.get('/templates', async (req, res) => {
  const templates = await getTemplates();
  res.json(templates);
});

/**
 * @swagger
 * /research/tasks/{jobId}:
 *   get:
 *     summary: Get research task results
 *     tags: [Research]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: Research task ID
 *     responses:
 *       200:
 *         description: Research task results
 */
router.get('/tasks/:jobId', async (req, res) => {
  const { jobId } = req.params;
  
  try {
    const result = await getResearchTask(jobId);
    
    if (!result) {
      return res.status(404).json({
        error: 'Task not found',
        message: `No research task found with ID: ${jobId}`
      });
    }
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error retrieving research task:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve research task',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router; 