import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { configSetsApi } from '@/api/configSets';
import type { ConfigSet, CreateConfigSetRequest, ComponentType } from '@/types/configSet';

export function useConfigSets() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const saveToConfigSet = async (
    name: string,
    type: 'full' | 'component',
    configuration: any,
    options: {
      description?: string;
      componentType?: ComponentType;
      tags?: string[];
    } = {}
  ) => {
    try {
      setLoading(true);
      const data: CreateConfigSetRequest = {
        name,
        type,
        configuration,
        ...options,
      };
      await configSetsApi.create(data);
      toast({
        title: 'Success',
        description: 'Configuration saved as config set',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadConfigSet = async (id: string): Promise<ConfigSet> => {
    try {
      setLoading(true);
      return await configSetsApi.get(id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load configuration',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const listConfigSets = async (type?: string) => {
    try {
      setLoading(true);
      const response = await configSetsApi.list({ type });
      return response.configSets;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load config sets',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    saveToConfigSet,
    loadConfigSet,
    listConfigSets,
  };
} 