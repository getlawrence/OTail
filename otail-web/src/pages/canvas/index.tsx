import { useState, useCallback, useEffect, useRef } from 'react';
import OtelConfigCanvas from '@/components/canvas/OtelConfigCanvas';
import Editor, { OnChange } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { createDebounce } from '@/lib/utils'; 
import { Eye, EyeOff, Send, RefreshCw } from 'lucide-react'; 
import { ConfigSetActions } from '@/components/config/ConfigSetActions';

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
  const initialYamlRef = useRef<string>(yaml);
  
  // Reference to canvas component
  const canvasRef = useRef<any>(null);
  
  // Track source of updates to prevent loops
  const updateSource = useRef<'editor' | 'canvas' | null>(null);
  
  // Flag to track if editor content is being edited
  const isEditing = useRef(false);
  
  // Timeout reference for sync indicator
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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

  // Handle changes from the canvas
  const handleBuilderChange = useCallback((newYaml: string) => {
    // Only update editor if user is not currently editing
    if (!isEditing.current) {
      updateSource.current = 'canvas';
      setYaml(newYaml);
      setEditorValue(newYaml);
      updateSource.current = null;
    }
  }, []);

  // Handle changes from the editor
  const handleYamlChange: OnChange = useCallback((value) => {
    if (!value) return;
    
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
    }, 3500); // Slightly longer than the debounce time
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
  );
}

export default CanvasPage;