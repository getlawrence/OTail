import { useState, useCallback, useEffect, useRef } from 'react';
import OtelConfigBuilder from '@/components/OtelConfigBuilder/OtelConfigBuilder';
import Editor, { OnChange } from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { createDebounce } from '@/lib/utils'; // Import our custom debounce

interface ConfigPageProps {
  config?: string;
}

export default function ConfigPage({ config }: ConfigPageProps) {
  const [yaml, setYaml] = useState<string>(() => config || '');
  const [viewYaml, setViewYaml] = useState(true);
  const [editorValue, setEditorValue] = useState(yaml);
  const initialYamlRef = useRef<string>(yaml);

  // Create debounced function with our custom implementation
  const debouncedSetYaml = useCallback(
    createDebounce((value: string) => {
      setYaml(value);
    }, 300),
    []
  );

  const handleBuilderChange = useCallback((newYaml: string) => {
    setYaml(newYaml);
    setEditorValue(newYaml);
  }, []);

  const handleYamlChange: OnChange = useCallback((value) => {
    if (!value) return;
    setEditorValue(value);
    debouncedSetYaml(value);
  }, [debouncedSetYaml]);

  useEffect(() => {
    setEditorValue(yaml);
  }, [yaml]);

  useEffect(() => {
    initialYamlRef.current = yaml;
  }, [yaml]);

  // Cleanup debounced function
  useEffect(() => {
    return () => {
      debouncedSetYaml.cancel();
    };
  }, [debouncedSetYaml]);

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuration Canvas</h1>
        <Button onClick={() => setViewYaml(!viewYaml)} className="text-sm">
          Toggle YAML View
        </Button>
      </div>
      <div className={`grid ${viewYaml ? 'grid-cols-1' : 'grid-cols-2'} gap-4 flex-grow`}>
        <OtelConfigBuilder
          onChange={handleBuilderChange}
          initialYaml={initialYamlRef.current}
        />
        {!viewYaml && (
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
            />
          </div>
        )}
      </div>
    </div>
  );
}