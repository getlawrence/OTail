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
import type { ConfigSet } from '@/types/configSet';
import { useRef, useState } from 'react';

interface ImportConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (configSetId: string) => Promise<void>;
  availableConfigSets: ConfigSet[];
}

export function ImportConfigDialog({ 
  open, 
  onOpenChange, 
  onImport, 
  availableConfigSets 
}: ImportConfigDialogProps) {
  const [selectedConfigSetId, setSelectedConfigSetId] = useState('');

  const lastFocusedElement = useRef<HTMLElement | null>(null);

  const handleImport = async () => {
    await onImport(selectedConfigSetId);
    setSelectedConfigSetId('');
  };

  return (
    <Dialog 
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) {
          setTimeout(() => lastFocusedElement.current?.focus(), 0); // Restore focus
          setSelectedConfigSetId('');
        } else {
          lastFocusedElement.current = document.activeElement as HTMLElement;
        }
        onOpenChange(newOpen);
      }}
    >
    {open && (  <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Config Set</DialogTitle>
          <DialogDescription>
            Select a config set to import its configuration.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="configSet">Config Set</Label>
            <Select
              value={selectedConfigSetId}
              onValueChange={setSelectedConfigSetId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a config set" />
              </SelectTrigger>
              <SelectContent>
                {availableConfigSets.map((configSet) => (
                  <SelectItem key={configSet.id} value={configSet.id}>
                    {configSet.name}
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