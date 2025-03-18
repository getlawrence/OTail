import { useState, useCallback, useEffect, useRef } from 'react';
import OtelConfigCanvas from '@/components/canvas/OtelConfigCanvas';
import Editor, { OnChange } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { createDebounce } from '@/lib/utils';
import { Eye, EyeOff, Send, RefreshCw } from 'lucide-react';
import { ConfigSetActions } from '@/components/config/ConfigSetActions';
import { SaveConfigDialog } from '@/components/config/SaveConfigDialog';
import { ImportConfigDialog } from '@/components/config/ImportConfigDialog';
import { useConfigSets } from '@/hooks/use-config-sets';
import { useToast } from '@/hooks/use-toast';
import { ConfigSet } from '@/types/configSet';

interface CanvasPageProps {
  config?: string;
  onUpdate?: (value: string) => void
}

export const CanvasPage = ({ config, onUpdate }: CanvasPageProps) => {
  // Main YAML state that drives both the editor and canvas
  const [yaml, setYaml] = useState<string>(() => config || '');

  // UI state
  const [viewYaml, setViewYaml] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Editor state - separate from main YAML to prevent cursor jumping
  const [editorValue, setEditorValue] = useState(yaml);

  // Track initial YAML for canvas initialization
  const initialYamlRef = useRef<string>(config || '');

  // Reference to canvas component
  const canvasRef = useRef<any>(null);

  // Track source of updates to prevent loops
  const updateSource = useRef<'editor' | 'canvas' | null>(null);

  // Flag to track if editor content is being edited
  const isEditing = useRef(false);

  // Timeout reference for sync indicator
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // New state for dialogs
  const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
  const [isImportDialogOpen, setImportDialogOpen] = useState(false);
  const [availableConfigSets, setAvailableConfigSets] = useState<ConfigSet[]>([]);
  const { toast } = useToast();
  const { saveToConfigSet, loadConfigSet, listConfigSets } = useConfigSets();

  // Apply editor changes to canvas after delay
  const applyEditorChanges = useCallback(
    createDebounce((value: string) => {
      if (updateSource.current === 'editor') {
        setYaml(value);
        if (canvasRef.current && canvasRef.current.parseYaml) {
          canvasRef.current.parseYaml(value);
        }
        // Hide syncing indicator after changes are applied
        setIsSyncing(false);
      }
    }, 3000), // Increased delay to 3 seconds for more typing time
    []
  );

  const handleBuilderChange = useCallback((newYaml: string) => {
    // Only update editor if user is not currently editing
    if (!isEditing.current) {
      updateSource.current = 'canvas';
      setYaml(newYaml);
      setEditorValue(newYaml);
      updateSource.current = null;
    }
  }, []);

  const handleYamlChange: OnChange = useCallback((value: string | undefined) => {
    if (!value) {
      return;
    }

    isEditing.current = true;
    updateSource.current = 'editor';

    // Update editor value immediately to prevent cursor jumping
    setEditorValue(value);

    // Show syncing indicator
    setIsSyncing(true);

    // Schedule canvas update with debounce
    applyEditorChanges(value);

    // Reset editing flag after a delay
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(() => {
      isEditing.current = false;
    }, 3500);
  }, [applyEditorChanges]);


  const handleConfigImport = (configuration: any) => {
    handleYamlChange(configuration, {
      changes: [],
      eol: '\n',
      versionId: 0,
      isUndoing: false,
      isRedoing: false,
      isFlush: false,
      isEolChange: false
    });
  };

  const handleSave = async (name: string) => {
    try {
      await saveToConfigSet(name.trim(), 'component', editorValue, {
        componentType: 'collector',
      });
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

  const handleImport = async (configSetId: string) => {
    try {
      const configSet = await loadConfigSet(configSetId);
      handleConfigImport(configSet.configuration);
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
      const filtered = configs.filter(
        (config) => config.type === 'component' && config.componentType === 'collector'
      );
      setAvailableConfigSets(filtered);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load available config sets',
        variant: 'destructive',
      });
    }
  };

  // Cleanup debounced function and timeouts
  useEffect(() => {
    return () => {
      applyEditorChanges.cancel();
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [applyEditorChanges]);

  return (
    <>
      <SaveConfigDialog
        open={isSaveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        onSave={handleSave}
      />
      
      <ImportConfigDialog
        open={isImportDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImport={handleImport}
        availableConfigSets={availableConfigSets}
      />

      <div className="flex flex-col h-full gap-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Configuration Canvas</h1>
          <div className="flex space-x-2 items-center">
            {isSyncing && !viewYaml && (
              <div className="flex items-center text-yellow-500 mr-2">
                <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                <span className="text-xs">Syncing...</span>
              </div>
            )}
            <ConfigSetActions
              type="canvas"
              getCurrentState={() => editorValue}
              onImport={handleConfigImport}
            />
            <Button
              onClick={() => setViewYaml(!viewYaml)}
              variant="outline"
              className="flex items-center gap-2 yaml-toggle"
            >
              {viewYaml ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {viewYaml ? 'Hide YAML' : 'Show YAML'}
            </Button>
            {config && (
              <Button
                onClick={() => onUpdate?.(editorValue)}
                className="flex items-center gap-2 send-button"
              >
                <Send className="w-4 h-4" /> Send to Agent
              </Button>
            )}
          </div>
        </div>
        <div className={`grid ${viewYaml ? 'grid-cols-2' : 'grid-cols-1'} gap-4 flex-grow`}>
          <div className="canvas-container">
            <OtelConfigCanvas
              ref={canvasRef}
              onChange={handleBuilderChange}
              initialYaml={initialYamlRef.current}
            />
          </div>
          {viewYaml && (
            <div className="border rounded-lg overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="yaml"
                value={editorValue}
                onChange={handleYamlChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
                className="monaco-editor"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default CanvasPage;