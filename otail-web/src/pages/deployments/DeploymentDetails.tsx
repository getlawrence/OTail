import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { deploymentsApi } from '@/api/deployments';
import { Deployment } from '@/types/deployment';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Settings } from 'lucide-react';

export default function DeploymentDetails() {
  const { id } = useParams();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDeployment();
  }, [id]);

  const loadDeployment = async () => {
    try {
      setLoading(true);
      const response = await deploymentsApi.get(id!);
      setDeployment(response);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load deployment details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!deployment) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-muted-foreground">Deployment not found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{deployment.name}</h1>
          <p className="text-muted-foreground">{deployment.description}</p>
        </div>
        <Badge variant="secondary">{deployment.environment}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Agent Groups
            </CardTitle>
            <CardDescription>Groups of agents in this deployment</CardDescription>
          </CardHeader>
          <CardContent>
            {deployment.agentGroups.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No agent groups configured
              </div>
            ) : (
              <div className="space-y-4">
                {deployment.agentGroups.map((group) => (
                  <Card key={group.id}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{group.name}</h3>
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{group.role}</Badge>
                            <Badge variant="outline">
                              {group.agents.length} Agents
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuration
            </CardTitle>
            <CardDescription>Deployment settings and metadata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Created</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(deployment.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Last Updated</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(deployment.updated_at).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Total Agents</h3>
                <p className="text-sm text-muted-foreground">
                  {deployment.agentGroups.reduce((total, group) => total + group.agents.length, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 