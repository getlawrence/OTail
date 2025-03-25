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

const STORAGE_KEY = 'otail_deployments';
const CONFIG_PROFILES_KEY = 'otail_configuration_profiles';

class LocalDeploymentsStorage {
  private getDeployments(): Deployment[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveDeployments(deployments: Deployment[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deployments));
  }

  private getConfigurationProfiles(): ConfigurationProfile[] {
    const data = localStorage.getItem(CONFIG_PROFILES_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveConfigurationProfiles(profiles: ConfigurationProfile[]): void {
    localStorage.setItem(CONFIG_PROFILES_KEY, JSON.stringify(profiles));
  }

  // Deployments
  async list(): Promise<DeploymentListResponse> {
    const deployments = this.getDeployments();
    return {
      deployments,
      total: deployments.length,
    };
  }

  async get(id: string): Promise<Deployment> {
    const deployments = this.getDeployments();
    const deployment = deployments.find((d) => d.id === id);
    if (!deployment) {
      throw new Error(`Deployment with id ${id} not found`);
    }
    return deployment;
  }

  async create(data: CreateDeploymentRequest): Promise<Deployment> {
    const deployments = this.getDeployments();
    const newDeployment: Deployment = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      environment: data.environment,
      agentGroups: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    deployments.push(newDeployment);
    this.saveDeployments(deployments);
    return newDeployment;
  }

  async update(data: UpdateDeploymentRequest): Promise<Deployment> {
    const deployments = this.getDeployments();
    const index = deployments.findIndex((d) => d.id === data.id);
    if (index === -1) {
      throw new Error(`Deployment with id ${data.id} not found`);
    }

    const updatedDeployment: Deployment = {
      ...deployments[index],
      name: data.name ?? deployments[index].name,
      description: data.description ?? deployments[index].description,
      environment: data.environment ?? deployments[index].environment,
      agentGroups: data.agentGroups ? data.agentGroups.map(group => ({
        ...group,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        agents: [],
      })) : deployments[index].agentGroups,
      updatedAt: new Date().toISOString(),
    };

    deployments[index] = updatedDeployment;
    this.saveDeployments(deployments);
    return updatedDeployment;
  }

  async delete(id: string): Promise<void> {
    const deployments = this.getDeployments();
    const filtered = deployments.filter((d) => d.id !== id);
    this.saveDeployments(filtered);
  }

  // Agent Groups
  async createAgentGroup(data: CreateAgentGroupRequest): Promise<AgentGroup> {
    const deployments = this.getDeployments();
    const deploymentIndex = deployments.findIndex((d) => d.id === data.deploymentId);
    if (deploymentIndex === -1) {
      throw new Error(`Deployment with id ${data.deploymentId} not found`);
    }

    const newGroup: AgentGroup = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      role: data.role,
      configProfileId: data.configProfileId,
      agents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    deployments[deploymentIndex].agentGroups.push(newGroup);
    this.saveDeployments(deployments);
    return newGroup;
  }

  async updateAgentGroup(data: UpdateAgentGroupRequest): Promise<AgentGroup> {
    const deployments = this.getDeployments();
    const deploymentIndex = deployments.findIndex((d) => d.id === data.deploymentId);
    if (deploymentIndex === -1) {
      throw new Error(`Deployment with id ${data.deploymentId} not found`);
    }

    const groupIndex = deployments[deploymentIndex].agentGroups.findIndex(
      (g) => g.id === data.id
    );
    if (groupIndex === -1) {
      throw new Error(`Agent group with id ${data.id} not found`);
    }

    const updatedGroup: AgentGroup = {
      ...deployments[deploymentIndex].agentGroups[groupIndex],
      name: data.name ?? deployments[deploymentIndex].agentGroups[groupIndex].name,
      description: data.description ?? deployments[deploymentIndex].agentGroups[groupIndex].description,
      role: data.role ?? deployments[deploymentIndex].agentGroups[groupIndex].role,
      configProfileId: data.configProfileId ?? deployments[deploymentIndex].agentGroups[groupIndex].configProfileId,
      updatedAt: new Date().toISOString(),
    };

    deployments[deploymentIndex].agentGroups[groupIndex] = updatedGroup;
    this.saveDeployments(deployments);
    return updatedGroup;
  }

  async deleteAgentGroup(deploymentId: string, groupId: string): Promise<void> {
    const deployments = this.getDeployments();
    const deploymentIndex = deployments.findIndex((d) => d.id === deploymentId);
    if (deploymentIndex === -1) {
      throw new Error(`Deployment with id ${deploymentId} not found`);
    }

    deployments[deploymentIndex].agentGroups = deployments[deploymentIndex].agentGroups.filter(
      (g) => g.id !== groupId
    );
    this.saveDeployments(deployments);
  }

  // Configuration Profiles
  async listConfigurationProfiles(): Promise<ConfigurationProfile[]> {
    return this.getConfigurationProfiles();
  }

  async getConfigurationProfile(id: string): Promise<ConfigurationProfile> {
    const profiles = this.getConfigurationProfiles();
    const profile = profiles.find((p) => p.id === id);
    if (!profile) {
      throw new Error(`Configuration profile with id ${id} not found`);
    }
    return profile;
  }

  async createConfigurationProfile(data: CreateConfigurationProfileRequest): Promise<ConfigurationProfile> {
    const profiles = this.getConfigurationProfiles();
    const newProfile: ConfigurationProfile = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      version: '1.0.0',
      configuration: data.configuration,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    profiles.push(newProfile);
    this.saveConfigurationProfiles(profiles);
    return newProfile;
  }

  async updateConfigurationProfile(data: UpdateConfigurationProfileRequest): Promise<ConfigurationProfile> {
    const profiles = this.getConfigurationProfiles();
    const index = profiles.findIndex((p) => p.id === data.id);
    if (index === -1) {
      throw new Error(`Configuration profile with id ${data.id} not found`);
    }

    const updatedProfile: ConfigurationProfile = {
      ...profiles[index],
      name: data.name ?? profiles[index].name,
      description: data.description ?? profiles[index].description,
      configuration: data.configuration ?? profiles[index].configuration,
      version: `${parseFloat(profiles[index].version) + 0.1}`,
      updatedAt: new Date().toISOString(),
    };

    profiles[index] = updatedProfile;
    this.saveConfigurationProfiles(profiles);
    return updatedProfile;
  }

  async deleteConfigurationProfile(id: string): Promise<void> {
    const profiles = this.getConfigurationProfiles();
    const filtered = profiles.filter((p) => p.id !== id);
    this.saveConfigurationProfiles(filtered);
  }
}

export const localDeploymentsStorage = new LocalDeploymentsStorage(); 