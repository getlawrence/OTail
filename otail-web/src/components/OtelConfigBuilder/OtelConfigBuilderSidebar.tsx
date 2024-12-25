import { DragEvent } from 'react';

const componentTypes = {
  receiver: ['otlp', 'jaeger', 'zipkin'],
  processor: ['batch', 'memory_limiter', 'tail_sampling'],
  exporter: ['otlp', 'jaeger', 'zipkin']
};

export const Sidebar = () => {
  const onDragStart = (event: DragEvent, nodeType: string, name: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('component/name', name);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 bg-background border-r p-4">
      <div className="space-y-4">
        {Object.entries(componentTypes).map(([type, components]) => (
          <div key={type}>
            <h3 className="font-semibold capitalize mb-2">{type}s</h3>
            <div className="space-y-2">
              {components.map((name) => (
                <div
                  key={name}
                  className="p-2 border rounded cursor-move hover:bg-accent"
                  draggable
                  onDragStart={(e) => onDragStart(e, type, name)}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 