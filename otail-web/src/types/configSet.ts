export interface ConfigSet {
  id: string;
  name: string;
  description?: string;
  configuration: any; // Will be typed based on the component type
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  version: string;
}

export interface ConfigSetListResponse {
  configSets: ConfigSet[];
  total: number;
}

export interface CreateConfigSetRequest {
  name: string;
  description?: string;
  configuration: any;
  tags?: string[];
}

export interface UpdateConfigSetRequest extends Partial<CreateConfigSetRequest> {
  id: string;
} 