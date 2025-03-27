import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { Pipeline } from '@/types/pipeline';
import { useRef, useState } from 'react';

interface ImportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (pipelineId: string) => Promise<void>;
  availablePipelines: Pipeline[];
}

export function ImportConfigDialog({
  open,
  onOpenChange,
  onImport,
  availablePipelines
}: ImportConfigDialogProps) {
  const [selectedPipelineId, setSelectedPipelineId] = useState('');

  const lastFocusedElement = useRef<HTMLElement | null>(null);

  const handleImport = async () => {
    await onImport(selectedPipelineId);
    setSelectedPipelineId('');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setTimeout(() => lastFocusedElement.current?.focus(), 0); // Restore focus
          setSelectedPipelineId('');
        } else {
          lastFocusedElement.current = document.activeElement as HTMLElement;
        }
        onOpenChange(newOpen);
      }}
    >
      {open && (<DialogContent>
        <DialogHeader>
          <DialogTitle>Import Pipeline</DialogTitle>
          <DialogDescription>
            Select a pipeline to import its configuration.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pipeline">Pipeline</Label>
            <Select
              value={selectedPipelineId}
              onValueChange={setSelectedPipelineId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a pipeline" />
              </SelectTrigger>
              <SelectContent>
                {availablePipelines.map((pipeline) => (
                  <SelectItem key={pipeline.id} value={pipeline.id}>
                    {pipeline.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>Import</Button>
          </div>
        </div>
      </DialogContent>
      )}
    </Dialog>
  );
} 