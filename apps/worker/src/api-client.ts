import type { TaskInput } from '@devcenter/shared';

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8787';
const TOKEN = process.env.CONTROL_PLANE_TOKEN;

export async function postLog(
  taskId: string,
  stream: 'stdout' | 'stderr' | 'system',
  line: string
) {
  try {
    await fetch(`${API_BASE_URL}/api/tasks/${taskId}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({
        ts: new Date().toISOString(),
        stream,
        line,
      }),
    });
  } catch (error) {
    console.error('Failed to post log:', error);
  }
}

export async function postArtifact(
  taskId: string,
  type: 'preview_url' | 'diff_summary' | 'notes' | 'command_transcript',
  value: string
) {
  try {
    await fetch(`${API_BASE_URL}/api/tasks/${taskId}/artifacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ type, value }),
    });
  } catch (error) {
    console.error('Failed to post artifact:', error);
  }
}

export async function postStatusUpdate(taskId: string, status: string) {
  try {
    await fetch(`${API_BASE_URL}/api/tasks/${taskId}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${TOKEN}`,
      },
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    console.error('Failed to post status update:', error);
  }
}
