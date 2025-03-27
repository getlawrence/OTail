import type {
  CreatePipelineRequest,
  UpdatePipelineRequest,
} from '../types/pipeline';
import { localPipelinesStorage } from '@/lib/storage/pipelines';

export const pipelinesApi = {
  list: async () => {
    return localPipelinesStorage.list();
  },

  get: async (id: string) => {
    return localPipelinesStorage.get(id);
  },

  create: async (data: CreatePipelineRequest) => {
    return localPipelinesStorage.create(data);
  },

  update: async (data: UpdatePipelineRequest) => {
    return localPipelinesStorage.update(data);
  },

  delete: async (id: string) => {
    await localPipelinesStorage.delete(id);
  },
}; 