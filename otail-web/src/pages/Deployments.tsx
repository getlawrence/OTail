import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { deploymentsApi } from '@/api/deployments';
import { configSetsApi } from '@/api/configSets';
import type { Deployment, AgentGroup } from '@/types/deployment';
import type { ConfigSet } from '@/types/configSet';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Network, Trash2, FolderPlus, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeploymentForm } from '@/components/deployment/DeploymentForm';
import { AgentGroupForm } from '@/components/deployment/AgentGroupForm';

export default function Deployments() {
  const { toast } = useToast();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [configSets, setConfigSets] = useState<ConfigSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeploymentFormOpen, setIsDeploymentFormOpen] = useState(false);
  const [isAgentGroupFormOpen, setIsAgentGroupFormOpen] = useState(false);
  const [selectedDeployment, setSelectedDeployment] = useState<Deployment | null>(null);
  const [selectedAgentGroup, setSelectedAgentGroup] = useState<AgentGroup | null>(null);

  useEffect(() => {
    loadDeployments();
    loadConfigSets();
  }, []);

  const loadDeployments = async () => {
    try {
      setLoading(true);
      const response = await deploymentsApi.list();
      setDeployments(response.deployments);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load deployments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadConfigSets = async () => {
    try {
      const response = await configSetsApi.list();
      setConfigSets(response.configSets);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load configuration sets',
        variant: 'destructive',
      });
    }
  };

  const handleCreateDeployment = async (data: Partial<Deployment>) => {
    try {
      if (!data.name) {
        toast({
          title: 'Error',
          description: 'Name is required',
          variant: 'destructive',
        });
        return;
      }

      if (data.id) {
        await deploymentsApi.update({
          id: data.id,
          name: data.name,
          description: data.description,
          environment: data.environment || 'development',
        });
        toast({
          title: 'Success',
          description: 'Deployment updated successfully',
        });
      } else {
        await deploymentsApi.create({
          name: data.name,
          description: data.description,
          environment: data.environment || 'development',
          agentGroups: [],
        });
        toast({
          title: 'Success',
          description: 'Deployment created successfully',
        });
      }
      loadDeployments();
      setIsDeploymentFormOpen(false);
      setSelectedDeployment(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${data.id ? 'update' : 'create'} deployment`,
        variant: 'destructive',
      });
    }
  };

  const handleCreateAgentGroup = async (data: Partial<AgentGroup>) => {
    try {
      if (!selectedDeployment) return;

      if (!data.name || !data.role || !data.configProfileId) {
        toast({
          title: 'Error',
          description: 'Name, role, and configuration set are required',
          variant: 'destructive',
        });
        return;
      }

      if (data.id) {
        await deploymentsApi.updateAgentGroup({
          id: data.id,
          deploymentId: selectedDeployment.id,
          name: data.name,
          description: data.description,
          role: data.role,
          configProfileId: data.configProfileId,
        });
        toast({
          title: 'Success',
          description: 'Agent group updated successfully',
        });
      } else {
        await deploymentsApi.createAgentGroup({
          name: data.name,
          description: data.description,
          role: data.role,
          configProfileId: data.configProfileId,
          deploymentId: selectedDeployment.id,
        });
        toast({
          title: 'Success',
          description: 'Agent group created successfully',
        });
      }
      loadDeployments();
      setIsAgentGroupFormOpen(false);
      setSelectedDeployment(null);
      setSelectedAgentGroup(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${data.id ? 'update' : 'create'} agent group`,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteDeployment = async (deploymentId: string) => {
    try {
      await deploymentsApi.delete(deploymentId);
      toast({
        title: 'Success',
        description: 'Deployment deleted successfully',
      });
      loadDeployments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete deployment',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAgentGroup = async (deploymentId: string, groupId: string) => {
    try {
      await deploymentsApi.deleteAgentGroup(deploymentId, groupId);
      toast({
        title: 'Success',
        description: 'Agent group deleted successfully',
      });
      loadDeployments();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete agent group',
        variant: 'destructive',
      });
    }
  };

  const handleEditDeployment = (deployment: Deployment) => {
    setSelectedDeployment(deployment);
    setIsDeploymentFormOpen(true);
  };

  const handleEditAgentGroup = (deployment: Deployment, group: AgentGroup) => {
    setSelectedDeployment(deployment);
    setSelectedAgentGroup(group);
    setIsAgentGroupFormOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Deployments</h1>
          <p className="text-muted-foreground">Manage your OpenTelemetry deployments and agent groups</p>
        </div>
        <Button onClick={() => setIsDeploymentFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Deployment
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Available Deployments
            </CardTitle>
            <CardDescription>Manage your deployments and their agent groups</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : deployments.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No deployments found
              </div>
            ) : (
              <div className="space-y-6">
                {deployments.map((deployment) => (
                  <Card key={deployment.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-medium">{deployment.name}</h3>
                          <p className="text-sm text-muted-foreground">{deployment.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{deployment.environment}</Badge>
                            <Badge variant="outline">
                              {deployment.agentGroups.length} Agent Groups
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => handleEditDeployment(deployment)}
                          >
                            <Pencil className="w-4 h-4" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => {
                              setSelectedDeployment(deployment);
                              setIsAgentGroupFormOpen(true);
                            }}
                          >
                            <FolderPlus className="w-4 h-4" /> Add Agent Group
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => handleDeleteDeployment(deployment.id)}
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </Button>
                        </div>
                      </div>

                      {deployment.agentGroups.length > 0 && (
                        <div className="space-y-4 mt-4">
                          <h4 className="text-sm font-medium">Agent Groups</h4>
                          {deployment.agentGroups.map((group) => (
                            <Card key={group.id} className="relative">
                              <CardContent className="pt-6">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h5 className="font-medium">{group.name}</h5>
                                    <p className="text-sm text-muted-foreground">{group.description}</p>
                                    <div className="flex gap-2 mt-2">
                                      <Badge variant="secondary">{group.role}</Badge>
                                      <Badge variant="outline">
                                        {group.agents.length} Agents
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="flex items-center gap-2"
                                      onClick={() => handleEditAgentGroup(deployment, group)}
                                    >
                                      <Pencil className="w-4 h-4" /> Edit
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      className="flex items-center gap-2"
                                      onClick={() => handleDeleteAgentGroup(deployment.id, group.id)}
                                    >
                                      <Trash2 className="w-4 h-4" /> Delete
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDeploymentFormOpen} onOpenChange={setIsDeploymentFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedDeployment ? 'Edit Deployment' : 'Create New Deployment'}</DialogTitle>
            <DialogDescription>
              {selectedDeployment ? 'Update your deployment settings.' : 'Create a new deployment that can be reused later.'}
            </DialogDescription>
          </DialogHeader>
          <DeploymentForm
            onSubmit={handleCreateDeployment}
            onCancel={() => {
              setIsDeploymentFormOpen(false);
              setSelectedDeployment(null);
            }}
            deployment={selectedDeployment || undefined}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isAgentGroupFormOpen} onOpenChange={setIsAgentGroupFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedAgentGroup ? 'Edit Agent Group' : 'Create New Agent Group'}</DialogTitle>
            <DialogDescription>
              {selectedAgentGroup ? 'Update your agent group settings.' : 'Create a new agent group for the deployment.'}
            </DialogDescription>
          </DialogHeader>
          <AgentGroupForm
            onSubmit={handleCreateAgentGroup}
            onCancel={() => {
              setIsAgentGroupFormOpen(false);
              setSelectedDeployment(null);
              setSelectedAgentGroup(null);
            }}
            configSets={configSets}
            agentGroup={selectedAgentGroup || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 