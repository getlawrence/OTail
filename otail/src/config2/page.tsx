import OtelConfigBuilder from '@/components/OtelConfigBuilder';
import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';

export default function ConfigPage() {
  const [yaml, setYaml] = useState('');
  const [viewYaml, setViewYaml] = useState(true);

  return (
    <div className="flex flex-col h-full gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Configuration Canvas</h1>
        <Button onClick={() => setViewYaml(!viewYaml)} className="text-sm">Toggle YAML View</Button>
      </div>
      <div className={`grid ${viewYaml ? 'grid-cols-1' : 'grid-cols-2'} gap-4 flex-grow`}>
        <OtelConfigBuilder onChange={setYaml} />
        {!viewYaml && <div className="border rounded-lg overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="yaml"
            value={yaml}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              readOnly: true
            }}
          />
        </div>
        }
      </div>
    </div>
  );
} 