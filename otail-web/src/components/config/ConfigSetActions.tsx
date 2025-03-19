import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SaveConfigDialog } from '@/components/config/SaveConfigDialog';
import { ImportConfigDialog } from '@/components/config/ImportConfigDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Download, Save } from 'lucide-react';
import { useConfigSets } from '@/hooks/use-config-sets';
import { useToast } from '@/hooks/use-toast';
import type { ConfigSet } from '@/types/configSet';

interface ConfigSetActionsProps {
  getCurrentState: () => string;
  onImport: (configuration: any) => void;
  className?: string;
}

export function ConfigSetActions({
  getCurrentState,
  onImport,
  className,
}: ConfigSetActionsProps) {
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [availableConfigSets, setAvailableConfigSets] = useState<ConfigSet[]>([]);
  const { toast } = useToast();
  const { saveToConfigSet, updateConfigSet, loadConfigSet, listConfigSets } = useConfigSets();

  const handleSave = async (name: string) => {
    try {
      const currentState = getCurrentState();
      await saveToConfigSet(name.trim(), currentState);
      toast({
        title: 'Success',
        description: 'Configuration saved successfully',
      });
      setSaveDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async (configSetId: string) => {
    try {
      const currentState = getCurrentState();
      await updateConfigSet(configSetId, currentState);
      toast({
        title: 'Success',
        description: 'Configuration updated successfully',
      });
      setSaveDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async (configSetId: string) => {
    try {
      const configSet = await loadConfigSet(configSetId);
      onImport(configSet.configuration);
      toast({
        title: 'Success',
        description: 'Configuration imported successfully',
      });
      setImportDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import configuration',
        variant: 'destructive',
      });
    }
  };

  const loadAvailableConfigSets = async () => {
    try {
      const configs = await listConfigSets();
      setAvailableConfigSets(configs);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load available config sets',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className={className}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                loadAvailableConfigSets();
                setImportDialogOpen(true);
              }}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Import Config Set
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                loadAvailableConfigSets();
                setSaveDialogOpen(true);
              }}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Save/Update Config Set
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <SaveConfigDialog
        open={isSaveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSave}
        onUpdate={handleUpdate}
        availableConfigSets={availableConfigSets}
      />

      <ImportConfigDialog
        open={isImportDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
        availableConfigSets={availableConfigSets}
      />
    </>
  );
} 