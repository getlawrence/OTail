import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { pipelinesApi } from '@/api/pipelines';
import type { Pipeline } from '@/types/pipeline';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { PipelineForm } from '@/components/config/PipelineForm';
import { Pencil, Trash, Check, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useActivePipeline } from '@/hooks/use-active-pipeline';

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [_, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const { activePipeline, setActive } = useActivePipeline();

  useEffect(() => {
    loadPipelines();
  }, []);

  useEffect(() => {
    // Handle selected pipeline from navigation state
    const state = location.state as { selectedPipelineId?: string } | null;
    if (state?.selectedPipelineId) {
      const pipeline = pipelines.find(p => p.id === state.selectedPipelineId);
      if (pipeline) {
        setSelectedPipeline(pipeline);
        setIsFormDialogOpen(true);
      }
    }
  }, [location.state, pipelines]);

  const loadPipelines = async () => {
    try {
      setLoading(true);
      const response = await pipelinesApi.list();
      setPipelines(response.pipelines);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pipelines',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPipeline) return;

    try {
      await pipelinesApi.delete(selectedPipeline.id);
      toast({
        title: 'Success',
        description: 'Pipeline deleted successfully',
      });
      loadPipelines();
      setIsDeleteDialogOpen(false);
      setSelectedPipeline(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete pipeline',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (data: Partial<Pipeline>) => {
    try {
      if (!data.name) {
        toast({
          title: 'Error',
          description: 'Name and type are required',
          variant: 'destructive',
        });
        return;
      }

      if (selectedPipeline) {
        await pipelinesApi.update({ ...data, id: selectedPipeline.id });
        toast({
          title: 'Success',
          description: 'Pipeline updated successfully',
        });
      } else {
        const createData = {
          name: data.name,
          description: data.description,
          configuration: data.configuration || {},
          tags: data.tags,
        };
        await pipelinesApi.create(createData);
        // Dispatch pipeline created event
        window.dispatchEvent(new Event('pipelineCreated'));
        toast({
          title: 'Success',
          description: 'Pipeline created successfully',
        });
      }
      loadPipelines();
      setIsFormDialogOpen(false);
      setSelectedPipeline(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save pipeline',
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

  const filteredPipelines = pipelines.filter(
    (pipeline) =>
      pipeline.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pipeline.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pipelines</h1>
        <Button onClick={() => setIsFormDialogOpen(true)}>
          Create Pipeline
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search pipelines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredPipelines.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPipelines.map((pipeline) => (
                <TableRow key={pipeline.id}>
                  <TableCell>{pipeline.name}</TableCell>
                  <TableCell>{pipeline.description}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {pipeline.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {activePipeline?.id === pipeline.id ? (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSetActive(pipeline)}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPipeline(pipeline);
                          setIsFormDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedPipeline(pipeline);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 border rounded-lg bg-muted/50">
          <div className="text-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10 inline-block">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">No pipelines found</h3>
            <p className="text-muted-foreground max-w-sm">
              Get started by creating your first pipeline. This will help you organize and manage your configurations.
            </p>
            <Button onClick={() => setIsFormDialogOpen(true)} className="mt-4">
              Create Pipeline
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPipeline ? 'Edit Pipeline' : 'Create Pipeline'}
            </DialogTitle>
            <DialogDescription>
              {selectedPipeline
                ? 'Edit the pipeline details below.'
                : 'Fill in the details to create a new pipeline.'}
            </DialogDescription>
          </DialogHeader>
          <PipelineForm
            initialData={selectedPipeline || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormDialogOpen(false);
              setSelectedPipeline(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Pipeline</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this pipeline? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedPipeline(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 