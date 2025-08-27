import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { deploymentsApi } from '@/api/deployments';
import { agentGroupsApi } from '@/api/agent-groups';
import { agentsApi } from '@/api/agent';
import { pipelinesApi } from '@/api/pipelines';
import type { Deployment, AgentGroup } from '@/types/deployment';
import type { Pipeline } from '@/types/pipeline';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Network, Users, Server, ChevronRight, ChevronDown, Activity, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Agent } from '@/api/types';

const noBackend = import.meta.env.VITE_NO_BACKEND === 'true';

function DeploymentsDashboard() {
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
      // Ensure we always have a valid array, even if response is null/undefined
      const validDeployments = Array.isArray(response) ? response : [];
      setDeployments(validDeployments);
      
      // Load agent groups for each deployment only if we have valid deployments
      if (validDeployments.length > 0) {
        await Promise.all(validDeployments.map(deployment => loadAgentGroups(deployment.id)));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load deployments',
        variant: 'destructive',
      });
      // Set empty array on error to prevent null reference issues
      setDeployments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAgentGroups = async (deploymentId: string) => {
    try {
      const response = await agentGroupsApi.list(deploymentId);
      // Ensure we always have a valid array, even if response is null/undefined
      const validGroups = Array.isArray(response) ? response : [];
      setAgentGroups(prev => ({
        ...prev,
        [deploymentId]: validGroups
      }));
      
      // Load agents for each group only if we have valid groups
      if (validGroups.length > 0) {
        await Promise.all(validGroups.map(group => loadAgents(group.id)));
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load agent groups',
        variant: 'destructive',
      });
      // Set empty array on error to prevent null reference issues
      setAgentGroups(prev => ({
        ...prev,
        [deploymentId]: []
      }));
    }
  };

  const loadAgents = async (groupId: string) => {
    try {
      const response = await agentsApi.getByGroup(groupId);
      // Ensure we always have a valid array, even if response is null/undefined
      const validAgents = Array.isArray(response) ? response : [];
      
      setAgents(prev => ({
        ...prev,
        [groupId]: validAgents
      }));
    } catch (error) {
      console.error(`Failed to load agents for group ${groupId}:`, error);
      toast({
        title: 'Error',
        description: 'Failed to load agents',
        variant: 'destructive',
      });
      // Set empty array on error to prevent null reference issues
      setAgents(prev => ({
        ...prev,
        [groupId]: []
      }));
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
    if (!deployment?.id) return 0;
    const groups = agentGroups[deployment.id] || [];
    return groups.reduce((total, group) => total + (agents[group?.id || '']?.length || 0), 0);
  };

  return (
    <>
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
          ) : !deployments || deployments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No deployments found. Create your first deployment to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {deployments.map((deployment) => (
                <div key={deployment?.id || 'unknown'} className="border rounded-lg">
                  <div
                    className="p-4 hover:bg-accent cursor-pointer flex items-center justify-between"
                    onClick={() => deployment?.id && toggleDeployment(deployment.id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedDeployments.has(deployment?.id || '') ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div>
                        <h3 className="font-medium">{deployment?.name || 'Unnamed Deployment'}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {deployment?.created_at ? new Date(deployment.created_at).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {agentGroups[deployment?.id || '']?.length || 0} Groups
                      </Badge>
                      <Badge variant="outline">
                        <Server className="h-3 w-3 mr-1" />
                        {deployment ? getTotalAgents(deployment) : 0} Agents
                      </Badge>
                    </div>
                  </div>

                  {deployment?.id && expandedDeployments.has(deployment.id) && (
                    <div className="border-t bg-accent/50">
                      <div className="p-4 space-y-4">
                        {(agentGroups[deployment.id] || []).map((group) => (
                          <div key={group?.id || 'unknown'} className="pl-6 border-l-2 border-primary">
                            <div
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => group?.id && toggleGroup(group.id)}
                            >
                              <div className="flex items-center gap-2">
                                {expandedGroups.has(group?.id || '') ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <div>
                                  <h4 className="font-medium">{group?.name || 'Unnamed Group'}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {(group?.agent_ids || []).length} Agents
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (deployment?.id && group?.id) {
                                    navigate(`/deployments/${deployment.id}/groups/${group.id}`);
                                  }
                                }}
                                disabled={!deployment?.id || !group?.id}
                              >
                                View Details
                              </Button>
                            </div>

                            {group?.id && expandedGroups.has(group.id) && (
                              <div className="mt-4 pl-6 space-y-2">
                                {(agents[group.id] || []).map((agent) => (
                                  <div
                                    key={agent?.InstanceId || 'unknown'}
                                    className="flex items-center justify-between p-2 rounded-md bg-background"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Activity className={cn(
                                        "h-3 w-3",
                                        agent?.status === 'success' ? "text-green-500" :
                                          agent?.status === 'failed' ? "text-red-500" :
                                            "text-yellow-500"
                                      )} />
                                      <div>
                                        <p className="text-sm font-medium">{agent?.InstanceId ? agent.InstanceId.slice(0, 8) : 'Unknown'}</p>
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
    </>
  );
}

function PipelinesDashboard() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPipelines();
  }, []);

  const loadPipelines = async () => {
    try {
      const response = await pipelinesApi.list();
      setPipelines(response.pipelines);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load pipelines',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome to OTail</h1>
          <p className="text-muted-foreground">Manage your OpenTelemetry pipelines</p>
        </div>
        <Button id="new-pipeline-button" onClick={() => navigate('/pipelines')} className="gap-2">
          <Plus className="h-4 w-4" /> New Pipeline
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Pipelines Overview
          </CardTitle>
          <CardDescription>View and manage your pipelines</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : pipelines.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No pipelines found. Create your first pipeline to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {pipelines.map((pipeline) => (
                <div key={pipeline.id} className="border rounded-lg p-4 hover:bg-accent cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{pipeline.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created {new Date(pipeline.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/pipelines/${pipeline.id}`)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

export default function Dashboard() {
  return (
    <>
      {noBackend ? <PipelinesDashboard /> : <DeploymentsDashboard />}
    </>
  );
} 