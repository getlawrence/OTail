import { DragEvent, useState } from 'react';
import { ArrowDown, Bolt, ArrowUp } from 'lucide-react';
import { Button } from "@/components/ui/button";

const componentTypes = {
  receiver: ['otlp', 'jaeger', 'zipkin'],
  processor: ['batch', 'memory_limiter', 'tail_sampling'],
  exporter: ['otlp', 'jaeger', 'zipkin']
};

const componentIcons = {
  receiver: <ArrowDown size={20} />,
  processor: <Bolt size={20} />,
  exporter: <ArrowUp size={20} />
};

export const Sidebar = () => {
  const [activeType, setActiveType] = useState<string | null>(null);

  const onDragStart = (event: DragEvent, nodeType: string, name: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('component/name', name);
    event.dataTransfer.effectAllowed = 'move';
  };

  const toggleType = (type: string) => {
    setActiveType(activeType === type ? null : type);
  };

  return (
    <div className="absolute left-0 top-0 h-full flex">
      {/* Main sidebar with icons */}
      <div className="w-12 h-full bg-background/95 backdrop-blur-sm shadow-lg z-20 flex flex-col gap-1 p-1">
        {Object.entries(componentTypes).map(([type]) => (
          <Button
            variant="outline"
            key={type}
            onClick={() => toggleType(type)}
            className={`p-2 rounded-md transition-colors flex items-center justify-center
              ${activeType === type
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent/50'}`}
            title={type}
          >
            {componentIcons[type as keyof typeof componentIcons]}
          </Button>
        ))}
      </div>

      {/* Popup component list */}
      {activeType && (
        <div className="w-48 h-full bg-background/95 backdrop-blur-sm shadow-lg z-10 p-2 border-l">
          <h3 className="font-semibold capitalize mb-2">{activeType}s</h3>
          <div className="space-y-1">
            {componentTypes[activeType as keyof typeof componentTypes].map((name) => (
              <div
                key={name}
                className="p-2 rounded-md border cursor-move hover:bg-accent/10 transition-colors"
                draggable
                onDragStart={(e) => onDragStart(e, activeType, name)}
              >
                <div className="flex items-center gap-2">
                  {componentIcons[activeType as keyof typeof componentIcons]}
                  <span>{name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};