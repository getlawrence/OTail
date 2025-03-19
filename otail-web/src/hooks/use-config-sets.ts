import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { configSetsApi } from '@/api/configSets';
import type { ConfigSet, CreateConfigSetRequest, UpdateConfigSetRequest } from '@/types/configSet';

export function useConfigSets() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const saveToConfigSet = async (
    name: string,
    configuration: any,
    options: {
      description?: string;
      tags?: string[];
    } = {}
  ) => {
    try {
      setLoading(true);
      const data: CreateConfigSetRequest = {
        name,
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

  const updateConfigSet = async (id: string, configuration: any) => {
    try {
      setLoading(true);
      const data: UpdateConfigSetRequest = {
        id,
        configuration,
      };
      await configSetsApi.update(data);
      toast({
        title: 'Success',
        description: 'Configuration updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
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
    updateConfigSet,
    loadConfigSet,
    listConfigSets,
  };
} 