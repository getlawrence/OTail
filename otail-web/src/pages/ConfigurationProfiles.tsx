import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { deploymentsApi } from '@/api/deployments';
import type { ConfigurationProfile } from '@/types/deployment';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Trash2, Code } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConfigurationProfileForm } from '@/components/deployment/ConfigurationProfileForm';

export default function ConfigurationProfiles() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<ConfigurationProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await deploymentsApi.listConfigurationProfiles();
      setProfiles(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load configuration profiles',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = async (data: Partial<ConfigurationProfile>) => {
    try {
      if (!data.name || !data.configuration) {
        toast({
          title: 'Error',
          description: 'Name and configuration are required',
          variant: 'destructive',
        });
        return;
      }

      await deploymentsApi.createConfigurationProfile({
        name: data.name,
        description: data.description,
        configuration: data.configuration,
      });

      toast({
        title: 'Success',
        description: 'Configuration profile created successfully',
      });
      loadProfiles();
      setIsFormDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create configuration profile',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      await deploymentsApi.deleteConfigurationProfile(profileId);
      toast({
        title: 'Success',
        description: 'Configuration profile deleted successfully',
      });
      loadProfiles();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete configuration profile',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Configuration Profiles</h1>
          <p className="text-muted-foreground">Manage your OpenTelemetry configuration profiles</p>
        </div>
        <Button onClick={() => setIsFormDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> New Profile
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Available Profiles
            </CardTitle>
            <CardDescription>Manage your configuration profiles and their settings</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : profiles.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No configuration profiles found
              </div>
            ) : (
              <div className="space-y-4">
                {profiles.map((profile) => (
                  <Card key={profile.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium">{profile.name}</h3>
                          <p className="text-sm text-muted-foreground">{profile.description}</p>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">v{profile.version}</Badge>
                            <Badge variant="outline">
                              {Object.keys(profile.configuration).length} Settings
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => handleDeleteProfile(profile.id)}
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
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Configuration Profile</DialogTitle>
            <DialogDescription>
              Create a new configuration profile for your OpenTelemetry agents.
            </DialogDescription>
          </DialogHeader>
          <ConfigurationProfileForm
            onSubmit={handleCreateProfile}
            onCancel={() => setIsFormDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 