import type {
  CreateConfigSetRequest,
  UpdateConfigSetRequest,
} from '../types/configSet';
import { localConfigSetsStorage } from '@/lib/storage/configSets';

export const configSetsApi = {
  list: async () => {
    return localConfigSetsStorage.list();
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