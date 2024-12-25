import { Node } from 'reactflow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { useState } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { PolicyBuilder } from '../policy-builder';
import { useConfigState } from '@/hooks/use-config';

interface ComponentConfigDialogProps {
  node: Node;
  onClose: () => void;
  onConfigUpdate: (nodeId: string, config: any) => void;
}

export const ComponentConfigDialog = ({
  node,
  onClose,
  onConfigUpdate
}: ComponentConfigDialogProps) => {
  const {
    state,
    handleAddPolicy,
    handleUpdatePolicy,
    handleRemovePolicy,
  } = useConfigState(node.data.config.policies);

  const [config, setConfig] = useState(node.data.config);
  const [pipelineName, setPipelineName] = useState(node.data.pipelineName || 'default');

  const handleSave = () => {
    console.log('Saving config:', { ...config, pipelineName, policies: state.config.policies });
    onConfigUpdate(node.id, { ...config, pipelineName, policies: state.config.policies });
    onClose();
  };

  const processorType = node.data.label;
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
          {processorType === "tail_sampling" && <PolicyBuilder
            policies={state.config.policies}
            addPolicy={handleAddPolicy}
            updatePolicy={handleUpdatePolicy}
            removePolicy={handleRemovePolicy} />}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 