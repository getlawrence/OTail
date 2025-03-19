import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { configSetsApi } from '@/api/configSets';
import type { ConfigSet } from '@/types/configSet';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ConfigSetForm } from '@/components/config/ConfigSetForm';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Clock, BookOpen, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useActiveConfigSet } from '@/hooks/use-active-config-set';
import { WaveformIcon } from '@/components/icons/WaveformIcon';

export default function Dashboard() {
  const [recentConfigSets, setRecentConfigSets] = useState<ConfigSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setActive } = useActiveConfigSet();

  useEffect(() => {
    loadRecentConfigSets();
  }, []);

  const loadRecentConfigSets = async () => {
    try {
      setLoading(true);
      const response = await configSetsApi.list();
      // Sort by createdAt and take the 5 most recent
      const recent = response.configSets
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentConfigSets(recent);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load recent config sets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateConfigSet = async (data: Partial<ConfigSet>) => {
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
        configuration: data.configuration || {},
        tags: data.tags,
      };

      const newConfigSet = await configSetsApi.create(createData);
      await setActive(newConfigSet.id);
      toast({
        title: 'Success',
        description: 'Config set created and set as active',
      });
      loadRecentConfigSets();
      setIsFormDialogOpen(false);
      navigate('/sampling'); // Navigate to the policy builder page
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create config set',
        variant: 'destructive',
      });
    }
  };

  const handleSetActive = async (configSet: ConfigSet) => {
    try {
      await setActive(configSet.id);
      toast({
        title: 'Success',
        description: 'Config set set as active',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to set config set as active',
        variant: 'destructive',
      });
    }
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
              <h2 className="text-2xl font-semibold mb-3">Create your first project</h2>
              <p className="text-muted-foreground text-lg mb-6">
                Create and manage sampling configurations to optimize your observability costs and control data ingestion.
              </p>
              <div className="flex gap-4 items-center">
                <Button 
                  size="lg"
                  onClick={() => setIsFormDialogOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create project
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
            Recent Projects
          </CardTitle>
          <CardDescription>Your recently accessed configuration sets</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : recentConfigSets.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No recent projects found
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {recentConfigSets.map((configSet) => (
                <Card
                  key={configSet.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium">{configSet.name}</h3>
                        <p className="text-sm text-muted-foreground">{configSet.description}</p>
                        <div className="flex gap-2 mt-2">
                          {configSet.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(configSet.createdAt).toLocaleDateString()}
                        </div>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => handleSetActive(configSet)}
                        >
                          <Pencil className="w-4 h-4" /> Edit Project
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
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Create a new configuration set that can be reused later.
            </DialogDescription>
          </DialogHeader>
          <ConfigSetForm
            onSubmit={handleCreateConfigSet}
            onCancel={() => setIsFormDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 