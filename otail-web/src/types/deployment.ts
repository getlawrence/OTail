export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  configuration: {
    receivers: Record<string, any>;
    processors: Record<string, any>;
    exporters: Record<string, any>;
    service: {
      pipelines: Record<string, {
        receivers: string[];
        processors: string[];
        exporters: string[];
      }>;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  status: 'online' | 'offline' | 'error';
  version: string;
  configVersion: string;
  lastSeen: string;
  pipelineId?: string;  // Optional reference to a specific pipeline configuration
  metrics?: {
    cpu?: number;
    memory?: number;
    uptime?: number;
  };
}

export interface ConfigurationProfile {
  id: string;
  name: string;
  version: string;
  description?: string;
  configuration: {
    receivers: Record<string, any>;
    processors: Record<string, any>;
    exporters: Record<string, any>;
    service: {
      pipelines: Record<string, {
        receivers: string[];
        processors: string[];
        exporters: string[];
      }>;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface AgentGroup {
  id: string;
  name: string;
  description?: string;
  role: string;
  pipelineId?: string;  // Optional reference to a pipeline configuration for the group
  agents: Agent[];
  createdAt: string;
  updatedAt: string;
}

export interface Deployment {
  id: string;
  name: string;
  description?: string;
  environment: string;
  pipelineId?: string;  // Optional reference to a pipeline configuration for the entire deployment
  agentGroups: AgentGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentListResponse {
  deployments: Deployment[];
  total: number;
}

export interface CreateDeploymentRequest {
  name: string;
  description?: string;
  environment: string;
  agentGroups: Omit<AgentGroup, 'id' | 'createdAt' | 'updatedAt'>[];
}

export interface UpdateDeploymentRequest extends Partial<CreateDeploymentRequest> {
  id: string;
}

export interface CreateAgentGroupRequest {
  name: string;
  description?: string;
  role: string;
  pipelineId: string;
  deploymentId: string;
}

export interface UpdateAgentGroupRequest extends Partial<CreateAgentGroupRequest> {
  id: string;
}

export interface CreateConfigurationProfileRequest {
  name: string;
  description?: string;
  configuration: ConfigurationProfile['configuration'];
}

export interface UpdateConfigurationProfileRequest extends Partial<CreateConfigurationProfileRequest> {
  id: string;
} 