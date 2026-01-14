import { getNextPendingTask, isProjectBusy, updateTaskStatus } from './database';
import { executeRecipe, cleanupProcess } from './executor';
import { postLog, postStatusUpdate } from './api-client';
import type { RecipeStep } from '@devcenter/shared';

const POLL_INTERVAL = 2000;

async function processNextTask() {
  try {
    const task = getNextPendingTask();
    
    if (!task) {
      return;
    }
  
  if (isProjectBusy(task.projectId)) {
    return;
  }
  
  console.log(`Processing task: ${task.id}`);
  
  updateTaskStatus(task.id, 'running');
  await postStatusUpdate(task.id, 'running');
  await postLog(task.id, 'system', '🚀 Task started');
  
  try {
    const steps: RecipeStep[] = JSON.parse(task.recipe.stepsJson);
    const input = JSON.parse(task.inputJson);
    
    await executeRecipe(task.id, steps, task.project, input);
    
    updateTaskStatus(task.id, 'success');
    await postStatusUpdate(task.id, 'success');
    await postLog(task.id, 'system', '✅ Task completed successfully');
    console.log(`Task ${task.id} completed successfully`);
  } catch (error: any) {
    if (error.message === 'Cancelled') {
      updateTaskStatus(task.id, 'cancelled');
      await postStatusUpdate(task.id, 'cancelled');
      await postLog(task.id, 'system', '🚫 Task cancelled');
      console.log(`Task ${task.id} cancelled`);
    } else {
      updateTaskStatus(task.id, 'failed', error.message);
      await postStatusUpdate(task.id, 'failed');
      await postLog(task.id, 'system', `❌ Task failed: ${error.message}`);
      console.log(`Task ${task.id} failed: ${error.message}`);
    }
    
    cleanupProcess(task.id);
  }
  } catch (error: any) {
    // Ignore database busy errors during startup
    if (error.code !== 'SQLITE_BUSY') {
      console.error('Error in processNextTask:', error.message);
    }
  }
}

async function main() {
  console.log('🤖 Worker started, polling for tasks...');
  
  setInterval(async () => {
    try {
      await processNextTask();
    } catch (error) {
      console.error('Error processing task:', error);
    }
  }, POLL_INTERVAL);
}

main();
