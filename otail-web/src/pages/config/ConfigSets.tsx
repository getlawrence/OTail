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
import { Pencil, Trash } from 'lucide-react';

export default function ConfigSetsPage() {
  const [configSets, setConfigSets] = useState<ConfigSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConfigSet, setSelectedConfigSet] = useState<ConfigSet | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadConfigSets();
  }, []);

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

  const handleDelete = async (configSet: ConfigSet) => {
    try {
      await configSetsApi.delete(configSet.id);
      toast({
        title: 'Success',
        description: 'Config set deleted successfully',
      });
      loadConfigSets();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete config set',
        variant: 'destructive',
      });
    }
    setIsDeleteDialogOpen(false);
  };

  const handleSubmit = async (data: Partial<ConfigSet>) => {
    try {
      if (!data.name || !data.type) {
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
          type: data.type,
          description: data.description,
          componentType: data.componentType,
          configuration: data.configuration || {},
          tags: data.tags,
        };
        await configSetsApi.create(createData);
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

  const filteredConfigSets = configSets.filter(
    (configSet) =>
      configSet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      configSet.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Config Sets</h1>
        <Button onClick={() => setIsFormDialogOpen(true)}>
          Create New Config Set
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search config sets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Component Type</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredConfigSets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No config sets found
                </TableCell>
              </TableRow>
            ) : (
              filteredConfigSets.map((configSet) => (
                <TableRow key={configSet.id}>
                  <TableCell className="font-medium">{configSet.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{configSet.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {configSet.componentType && (
                      <Badge>{configSet.componentType}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(configSet.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {configSet.tags?.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedConfigSet(configSet);
                          setIsFormDialogOpen(true);
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedConfigSet(configSet);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Config Set</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedConfigSet?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedConfigSet && handleDelete(selectedConfigSet)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedConfigSet ? 'Edit Config Set' : 'Create New Config Set'}
            </DialogTitle>
            <DialogDescription>
              {selectedConfigSet
                ? 'Update the configuration for this config set.'
                : 'Create a new configuration set that can be reused later.'}
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
    </div>
  );
} 