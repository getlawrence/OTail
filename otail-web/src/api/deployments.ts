import { localDeploymentsStorage } from '@/lib/storage/deployments';
import type {
  Deployment,
  DeploymentListResponse,
  CreateDeploymentRequest,
  UpdateDeploymentRequest,
  AgentGroup,
  CreateAgentGroupRequest,
  UpdateAgentGroupRequest,
  ConfigurationProfile,
  CreateConfigurationProfileRequest,
  UpdateConfigurationProfileRequest,
} from '@/types/deployment';

export const deploymentsApi = {
  list: async (): Promise<DeploymentListResponse> => {
    return localDeploymentsStorage.list();
  },

  get: async (id: string): Promise<Deployment> => {
    return localDeploymentsStorage.get(id);
  },

  create: async (data: CreateDeploymentRequest): Promise<Deployment> => {
    return localDeploymentsStorage.create(data);
  },

  update: async (data: UpdateDeploymentRequest): Promise<Deployment> => {
    return localDeploymentsStorage.update(data);
  },

  delete: async (id: string): Promise<void> => {
    return localDeploymentsStorage.delete(id);
  },

  // Agent Groups
  createAgentGroup: async (data: CreateAgentGroupRequest): Promise<AgentGroup> => {
    return localDeploymentsStorage.createAgentGroup(data);
  },

  updateAgentGroup: async (data: UpdateAgentGroupRequest): Promise<AgentGroup> => {
    return localDeploymentsStorage.updateAgentGroup(data);
  },

  deleteAgentGroup: async (deploymentId: string, groupId: string): Promise<void> => {
    return localDeploymentsStorage.deleteAgentGroup(deploymentId, groupId);
  },

  // Configuration Profiles
  listConfigurationProfiles: async (): Promise<ConfigurationProfile[]> => {
    return localDeploymentsStorage.listConfigurationProfiles();
  },

  getConfigurationProfile: async (id: string): Promise<ConfigurationProfile> => {
    return localDeploymentsStorage.getConfigurationProfile(id);
  },

  createConfigurationProfile: async (data: CreateConfigurationProfileRequest): Promise<ConfigurationProfile> => {
    return localDeploymentsStorage.createConfigurationProfile(data);
  },

  updateConfigurationProfile: async (data: UpdateConfigurationProfileRequest): Promise<ConfigurationProfile> => {
    return localDeploymentsStorage.updateConfigurationProfile(data);
  },

  deleteConfigurationProfile: async (id: string): Promise<void> => {
    return localDeploymentsStorage.deleteConfigurationProfile(id);
  },
}; 