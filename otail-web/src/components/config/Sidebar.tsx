import { DragEvent, useState } from 'react';
import { ArrowDown, Bolt, ArrowUp, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const componentTypes = {
  receiver: ['otlp', 'jaeger', 'zipkin', 'prometheus', 'kafka', 'opencensus', 'fluentforward', 'hostmetrics'],
  processor: ['batch', 'memory_limiter', 'tail_sampling', 'probabilistic_sampling', 'span', 'filter', 'resource', 'transform', 'k8s_attributes'],
  exporter: ['otlp', 'jaeger', 'zipkin', 'prometheus', 'logging', 'file', 'kafka', 'elasticsearch', 'awsxray']
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

  const onDragEnd = () => {
    // Close the sidebar when drag operation ends
    setActiveType(null);
  };

  const toggleType = (type: string) => {
    setActiveType(activeType === type ? null : type);
  };

  return (
    <TooltipProvider>
      <div className="absolute left-4 top-4 h-auto flex">
        {/* Main sidebar with icons */}
        <div className="w-14 rounded-lg bg-background/95 dark:bg-background/80 backdrop-blur-sm shadow-lg z-20 flex flex-col gap-3 p-2 border">
          {Object.entries(componentTypes).map(([type]) => (
            <Tooltip key={type}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeType === type ? "default" : "ghost"}
                  size="icon"
                  onClick={() => toggleType(type)}
                  className={`h-10 w-10 rounded-lg transition-all duration-200 shadow-sm
                    ${activeType === type ? 'scale-110' : 'hover:scale-105'}
                    ${type === 'receiver' ? 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white' : ''}
                    ${type === 'processor' ? 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white' : ''}
                    ${type === 'exporter' ? 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 text-white' : ''}`}
                >
                  {componentIcons[type as keyof typeof componentIcons]}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="capitalize">
                Add {type}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Popup component list */}
        {activeType && (
          <div className="w-56 rounded-lg bg-background/95 dark:bg-background/80 backdrop-blur-sm shadow-lg z-10 p-3 border dark:border-border/40 ml-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold capitalize text-sm">{activeType} Components</h3>
            </div>
            <div className="space-y-2">
              {componentTypes[activeType as keyof typeof componentTypes].map((name) => {
                const typeColor = {
                  'receiver': 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 hover:bg-blue-200/50 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300',
                  'processor': 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800 hover:bg-green-200/50 dark:hover:bg-green-800/50 text-green-700 dark:text-green-300',
                  'exporter': 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800 hover:bg-purple-200/50 dark:hover:bg-purple-800/50 text-purple-700 dark:text-purple-300'
                }[activeType];
                
                return (
                  <div
                    key={name}
                    className={`p-2 rounded-md border cursor-move transition-all duration-200 ${typeColor} hover:shadow-md`}
                    draggable
                    onDragStart={(e) => onDragStart(e, activeType, name)}
                    onDragEnd={onDragEnd}
                  >
                    <div className="flex items-center gap-2">
                      {componentIcons[activeType as keyof typeof componentIcons]}
                      <span className="font-medium">{name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};