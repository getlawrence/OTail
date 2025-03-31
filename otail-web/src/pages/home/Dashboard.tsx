import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { deploymentsApi } from '@/api/deployments';
import type { Deployment, CreateDeploymentRequest } from '@/types/deployment';
import { DeploymentForm } from '@/components/deployment/DeploymentForm';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PipelineForm } from '@/components/config/PipelineForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useActivePipeline } from '@/hooks/use-active-pipeline';
import { WaveformIcon } from '@/components/icons/WaveformIcon';
import { pipelinesApi } from '@/api/pipelines';
import { Pipeline } from '@/types/pipeline';
import { FlowVisualizer } from '@/components/visualization/FlowVisualizer';
import OtelConfigCanvas from '@/components/canvas/OtelConfigCanvas';

export default function Dashboard() {
  const [recentDeployments, setRecentDeployments] = useState<Deployment[]>([]);
  const [recentPipelines, setRecentPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeploymentFormOpen, setIsDeploymentFormOpen] = useState(false);
  const [isPipelineFormOpen, setIsPipelineFormOpen] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setActive } = useActivePipeline();

  useEffect(() => {
    Promise.all([
      loadRecentDeployments(),
      loadRecentPipelines()
    ]).finally(() => setLoading(false));
  }, []);

  const loadRecentDeployments = async () => {
    try {
      const response = await deploymentsApi.list();
      const recent = response
        .sort((a: Deployment, b: Deployment) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentDeployments(recent);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load recent deployments',
        variant: 'destructive',
      });
    }
  };

  const loadRecentPipelines = async () => {
    try {
      const response = await pipelinesApi.list();
      // Sort by createdAt and take the 5 most recent
      const recent = response.pipelines
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentPipelines(recent);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load recent pipelines',
        variant: 'destructive',
      });
    }
  };

  const handleCreateDeployment = async (data: Partial<Deployment>) => {
    try {
      if (!data.name) {
        toast({
          title: 'Error',
          description: 'Name is required',
          variant: 'destructive',
        });
        return;
      }

      const createData: CreateDeploymentRequest = {
        name: data.name,
      };

      await deploymentsApi.create(createData);
      toast({
        title: 'Success',
        description: 'Deployment created successfully',
      });
      loadRecentDeployments();
      const newPipeline = await pipelinesApi.create({
        name: data.name,
        configuration: ''
      });
      await setActive(newPipeline.id);
      // Dispatch pipeline created event
      window.dispatchEvent(new Event('pipelineCreated'));
      toast({
        title: 'Success',
        description: 'Pipeline created successfully',
      });
      loadRecentPipelines();
      setIsDeploymentFormOpen(false);
      navigate('/deployments'); // Navigate to the deployments page
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create deployment',
        variant: 'destructive',
      });
    }
  };

  const handleCreatePipeline = async (data: Partial<Pipeline>) => {
    try {
      if (!data.name) {
        toast({
          title: 'Error',
          description: 'Name is required',
          variant: 'destructive',
        });
        return;
      }

      const createData = {
        name: data.name,
        description: data.description,
        configuration: ''
      };

      await pipelinesApi.create(createData);
      toast({
        title: 'Success',
        description: 'Pipeline created successfully',
      });
      loadRecentPipelines();
      setIsPipelineFormOpen(false);
      navigate('/deployments'); // Navigate to the deployments page
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create pipeline',
        variant: 'destructive',
      });
    }
  };

  const handleViewDeployment = (deployment: Deployment) => {
    setSelectedDeployment(deployment);
  };

  const handleSetActive = async (pipeline: Pipeline) => {
    try {
      await setActive(pipeline.id);
      setSelectedPipeline(pipeline);
      toast({
        title: 'Success',
        description: 'Pipeline set as active',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set pipeline as active',
        variant: 'destructive',
      });
    }
  };

  const handleNodeClick = (nodeId: string, type: string) => {
    console.log(`Clicked ${type} node: ${nodeId}`);
    // Handle node click based on type
    switch (type) {
      case 'deployment':
        const deployment = recentDeployments.find(d => `deployment-${d.id}` === nodeId);
        if (deployment) handleViewDeployment(deployment);
        break;
      case 'pipelineComponent':
        // Handle pipeline component click
        break;
      default:
        break;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Welcome to OTail</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Recent Deployments List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Recent Deployments
            </CardTitle>
            <CardDescription>Your recently accessed deployments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button
                id="new-deployment-button"
                onClick={() => setIsDeploymentFormOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> New Deployment
              </Button>
            </div>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : recentDeployments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No recent deployments found
              </div>
            ) : (
              <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
                {recentDeployments.map((deployment) => (
                  <Card
                    key={deployment.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{deployment.name}</h3>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline">
                              {deployment.groupIds?.length || 0} Agent Groups
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-sm text-muted-foreground">
                            {new Date(deployment.createdAt).toLocaleDateString()}
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => handleViewDeployment(deployment)}
                          >
                            <Network className="w-4 h-4" /> View Visualization
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Pipelines List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <WaveformIcon className="h-5 w-5" />
              Recent Pipelines
            </CardTitle>
            <CardDescription>Your recently accessed pipelines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <Button
                id="new-pipeline-button"
                onClick={() => setIsPipelineFormOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> New Pipeline
              </Button>
            </div>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : recentPipelines.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No recent pipelines found
              </div>
            ) : (
              <div className="space-y-4 h-[400px] overflow-y-auto pr-2">
                {recentPipelines.map((pipeline) => (
                  <Card
                    key={pipeline.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{pipeline.name}</h3>
                          <p className="text-sm text-muted-foreground">{pipeline.description}</p>
                          <div className="flex gap-2 mt-2">
                            {pipeline.tags?.map((tag) => (
                              <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-sm text-muted-foreground">
                            {new Date(pipeline.createdAt).toLocaleDateString()}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => setSelectedPipeline(pipeline)}
                            >
                              <WaveformIcon className="w-4 h-4" /> View Visualization
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex items-center gap-2"
                              onClick={() => handleSetActive(pipeline)}
                            >
                              <Pencil className="w-4 h-4" /> Edit Pipeline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deployment Visualization Dialog */}
      <Dialog open={!!selectedDeployment} onOpenChange={(open) => !open && setSelectedDeployment(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Deployment Visualization
            </DialogTitle>
            <DialogDescription>
              Visual representation of the selected deployment configuration
            </DialogDescription>
          </DialogHeader>
          {selectedDeployment && (
            <div className="mt-4">
              <FlowVisualizer
                deployment={selectedDeployment}
                onNodeClick={handleNodeClick}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pipeline Visualization Dialog */}
      <Dialog open={!!selectedPipeline} onOpenChange={(open) => !open && setSelectedPipeline(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <WaveformIcon className="h-5 w-5" />
              Pipeline Visualization
            </DialogTitle>
            <DialogDescription>
              Visual representation of the selected pipeline configuration
            </DialogDescription>
          </DialogHeader>
          {selectedPipeline && (
            <div className="mt-4 h-[600px]">
              <OtelConfigCanvas
                initialYaml={selectedPipeline.configuration}
                onChange={(yaml: string) => {
                  // Handle configuration changes if needed
                  console.log('Pipeline configuration updated:', yaml);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Deployment Form Dialog */}
      <Dialog open={isDeploymentFormOpen} onOpenChange={setIsDeploymentFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Deployment</DialogTitle>
            <DialogDescription>
              Create a new deployment that can be reused later.
            </DialogDescription>
          </DialogHeader>
          <DeploymentForm
            onSubmit={handleCreateDeployment}
            onCancel={() => setIsDeploymentFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Pipeline Form Dialog */}
      <Dialog open={isPipelineFormOpen} onOpenChange={setIsPipelineFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Pipeline</DialogTitle>
            <DialogDescription>
              Create a new pipeline that can be reused later.
            </DialogDescription>
          </DialogHeader>
          <PipelineForm
            onSubmit={handleCreatePipeline}
            onCancel={() => setIsPipelineFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 