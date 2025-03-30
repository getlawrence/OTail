import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Pipeline } from '@/types/pipeline';

interface SaveConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => Promise<void>;
  onUpdate: (pipelineId: string) => Promise<void>;
  availablePipelines: Pipeline[];
}

export function SaveConfigDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  onUpdate,
  availablePipelines 
}: SaveConfigDialogProps) {
  const [configName, setConfigName] = useState('');
  const [selectedPipelineId, setSelectedPipelineId] = useState('');
  const [isNewConfig, setIsNewConfig] = useState(true);

  const handleSave = async () => {
    if (isNewConfig) {
      await onSave(configName);
    } else {
      await onUpdate(selectedPipelineId);
    }
    setConfigName('');
    setSelectedPipelineId('');
    setIsNewConfig(true);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) {
          setConfigName('');
          setSelectedPipelineId('');
          setIsNewConfig(true);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Configuration</DialogTitle>
          <DialogDescription>
            Save the current configuration as a reusable pipeline or update an existing one.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={isNewConfig ? "default" : "outline"}
              onClick={() => setIsNewConfig(true)}
            >
              New pipeline
            </Button>
            <Button
              variant={!isNewConfig ? "default" : "outline"}
              onClick={() => setIsNewConfig(false)}
            >
              Update Existing
            </Button>
          </div>

          {isNewConfig ? (
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="Enter a name for this pipeline"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="pipeline">pipeline</Label>
              <Select
                value={selectedPipelineId}
                onValueChange={setSelectedPipelineId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a pipeline to update" />
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
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isNewConfig ? !configName.trim() : !selectedPipelineId}
            >
              {isNewConfig ? 'Save' : 'Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 