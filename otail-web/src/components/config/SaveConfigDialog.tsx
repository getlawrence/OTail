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

interface SaveConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => Promise<void>;
}

export function SaveConfigDialog({ open, onOpenChange, onSave }: SaveConfigDialogProps) {
  const [configName, setConfigName] = useState('');

  const handleSave = async () => {
    await onSave(configName);
    setConfigName('');
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) setConfigName('');
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save as Config Set</DialogTitle>
          <DialogDescription>
            Save the current configuration as a reusable config set.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="Enter a name for this config set"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 