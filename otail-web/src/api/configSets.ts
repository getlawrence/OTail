import type {
  ConfigSet,
  ConfigSetListResponse,
  CreateConfigSetRequest,
  UpdateConfigSetRequest,
} from '../types/configSet';
import { localConfigSetsStorage } from '@/lib/storage/configSets';

interface ListParams {
  page?: number;
  limit?: number;
  type?: string;
}

export const configSetsApi = {
  list: async (params?: ListParams) => {
    return localConfigSetsStorage.list(params);
  },

  get: async (id: string) => {
    return localConfigSetsStorage.get(id);
  },

  create: async (data: CreateConfigSetRequest) => {
    return localConfigSetsStorage.create(data);
  },

  update: async (data: UpdateConfigSetRequest) => {
    return localConfigSetsStorage.update(data);
  },

  delete: async (id: string) => {
    await localConfigSetsStorage.delete(id);
  },
}; 