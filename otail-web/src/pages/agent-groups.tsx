import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { AgentGroup } from '@/types/deployment';
import { agentGroupsApi } from '@/api/agent-groups';
import { CreateAgentGroupDialog } from '@/components/agent-groups/CreateAgentGroupDialog'   
import { AgentGroupList } from '@/components/agent-groups/AgentGroupList';

export default function AgentGroupsPage() {
  const [groups, setGroups] = useState<AgentGroup[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const data = await agentGroupsApi.list('');
      setGroups(data);
    } catch (error) {
      console.error('Failed to load agent groups:', error);
    }
  };

  const handleCreateGroup = async (name: string, deploymentId: string | null) => {
    try {
      const newGroup = await agentGroupsApi.create({ 
        name, 
        deploymentId: deploymentId || '',
        config: ''
      });
      setGroups([...groups, newGroup]);
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create agent group:', error);
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await agentGroupsApi.delete(id);
      setGroups(groups.filter(g => g.id !== id));
    } catch (error) {
      console.error('Failed to delete agent group:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agent Groups</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Group
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agent Group List</CardTitle>
        </CardHeader>
        <CardContent>
          <AgentGroupList
            groups={groups}
            onDelete={handleDeleteGroup}
          />
        </CardContent>
      </Card>

      <CreateAgentGroupDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateGroup}
      />
    </div>
  );
} 