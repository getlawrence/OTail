import { apiClient } from './client';

export interface OpampAgent {
  InstanceIdStr: string;
  Status?: {
    Health?: {
      Up: boolean;
    };
    AgentVersion?: string;
    EffectiveConfigHash?: string;
  };
  StartedAt?: Date;
}

export interface OpampAgents {
  [key: string]: OpampAgent;
}

export const opampServer = {
  GetAgentsByGroup: async (groupId: string): Promise<OpampAgents> => {
    const response = await apiClient.get<OpampAgents>(`/api/v1/opamp/groups/${groupId}/agents`);
    return response.data;
  },
}; 