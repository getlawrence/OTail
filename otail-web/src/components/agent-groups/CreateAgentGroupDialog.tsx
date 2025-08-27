import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Deployment } from '@/types/deployment';
import { deploymentsApi } from '@/api/deployments';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateAgentGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, deploymentId: string | null) => void;
}

export function CreateAgentGroupDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateAgentGroupDialogProps) {
  const [name, setName] = useState('');
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedDeploymentId, setSelectedDeploymentId] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadDeployments();
    }
  }, [open]);

  const loadDeployments = async () => {
    try {
      const data = await deploymentsApi.list();
      setDeployments(data);
    } catch (error) {
      console.error('Failed to load deployments:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(name, selectedDeploymentId);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Agent Group</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter group name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Deployment</Label>
              <Select
                value={selectedDeploymentId || ''}
                onValueChange={(value) => setSelectedDeploymentId(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a deployment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {deployments.map((deployment) => (
                    <SelectItem key={deployment.id} value={deployment.id}>
                      {deployment.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 