import type { Pipeline, PipelineListResponse, CreatePipelineRequest, UpdatePipelineRequest } from '@/types/pipeline';

const PIPELINES_KEY = 'otail_pipelines';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getStoredPipelines(): Pipeline[] {
  try {
    const stored = localStorage.getItem(PIPELINES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse stored pipelines:', error);
    return [];
  }
}

function savePipelines(pipelines: Pipeline[]): void {
  localStorage.setItem(PIPELINES_KEY, JSON.stringify(pipelines));
}

export const localPipelinesStorage = {
  list: async (): Promise<PipelineListResponse> => {
    const pipelines = getStoredPipelines();
    
    return {
      pipelines: pipelines,
      total: pipelines.length,
    };
  },

  get: async (id: string): Promise<Pipeline> => {
    const pipelines = getStoredPipelines();
    const pipeline = pipelines.find(p => p.id === id);
    if (!pipeline) {
      throw new Error('Pipeline not found');
    }
    return pipeline;
  },

  create: async (data: CreatePipelineRequest): Promise<Pipeline> => {
    const pipelines = getStoredPipelines();
    const now = new Date().toISOString();
    const newPipeline: Pipeline = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
      version: '1',
    };
    pipelines.push(newPipeline);
    savePipelines(pipelines);
    return newPipeline;
  },

  update: async (data: UpdatePipelineRequest): Promise<Pipeline> => {
    const pipelines = getStoredPipelines();
    const index = pipelines.findIndex(p => p.id === data.id);
    if (index === -1) {
      throw new Error('Pipeline not found');
    }
    const now = new Date().toISOString();
    const updatedPipeline: Pipeline = {
      ...pipelines[index],
      ...data,
      updatedAt: now,
    };
    pipelines[index] = updatedPipeline;
    savePipelines(pipelines);
    return updatedPipeline;
  },

  delete: async (id: string): Promise<void> => {
    const pipelines = getStoredPipelines();
    const filtered = pipelines.filter(p => p.id !== id);
    savePipelines(filtered);
  },
}; 