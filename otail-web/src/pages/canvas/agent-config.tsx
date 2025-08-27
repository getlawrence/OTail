import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import OtelConfigCanvas from '@/components/canvas/OtelConfigCanvas';
import Editor, { OnChange } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { createDebounce } from '@/lib/utils'; 
import { Eye, EyeOff, Send, RefreshCw } from 'lucide-react'; 
import { PipelineActions } from '@/components/config/PipelineActions';
import { agentsApi } from '@/api/agent';
import type { Agent } from '@/api/types';
import { useToast } from '@/hooks/use-toast';

interface AgentConfigPageProps {
  config?: string;
}

export const AgentConfigPage = ({ config }: AgentConfigPageProps) => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Agent state
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  
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
  
  // Load agent data
  useEffect(() => {
    if (agentId) {
      loadAgent();
    }
  }, [agentId]);
  
  const loadAgent = async () => {
    try {
      setLoading(true);
      const agents = await agentsApi.list();
      const foundAgent = agents.find(a => a.InstanceId === agentId);
      if (foundAgent) {
        setAgent(foundAgent);
        // Set initial config if available
        if (foundAgent.EffectiveConfig) {
          setYaml(foundAgent.EffectiveConfig);
          setEditorValue(foundAgent.EffectiveConfig);
          initialYamlRef.current = foundAgent.EffectiveConfig;
        }
      } else {
        toast({
          title: 'Error',
          description: 'Agent not found',
          variant: 'destructive',
        });
        navigate('/agents');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load agent',
        variant: 'destructive',
      });
      navigate('/agents');
    } finally {
      setLoading(false);
    }
  };
  
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

  const handleUpdateConfig = async () => {
    if (!agent || !editorValue) return;
    
    try {
      await agentsApi.updateConfig(agent.InstanceId, editorValue);
      toast({
        title: 'Success',
        description: 'Configuration updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update configuration',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>Loading agent...</span>
        </div>
      </div>
    );
  }

  if (!agent) {
    return null;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-3 p-3">
      {/* Page Title and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Agent Configuration</h1>
        </div>
        <div className="flex space-x-2 items-center">
          {isSyncing && !viewYaml && (
            <div className="flex items-center text-yellow-500 mr-2">
              <RefreshCw className="w-4 h-4 animate-spin mr-1" />
              <span className="text-xs">Syncing...</span>
            </div>
          )}
          <PipelineActions
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
          <Button 
            onClick={handleUpdateConfig} 
            className="flex items-center gap-2 send-button"
          >
            <Send className="w-4 h-4" /> Update Agent
          </Button>
        </div>
      </div>
      
      <div className={`grid ${viewYaml ? 'grid-cols-2' : 'grid-cols-1'} gap-3 flex-grow min-h-0`}>
        <div className="canvas-container min-h-0">
          <OtelConfigCanvas
            ref={canvasRef}
            onChange={handleBuilderChange}
            initialYaml={initialYamlRef.current}
          />
        </div>
        {viewYaml && (
          <div className="border rounded-lg overflow-hidden min-h-0">
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

export default AgentConfigPage;
