import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Clock, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useActivePipeline } from '@/hooks/use-active-pipeline';
import { WaveformIcon } from '@/components/icons/WaveformIcon';
import { pipelinesApi } from '@/api/pipelines';
import { Pipeline } from '@/types/pipeline';

export default function Dashboard() {
  const [recentPipelines, setRecentPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setActive } = useActivePipeline();

  useEffect(() => {
    loadRecentPipelines();
  }, []);

  const loadRecentPipelines = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
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
        configuration: data.configuration || {},
        tags: data.tags,
      };

      const newPipeline = await pipelinesApi.create(createData);
      await setActive(newPipeline.id);
      // Dispatch pipeline created event
      window.dispatchEvent(new Event('pipelineCreated'));
      toast({
        title: 'Success',
        description: 'Pipeline created successfully',
      });
      loadRecentPipelines();
      setIsFormDialogOpen(false);
      navigate('/sampling'); // Navigate to the policy builder page
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create pipeline',
        variant: 'destructive',
      });
    }
  };

  const handleSetActive = async (pipeline: Pipeline) => {
    try {
      await setActive(pipeline.id);
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

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Welcome to OTail</h1>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="border rounded-lg p-12">
          <div className="flex items-center gap-12">
            <div className="shrink-0">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                <WaveformIcon className="w-16 h-16 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-3">Create your first pipeline</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Create and manage sampling configurations to optimize your observability costs and control data ingestion.
              </p>
              <div className="flex gap-4 items-center">
                <Button
                  id="new-pipeline-button"
                  onClick={() => setIsFormDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> New Pipeline
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Pipelines
          </CardTitle>
          <CardDescription>Your recently accessed pipelines</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : recentPipelines.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No recent pipelines found
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Pipeline</DialogTitle>
            <DialogDescription>
              Create a new pipeline that can be reused later.
            </DialogDescription>
          </DialogHeader>
          <PipelineForm
            onSubmit={handleCreatePipeline}
            onCancel={() => setIsFormDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 