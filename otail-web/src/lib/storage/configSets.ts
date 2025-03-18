import type { ConfigSet, ConfigSetListResponse, CreateConfigSetRequest, UpdateConfigSetRequest } from '@/types/configSet';

const CONFIG_SETS_KEY = 'otail_config_sets';

function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function getStoredConfigSets(): ConfigSet[] {
  try {
    const stored = localStorage.getItem(CONFIG_SETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse stored config sets:', error);
    return [];
  }
}

function saveConfigSets(configSets: ConfigSet[]): void {
  localStorage.setItem(CONFIG_SETS_KEY, JSON.stringify(configSets));
}

export const localConfigSetsStorage = {
  list: async (params?: { type?: string }): Promise<ConfigSetListResponse> => {
    const configSets = getStoredConfigSets();
    const filtered = params?.type 
      ? configSets.filter(set => set.type === params.type)
      : configSets;
    
    return {
      configSets: filtered,
      total: filtered.length,
    };
  },

  get: async (id: string): Promise<ConfigSet> => {
    const configSets = getStoredConfigSets();
    const configSet = configSets.find(set => set.id === id);
    if (!configSet) {
      throw new Error('Config set not found');
    }
    return configSet;
  },

  create: async (data: CreateConfigSetRequest): Promise<ConfigSet> => {
    const configSets = getStoredConfigSets();
    const now = new Date().toISOString();
    const newConfigSet: ConfigSet = {
      id: generateId(),
      ...data,
      createdAt: now,
      updatedAt: now,
      version: '1',
    };
    
    configSets.push(newConfigSet);
    saveConfigSets(configSets);
    return newConfigSet;
  },

  update: async (data: UpdateConfigSetRequest): Promise<ConfigSet> => {
    const configSets = getStoredConfigSets();
    const index = configSets.findIndex(set => set.id === data.id);
    
    if (index === -1) {
      throw new Error('Config set not found');
    }

    const updatedConfigSet: ConfigSet = {
      ...configSets[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    configSets[index] = updatedConfigSet;
    saveConfigSets(configSets);
    return updatedConfigSet;
  },

  delete: async (id: string): Promise<void> => {
    const configSets = getStoredConfigSets();
    const filtered = configSets.filter(set => set.id !== id);
    saveConfigSets(filtered);
  },
}; 