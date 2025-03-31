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
  config: string;
  agent_ids: string[];
  deployment_id: string;
  created_at: string;
  updated_at: string;
}

export interface Deployment {
  id: string;
  name: string;
  groupIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DeploymentListResponse {
  deployments: Deployment[];
  total: number;
}

export interface CreateDeploymentRequest {
  name: string;
}

export interface UpdateDeploymentRequest {
  name: string;
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

export interface AgentGroupFormData {
  name: string;
  config: string;
  deploymentId: string;
}

export interface DeploymentFormData {
  name: string;
  groupIds: string[];
} 