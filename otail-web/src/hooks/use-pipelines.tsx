import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { pipelinesApi } from '@/api/pipelines';
import type { Pipeline, CreatePipelineRequest, UpdatePipelineRequest } from '@/types/pipeline';

export function usePipelines() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const saveToPipeline = async (
    name: string,
    configuration: any,
    options: {
      description?: string;
      tags?: string[];
    } = {}
  ) => {
    try {
      setLoading(true);
      const data: CreatePipelineRequest = {
        name,
        configuration,
        ...options,
      };
      await pipelinesApi.create(data);
      toast({
        title: 'Success',
        description: 'Configuration saved as pipeline',
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

  const updatePipeline = async (id: string, configuration: any) => {
    try {
      setLoading(true);
      const data: UpdatePipelineRequest = {
        id,
        configuration,
      };
      await pipelinesApi.update(data);
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

  const loadPipeline = async (id: string): Promise<Pipeline> => {
    try {
      setLoading(true);
      return await pipelinesApi.get(id);
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

  const listPipelines = async () => {
    try {
      setLoading(true);
      const response = await pipelinesApi.list();
      return response.pipelines;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pipelines',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    saveToPipeline,
    updatePipeline,
    loadPipeline,
    listPipelines,
  };
} 