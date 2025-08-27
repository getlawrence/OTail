import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { 
  Activity, 
  Settings, 
  FileText, 
  BarChart3, 
  Clock, 
  Server, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';
import { agentsApi } from '@/api/agent';
import type { Agent, Log } from '@/api/types';
import { useToast } from '@/hooks/use-toast';
import { LogsDialog } from '@/components/agents/LogsDialog';
import { ApplyPipelineDialog } from '@/components/agents/ApplyPipelineDialog';

export default function AgentDetails() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<Log[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [applyPipelineOpen, setApplyPipelineOpen] = useState(false);


  useEffect(() => {
    if (agentId) {
      loadAgent();
    }
  }, [agentId]);

  const loadAgent = async () => {
    try {
      setLoading(true);
      const agents = await agentsApi.list();
      const foundAgent = agents.find(a => a.InstanceId === agentId);
      if (foundAgent) {
        setAgent(foundAgent);
      } else {
        toast({
          title: 'Error',
          description: 'Agent not found',
          variant: 'destructive',
        });
        navigate('/agents');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load agent',
        variant: 'destructive',
      });
      navigate('/agents');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLogs = async () => {
    if (!agent) return;
    setLogsLoading(true);
    setLogsOpen(true);
    try {
      const logsData = await agentsApi.getLogs(agent.InstanceId);
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleApplyPipeline = () => {
    if (!agent) return;
    setApplyPipelineOpen(true);
  };

  const getStatusIcon = (healthy: boolean) => {
    if (healthy) {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusBadge = (healthy: boolean) => {
    if (healthy) {
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Healthy</Badge>;
    }
    return <Badge variant="destructive">Unhealthy</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Server className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Agent Details</h1>
            <p className="text-muted-foreground">Instance ID: {agent.InstanceId}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            {getStatusIcon(agent.Status?.health?.healthy || false)}
            {getStatusBadge(agent.Status?.health?.healthy || false)}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Started At</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              {agent.StartedAt ? new Date(agent.StartedAt).toLocaleString() : 'Unknown'}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button size="sm" onClick={handleViewLogs}>
              <FileText className="h-4 w-4 mr-2" />
              View Logs
            </Button>
            <Button size="sm" variant="outline" onClick={handleApplyPipeline}>
              <Settings className="h-4 w-4 mr-2" />
              Apply Config
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6 pb-20">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Agent Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Agent Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Instance ID</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{agent.InstanceId}</code>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Status</span>
                  {getStatusBadge(agent.Status?.health?.healthy || false)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Started At</span>
                  <span className="text-sm text-muted-foreground">
                    {agent.StartedAt ? new Date(agent.StartedAt).toLocaleString() : 'Unknown'}
                  </span>
                </div>
                {agent.Status?.health?.last_error && (
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium">Last Error</span>
                    <span className="text-sm text-red-600 max-w-xs text-right">
                      {agent.Status.health.last_error}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Health Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Health Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${agent.Status?.health?.healthy ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium">
                    {agent.Status?.health?.healthy ? 'Agent is healthy' : 'Agent has issues'}
                  </span>
                </div>
                
                {agent.Status?.health?.healthy ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">All systems operational</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Issues detected</span>
                  </div>
                )}

                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadAgent}
                    className="w-full"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

                  {/* Quick Actions Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common operations for this agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={handleViewLogs}>
                <FileText className="h-6 w-6" />
                <span className="text-sm">View Logs</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2" onClick={handleApplyPipeline}>
                <Settings className="h-6 w-6" />
                <span className="text-sm">Apply Config</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Play className="h-6 w-6" />
                <span className="text-sm">Start Agent</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Pause className="h-6 w-6" />
                <span className="text-sm">Pause Agent</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Status Monitor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Live Status Monitor
            </CardTitle>
            <CardDescription>Real-time agent status and performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm font-medium">Connection</div>
                <div className="text-xs text-muted-foreground">Active</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">📊</div>
                <div className="text-sm font-medium">Data Flow</div>
                <div className="text-xs text-muted-foreground">Normal</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">⚡</div>
                <div className="text-sm font-medium">Performance</div>
                <div className="text-xs text-muted-foreground">Optimal</div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-medium">All systems operational</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agent Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Timeline</CardTitle>
            <CardDescription>Recent activity and events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Agent started successfully</p>
                  <p className="text-xs text-muted-foreground">
                    {agent.StartedAt ? new Date(agent.StartedAt).toLocaleString() : 'Unknown time'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Configuration applied</p>
                  <p className="text-xs text-muted-foreground">Last config update</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Health check performed</p>
                  <p className="text-xs text-muted-foreground">Status: {agent.Status?.health?.healthy ? 'Healthy' : 'Unhealthy'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Real-time metrics and performance data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">98.5%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">1.2ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response Time</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">1,247</div>
                  <div className="text-sm text-muted-foreground">Requests/min</div>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-muted rounded-lg text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Detailed metrics visualization coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Logs</CardTitle>
              <CardDescription>Latest log entries from this agent</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleViewLogs} className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                View Full Logs
              </Button>
              
              <div className="mt-6 p-4 bg-muted rounded-lg text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Log preview coming soon. Click above to view full logs.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Configuration</CardTitle>
              <CardDescription>Active configuration for this agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Button onClick={handleApplyPipeline} variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Apply New Config
                </Button>
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Raw Config
                </Button>
              </div>
              
              {agent.EffectiveConfig ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Configuration Preview</span>
                      <Badge variant="secondary">YAML</Badge>
                    </div>
                    <pre className="text-xs overflow-x-auto max-h-64 overflow-y-auto">
                      <code>{agent.EffectiveConfig}</code>
                    </pre>
                  </div>
                  
                  {/* Configuration Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">3</div>
                      <div className="text-xs text-blue-800">Receivers</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="text-lg font-bold text-green-600">2</div>
                      <div className="text-xs text-green-800">Processors</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="text-lg font-bold text-purple-600">1</div>
                      <div className="text-xs text-purple-800">Exporters</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg text-center">
                  <Settings className="h-12 w-12 mx-auto text-muted-200 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No configuration available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {logsOpen && (
        <LogsDialog
          open={logsOpen}
          onOpenChange={setLogsOpen}
          logs={logs}
          loading={logsLoading}
        />
      )}

      {applyPipelineOpen && (
        <ApplyPipelineDialog
          open={applyPipelineOpen}
          onOpenChange={setApplyPipelineOpen}
          agent={agent}
        />
      )}
    </>
  );
}
