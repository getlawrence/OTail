import { Node } from 'reactflow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { useState } from 'react';
import { Input } from './ui/input';
import {Button} from './ui/button';

interface ComponentConfigDialogProps {
  node: Node;
  onClose: () => void;
  onUpdate: (config: any) => void;
}

export const ComponentConfigDialog = ({
  node,
  onClose,
  onUpdate
}: ComponentConfigDialogProps) => {
  const [config, setConfig] = useState(node.data.config);
  const [pipelineName, setPipelineName] = useState(node.data.pipelineName || 'default');

  const handleSave = () => {
    onUpdate({ ...config, pipelineName });
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure {node.data.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {node.type === 'receiver' && (
            <div>
              <label className="text-sm font-medium">Endpoint</label>
              <Input
                value={config.endpoint || ''}
                onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                placeholder="Enter endpoint"
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Pipeline Name</label>
            <input
              type="text"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 