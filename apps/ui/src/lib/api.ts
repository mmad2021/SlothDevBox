// Use environment variable or fallback to relative path for dev proxy
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function setApiToken(token: string) {
  localStorage.setItem('api_token', token);
}

export function getApiToken(): string {
  return localStorage.getItem('api_token') || '';
}

export function clearApiToken() {
  localStorage.removeItem('api_token');
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = getApiToken();
  
  const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    if (response.status === 401) {
      // Invalid token - clear it and redirect to login
      clearApiToken();
      window.location.href = '/login';
      throw new Error('Unauthorized: Invalid token');
    }
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  
  return response.json();
}

export const api = {
  getHealth: () => fetch(`${API_BASE_URL}/api/health`).then(r => r.json()),
  
  getProjects: () => fetchApi('/projects'),
  createProject: (data: any) => fetchApi('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  getStepTemplates: () => fetchApi('/step-templates'),
  getStepTemplate: (id: string) => fetchApi(`/step-templates/${id}`),
  createStepTemplate: (data: any) => fetchApi('/step-templates', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStepTemplate: (id: string, data: any) => fetchApi(`/step-templates/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteStepTemplate: (id: string) => fetchApi(`/step-templates/${id}`, {
    method: 'DELETE',
  }),
  
  getRecipes: () => fetchApi('/recipes'),
  getRecipe: (id: string) => fetchApi(`/recipes/${id}`),
  createRecipe: (data: any) => fetchApi('/recipes', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateRecipe: (id: string, data: any) => fetchApi(`/recipes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  deleteRecipe: (id: string) => fetchApi(`/recipes/${id}`, {
    method: 'DELETE',
  }),
  
  getTasks: () => fetchApi('/tasks'),
  getTask: (id: string) => fetchApi(`/tasks/${id}`),
  createTask: (data: any) => fetchApi('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  cancelTask: (id: string) => fetchApi(`/tasks/${id}/cancel`, {
    method: 'POST',
  }),
  
  // Filesystem browsing
  getFilesystemRoots: () => fetchApi('/filesystem/roots'),
  browseFilesystem: (path?: string) => fetchApi(`/filesystem/browse${path ? `?path=${encodeURIComponent(path)}` : ''}`),
};
