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
import { Plus, FileUp, Clock, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useActiveConfigSet } from '@/hooks/use-active-config-set';

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
      
      await configSetsApi.create(createData);
      toast({
        title: 'Success',
        description: 'Config set created successfully',
      });
      loadRecentConfigSets();
      setIsFormDialogOpen(false);
      navigate('/config'); // Navigate to the config sets page
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIsFormDialogOpen(true)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New Project
            </CardTitle>
            <CardDescription>Start a new configuration from scratch</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/config')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Import Existing Configuration
            </CardTitle>
            <CardDescription>Import an existing configuration file</CardDescription>
          </CardHeader>
        </Card>
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
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => handleSetActive(configSet)}
                        >
                          <Check className="w-4 h-4" /> Set Active
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