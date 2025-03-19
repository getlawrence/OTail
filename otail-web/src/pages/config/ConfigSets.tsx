import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { configSetsApi } from '@/api/configSets';
import type { ConfigSet } from '@/types/configSet';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ConfigSetForm } from '@/components/config/ConfigSetForm';
import { Pencil, Trash, Check } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useActiveConfigSet } from '@/hooks/use-active-config-set';

export default function ConfigSetsPage() {
  const [configSets, setConfigSets] = useState<ConfigSet[]>([]);
  const [_, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConfigSet, setSelectedConfigSet] = useState<ConfigSet | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();
  const { activeConfigSet, setActive } = useActiveConfigSet();

  useEffect(() => {
    loadConfigSets();
  }, []);

  useEffect(() => {
    // Handle selected config set from navigation state
    const state = location.state as { selectedConfigSetId?: string } | null;
    if (state?.selectedConfigSetId) {
      const configSet = configSets.find(cs => cs.id === state.selectedConfigSetId);
      if (configSet) {
        setSelectedConfigSet(configSet);
        setIsFormDialogOpen(true);
      }
    }
  }, [location.state, configSets]);

  const loadConfigSets = async () => {
    try {
      setLoading(true);
      const response = await configSetsApi.list();
      setConfigSets(response.configSets);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load config sets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedConfigSet) return;

    try {
      await configSetsApi.delete(selectedConfigSet.id);
      toast({
        title: 'Success',
        description: 'Config set deleted successfully',
      });
      loadConfigSets();
      setIsDeleteDialogOpen(false);
      setSelectedConfigSet(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete config set',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (data: Partial<ConfigSet>) => {
    try {
      if (!data.name) {
        toast({
          title: 'Error',
          description: 'Name and type are required',
          variant: 'destructive',
        });
        return;
      }

      if (selectedConfigSet) {
        await configSetsApi.update({ ...data, id: selectedConfigSet.id });
        toast({
          title: 'Success',
          description: 'Config set updated successfully',
        });
      } else {
        const createData = {
          name: data.name,
          description: data.description,
          configuration: data.configuration || {},
          tags: data.tags,
        };
        await configSetsApi.create(createData);
        // Dispatch project created event
        window.dispatchEvent(new Event('projectCreated'));
        toast({
          title: 'Success',
          description: 'Config set created successfully',
        });
      }
      loadConfigSets();
      setIsFormDialogOpen(false);
      setSelectedConfigSet(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save config set',
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

  const filteredConfigSets = configSets.filter(
    (configSet) =>
      configSet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      configSet.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setIsFormDialogOpen(true)}>
          Create Project
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConfigSets.map((configSet) => (
              <TableRow key={configSet.id}>
                <TableCell>{configSet.name}</TableCell>
                <TableCell>{configSet.description}</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {configSet.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {activeConfigSet?.id === configSet.id ? (
                    <Badge variant="default" className="flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSetActive(configSet)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedConfigSet(configSet);
                        setIsFormDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedConfigSet(configSet);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedConfigSet ? 'Edit Project' : 'Create Project'}
            </DialogTitle>
            <DialogDescription>
              {selectedConfigSet
                ? 'Edit the project details below.'
                : 'Fill in the details to create a new project.'}
            </DialogDescription>
          </DialogHeader>
          <ConfigSetForm
            initialData={selectedConfigSet || undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsFormDialogOpen(false);
              setSelectedConfigSet(null);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Config Set</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this config set? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedConfigSet(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 