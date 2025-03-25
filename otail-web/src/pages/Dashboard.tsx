import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { deploymentsApi } from '@/api/deployments';
import type { Deployment } from '@/types/deployment';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { DeploymentForm } from '@/components/deployment/DeploymentForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Clock, Pencil, Network } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { WaveformIcon } from '@/components/icons/WaveformIcon';

export default function Dashboard() {
  const [recentDeployments, setRecentDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadRecentDeployments();
  }, []);

  const loadRecentDeployments = async () => {
    try {
      setLoading(true);
      const response = await deploymentsApi.list();
      const recent = response.deployments
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setRecentDeployments(recent);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load recent deployments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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

      const createData = {
        name: data.name,
        description: data.description,
        environment: data.environment || 'development',
        agentGroups: data.agentGroups || [],
      };

      await deploymentsApi.create(createData);
      toast({
        title: 'Success',
        description: 'Deployment created successfully',
      });
      loadRecentDeployments();
      setIsFormDialogOpen(false);
      navigate('/deployments'); // Navigate to the deployments page
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create deployment',
        variant: 'destructive',
      });
    }
  };

  const handleViewDeployment = (deployment: Deployment) => {
    navigate(`/deployments/${deployment.id}`);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Welcome to OTail</h1>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="border rounded-lg p-12">
          <div className="flex items-center gap-12">
            <div className="shrink-0">
              <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                <WaveformIcon className="w-16 h-16 text-primary" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-3">Create your first deployment</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Create and manage OpenTelemetry agent deployments to optimize your observability costs and control data ingestion.
              </p>
              <div className="flex gap-4 items-center">
                <Button
                  id="new-deployment-button"
                  onClick={() => setIsFormDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" /> New Deployment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Deployments
          </CardTitle>
          <CardDescription>Your recently accessed deployments</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : recentDeployments.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No recent deployments found
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {recentDeployments.map((deployment) => (
                <Card
                  key={deployment.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
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
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(deployment.createdAt).toLocaleDateString()}
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => handleViewDeployment(deployment)}
                        >
                          <Network className="w-4 h-4" /> View
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

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Deployment</DialogTitle>
            <DialogDescription>
              Create a new deployment that can be reused later.
            </DialogDescription>
          </DialogHeader>
          <DeploymentForm
            onSubmit={handleCreateDeployment}
            onCancel={() => setIsFormDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 