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
import type { ConfigSet } from '@/types/configSet';

interface SaveConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string) => Promise<void>;
  onUpdate: (configSetId: string) => Promise<void>;
  availableConfigSets: ConfigSet[];
}

export function SaveConfigDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  onUpdate,
  availableConfigSets 
}: SaveConfigDialogProps) {
  const [configName, setConfigName] = useState('');
  const [selectedConfigSetId, setSelectedConfigSetId] = useState('');
  const [isNewConfig, setIsNewConfig] = useState(true);

  const handleSave = async () => {
    if (isNewConfig) {
      await onSave(configName);
    } else {
      await onUpdate(selectedConfigSetId);
    }
    setConfigName('');
    setSelectedConfigSetId('');
    setIsNewConfig(true);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        onOpenChange(newOpen);
        if (!newOpen) {
          setConfigName('');
          setSelectedConfigSetId('');
          setIsNewConfig(true);
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Configuration</DialogTitle>
          <DialogDescription>
            Save the current configuration as a reusable config set or update an existing one.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={isNewConfig ? "default" : "outline"}
              onClick={() => setIsNewConfig(true)}
            >
              New Config Set
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
                placeholder="Enter a name for this config set"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="configSet">Config Set</Label>
              <Select
                value={selectedConfigSetId}
                onValueChange={setSelectedConfigSetId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a config set to update" />
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
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isNewConfig ? !configName.trim() : !selectedConfigSetId}
            >
              {isNewConfig ? 'Save' : 'Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 