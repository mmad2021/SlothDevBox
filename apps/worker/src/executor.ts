import { spawn } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { postLog, postArtifact } from './api-client';
import { isCancelRequested } from './database';
import type { RecipeStep, TaskInput, Project } from '@devcenter/shared';
import os from 'os';

const runningProcesses = new Map<string, any>();

function interpolate(str: string, variables: Record<string, any>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? String(variables[key]) : match;
  });
}

function isCommandAllowed(command: string): boolean {
  const allowed = ['git', 'bun', 'gh', 'node', 'npm', 'pnpm', 'yarn', 'copilot'];
  return allowed.includes(command);
}

async function executeCommand(
  taskId: string,
  step: RecipeStep,
  cwd: string,
  variables: Record<string, any>
): Promise<{ success: boolean; output: string }> {
  const command = step.command!;
  const args = (step.args || []).map(arg => interpolate(arg, variables));
  
  if (!isCommandAllowed(command)) {
    throw new Error(`Command not allowed: ${command}`);
  }
  
  const fullCommand = [command, ...args].join(' ');
  if (fullCommand.includes('rm -rf') || fullCommand.includes('sudo')) {
    throw new Error(`Dangerous command blocked: ${fullCommand}`);
  }
  
  await postLog(taskId, 'system', `$ ${command} ${args.join(' ')}`);
  
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { cwd, shell: false });
    
    if (step.keepAlive) {
      runningProcesses.set(taskId, proc);
    }
    
    let output = '';
    let readyDetected = false;
    
    proc.stdout?.on('data', async (data) => {
      const text = data.toString();
      output += text;
      
      const lines = text.split('\n').filter((l: string) => l.trim());
      for (const line of lines) {
        await postLog(taskId, 'stdout', line);
        
        if (step.detectReady && line.includes(step.detectReady)) {
          readyDetected = true;
        }
      }
    });
    
    proc.stderr?.on('data', async (data) => {
      const text = data.toString();
      output += text;
      
      const lines = text.split('\n').filter((l: string) => l.trim());
      for (const line of lines) {
        await postLog(taskId, 'stderr', line);
        
        if (step.detectReady && line.includes(step.detectReady)) {
          readyDetected = true;
        }
      }
    });
    
    if (step.keepAlive && step.detectReady) {
      const checkInterval = setInterval(() => {
        if (readyDetected) {
          clearInterval(checkInterval);
          resolve({ success: true, output });
        }
        
        if (isCancelRequested(taskId)) {
          clearInterval(checkInterval);
          proc.terminate();
          reject(new Error('Cancelled'));
        }
      }, 500);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!readyDetected) {
          resolve({ success: true, output });
        }
      }, 60000);
    } else {
      proc.on('close', (code) => {
        if (step.keepAlive) {
          resolve({ success: true, output });
        } else {
          resolve({ success: code === 0, output });
        }
      });
      
      proc.on('error', (error) => {
        reject(error);
      });
    }
  });
}

export async function executeRecipe(
  taskId: string,
  steps: RecipeStep[],
  project: Project,
  input: TaskInput
): Promise<void> {
  const variables = {
    ...input,
    defaultDevPort: project.defaultDevPort,
    projectName: project.name,
    projectPath: project.path,
  };
  
  // Always use the project's path as the working directory
  const cwd = project.path;
  const commandTranscript: string[] = [];
  
  for (let i = 0; i < steps.length; i++) {
    if (isCancelRequested(taskId)) {
      await postLog(taskId, 'system', 'Task cancelled by user');
      
      const proc = runningProcesses.get(taskId);
      if (proc) {
        proc.terminate();
        runningProcesses.delete(taskId);
      }
      
      throw new Error('Cancelled');
    }
    
    const step = steps[i];
    await postLog(taskId, 'system', `Step ${i + 1}/${steps.length}: ${step.type}`);
    
    try {
      if (step.type === 'check_path') {
        if (!existsSync(cwd)) {
          throw new Error(`Project path does not exist: ${cwd}`);
        }
        await postLog(taskId, 'system', `✓ Project path exists: ${cwd}`);
      } else if (step.type === 'create_directory') {
        await executeCreateDirectory(taskId, step, cwd, variables);
      } else if (step.type === 'write_file') {
        await executeWriteFile(taskId, step, cwd, variables);
      } else if (step.type === 'start_preview') {
        const result = await executeCommand(taskId, step, cwd, variables);
        commandTranscript.push(`${step.command} ${step.args?.join(' ')}`);
        
        const host = process.env.PUBLIC_HOST || os.hostname();
        const previewUrl = `http://${host}:${variables.defaultDevPort}`;
        await postArtifact(taskId, 'preview_url', previewUrl);
        await postLog(taskId, 'system', `✓ Preview available at: ${previewUrl}`);
      } else if (step.type === 'command' || step.type === 'git') {
        const result = await executeCommand(taskId, step, cwd, variables);
        commandTranscript.push(`${step.command} ${step.args?.join(' ')}`);
        
        if (!result.success) {
          throw new Error(`Command failed: ${step.command}`);
        }
        
        if (step.type === 'git' && step.command === 'git' && step.args?.[0] === 'diff') {
          await postArtifact(taskId, 'diff_summary', result.output || '(no changes)');
        }
      } else if (step.type === 'copilot') {
        const result = await executeCommand(taskId, step, cwd, variables);
        commandTranscript.push(`${step.command} ${step.args?.join(' ')}`);
        
        await postArtifact(taskId, 'notes', result.output);
      }
    } catch (error: any) {
      await postLog(taskId, 'system', `✗ Error: ${error.message}`);
      throw error;
    }
  }
  
  if (commandTranscript.length > 0) {
    await postArtifact(taskId, 'command_transcript', commandTranscript.join('\n'));
  }
}

export function cleanupProcess(taskId: string) {
  const proc = runningProcesses.get(taskId);
  if (proc) {
    proc.terminate();
    runningProcesses.delete(taskId);
  }
}
