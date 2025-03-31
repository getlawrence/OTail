import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { deploymentsApi } from '@/api/deployments';
import { agentGroupsApi } from '@/api/agent-groups';
import { agentsApi } from '@/api/agent';
import type { Deployment, AgentGroup } from '@/types/deployment';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Network, Users, Server, ChevronRight, ChevronDown, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Agent } from '@/api/types';

export default function Dashboard() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [agentGroups, setAgentGroups] = useState<Record<string, AgentGroup[]>>({});
  const [agents, setAgents] = useState<Record<string, Agent[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedDeployments, setExpandedDeployments] = useState<Set<string>>(new Set());
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadDeployments();
  }, []);

  const loadDeployments = async () => {
    try {
      const response = await deploymentsApi.list();
      setDeployments(response);
      // Load agent groups for each deployment
      await Promise.all(response.map(deployment => loadAgentGroups(deployment.id)));
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

  const loadAgentGroups = async (deploymentId: string) => {
    try {
      const response = await agentGroupsApi.list(deploymentId);
      setAgentGroups(prev => ({
        ...prev,
        [deploymentId]: response
      }));
      // Load agents for each group
      await Promise.all(response.map(group => loadAgents(group.id)));
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load agent groups',
        variant: 'destructive',
      });
    }
  };

  const loadAgents = async (groupId: string) => {
    try {
      const response = await agentsApi.getByGroup(groupId);
      if (!response) {
        console.warn(`No data received for group ${groupId}`);
        return;
      }
      
      // Get actual agents from the backend
      const agents = response;
      
      setAgents(prev => ({
        ...prev,
        [groupId]: agents
      }));
    } catch (error) {
      console.error(`Failed to load agents for group ${groupId}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to load agents',
        variant: 'destructive',
      });
    }
  };

  const toggleDeployment = (deploymentId: string) => {
    setExpandedDeployments(prev => {
      const next = new Set(prev);
      if (next.has(deploymentId)) {
        next.delete(deploymentId);
      } else {
        next.add(deploymentId);
      }
      return next;
    });
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  };

  const getTotalAgents = (deployment: Deployment) => {
    const groups = agentGroups[deployment.id] || [];
    return groups.reduce((total, group) => total + (agents[group.id]?.length || 0), 0);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome to OTail</h1>
          <p className="text-muted-foreground">Manage your OpenTelemetry deployments and agents</p>
        </div>
        <Button onClick={() => navigate('/deployments')} className="gap-2">
          <Plus className="h-4 w-4" /> New Deployment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Deployments Overview
          </CardTitle>
          <CardDescription>View and manage your deployments and their agents</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : deployments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No deployments found. Create your first deployment to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div key={deployment.id} className="border rounded-lg">
                  <div
                    className="p-4 hover:bg-accent cursor-pointer flex items-center justify-between"
                    onClick={() => toggleDeployment(deployment.id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedDeployments.has(deployment.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div>
                        <h3 className="font-medium">{deployment.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {new Date(deployment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {agentGroups[deployment.id]?.length || 0} Groups
                      </Badge>
                      <Badge variant="outline">
                        <Server className="h-3 w-3 mr-1" />
                        {getTotalAgents(deployment)} Agents
                      </Badge>
                    </div>
                  </div>
                  
                  {expandedDeployments.has(deployment.id) && (
                    <div className="border-t bg-accent/50">
                      <div className="p-4 space-y-4">
                        {agentGroups[deployment.id]?.map((group) => (
                          <div key={group.id} className="pl-6 border-l-2 border-primary">
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => toggleGroup(group.id)}
                            >
                              <div className="flex items-center gap-2">
                                {expandedGroups.has(group.id) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <div>
                                  <h4 className="font-medium">{group.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {(group.agent_ids || []).length} Agents
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/deployments/${deployment.id}/groups/${group.id}`);
                                }}
                              >
                                View Details
                              </Button>
                            </div>

                            {expandedGroups.has(group.id) && (
                              <div className="mt-4 pl-6 space-y-2">
                                {agents[group.id]?.map((agent) => (
                                  <div
                                    key={agent.InstanceId}
                                    className="flex items-center justify-between p-2 rounded-md bg-background"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Activity className={cn(
                                        "h-3 w-3",
                                        agent.status === 'success' ? "text-green-500" :
                                        agent.status === 'failed' ? "text-red-500" :
                                        "text-yellow-500"
                                      )} />
                                      <div>
                                        <p className="text-sm font-medium">{agent.InstanceId.slice(0, 8)}</p>
                                        <p className="text-xs text-muted-foreground">
                                          Version {agent.status}
                                        </p>
                                      </div>
                                    </div>
                                    <Badge variant="outline">
                                      {agent.status}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 