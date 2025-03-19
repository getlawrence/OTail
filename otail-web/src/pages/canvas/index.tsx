import { useState, useCallback, useEffect, useRef } from 'react';
import OtelConfigCanvas from '@/components/canvas/OtelConfigCanvas';
import Editor, { OnChange } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { createDebounce } from '@/lib/utils';
import { Eye, EyeOff, Send, RefreshCw } from 'lucide-react';
import { ConfigSetActions } from '@/components/config/ConfigSetActions';
import { useActiveConfigSet } from '@/hooks/use-active-config-set';

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

  // Active config set state
  const { activeConfigSet, updateActiveConfig } = useActiveConfigSet();

  // Last update timestamp to prevent rapid updates
  const lastUpdateRef = useRef<number>(0);

  // Apply editor changes to canvas after delay
  const applyEditorChanges = useCallback(
    createDebounce((value: string) => {
      // Prevent updates if the source is canvas or if we're not editing
      if (updateSource.current === 'canvas' || !isEditing.current) {
        return;
      }

      // Prevent rapid updates (less than 1 second apart)
      const now = Date.now();
      if (now - lastUpdateRef.current < 1000) {
        return;
      }
      lastUpdateRef.current = now;

      updateSource.current = 'editor';
      setYaml(value);
      
      if (canvasRef.current?.parseYaml) {
        canvasRef.current.parseYaml(value);
      }

      // Update active config set if one is active and content has changed
      if (activeConfigSet && value !== yaml) {
        updateActiveConfig(value);
      }

      setIsSyncing(false);
      updateSource.current = null;
    }, 1000), // Reduced delay to 1 second for better responsiveness
    [activeConfigSet, updateActiveConfig, yaml]
  );

  const handleBuilderChange = useCallback((newYaml: string) => {
    // Only update editor if user is not currently editing and content has changed
    if (!isEditing.current && newYaml !== yaml) {
      updateSource.current = 'canvas';
      setYaml(newYaml);
      setEditorValue(newYaml);

      // Update active config set if one is active
      if (activeConfigSet) {
        updateActiveConfig(newYaml);
      }

      updateSource.current = null;
    }
  }, [activeConfigSet, updateActiveConfig, yaml]);

  const handleYamlChange: OnChange = useCallback((value: string | undefined) => {
    if (!value) {
      return;
    }

    // Prevent updates if the source is canvas
    if (updateSource.current === 'canvas') {
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
    }, 1500); // Reduced delay to 1.5 seconds
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