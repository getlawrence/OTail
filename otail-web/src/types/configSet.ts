export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  configuration: any; // Will be typed based on the component type
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  version: string;
}

export interface PipelineListResponse {
  pipelines: Pipeline[];
  total: number;
}

export interface CreatePipelineRequest {
  name: string;
  description?: string;
  configuration: any;
  tags?: string[];
}

export interface UpdatePipelineRequest extends Partial<CreatePipelineRequest> {
  id: string;
} 