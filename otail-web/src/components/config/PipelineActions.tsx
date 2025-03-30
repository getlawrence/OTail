import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SaveConfigDialog } from '@/components/config/SaveConfigDialog';
import { ImportConfigDialog } from '@/components/config/ImportConfigDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Download, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Pipeline } from '@/types/pipeline';
import { usePipelines } from '@/hooks/use-pipelines';

interface PipelineActionsProps {
  getCurrentState: () => string;
  onImport: (configuration: any) => void;
  className?: string;
}

export function PipelineActions({
  getCurrentState,
  onImport,
  className,
}: PipelineActionsProps) {
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [availablePipelines, setAvailablePipelines] = useState<Pipeline[]>([]);
  const { toast } = useToast();
  const { saveToPipeline, updatePipeline, loadPipeline, listPipelines } = usePipelines();

  const handleSave = async (name: string) => {
    try {
      const currentState = getCurrentState();
      await saveToPipeline(name.trim(), currentState);
      toast({
        title: 'Success',
        description: 'Configuration saved successfully',
      });
      setSaveDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (pipelineId: string) => {
    try {
      const currentState = getCurrentState();
      await updatePipeline(pipelineId, currentState);
      toast({
        title: 'Success',
        description: 'Configuration updated successfully',
      });
      setSaveDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async (pipelineId: string) => {
    try {
      const pipeline = await loadPipeline(pipelineId);
      onImport(pipeline.configuration);
      toast({
        title: 'Success',
        description: 'Configuration imported successfully',
      });
      setImportDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import configuration',
        variant: 'destructive',
      });
    }
  };

  const loadAvailablePipelines = async () => {
    try {
      const pipelines = await listPipelines();
      setAvailablePipelines(pipelines);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load available pipelines',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                loadAvailablePipelines();
                setImportDialogOpen(true);
              }}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Import Pipeline
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                loadAvailablePipelines();
                setSaveDialogOpen(true);
              }}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save/Update Pipeline
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SaveConfigDialog
        open={isSaveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSave}
        onUpdate={handleUpdate}
        availablePipelines={availablePipelines}
      />

      <ImportConfigDialog
        open={isImportDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
        availablePipelines={availablePipelines}
      />
    </>
  );
} 