import { DragEvent, useState, useRef, useEffect } from 'react';
import { trackCanvas } from './analytics';
import { COLOR_SCHEME } from './constants';
import { ArrowDown, Bolt, ArrowUp, ArrowLeftRight, X, ChevronRight, Search, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { componentSchemas } from './dialog/componentSchemas';

// Create an optimized lookup object for component types
const componentTypes = Object.entries(componentSchemas).reduce((acc, [type, schema]) => {
  return {
    ...acc,
    [type]: Object.keys(schema)
  }
}, {} as Record<string, string[]>);

const componentIcons = {
  receivers: <ArrowDown size={20} />,
  processors: <Bolt size={20} />,
  exporters: <ArrowUp size={20} />,
  connectors: <ArrowLeftRight size={20} />
};

const typeLabels = {
  receivers: 'Receivers',
  processors: 'Processors',
  exporters: 'Exporters',
  connectors: 'Connectors'
};

const typeDescriptions = {
  receivers: 'Components that receive data from external sources',
  processors: 'Components that process and transform data',
  exporters: 'Components that send data to external destinations',
  connectors: 'Components that connect pipelines and convert data types'
};

const componentDescriptions: Record<string, Record<string, string>> = {
  receiver: {
    otlp: 'Receives data via OTLP protocol',
    jaeger: 'Receives Jaeger-formatted traces',
    zipkin: 'Receives Zipkin-formatted traces',
    prometheus: 'Scrapes Prometheus metrics',
    kafka: 'Receives data from Kafka topics',
    opencensus: 'Receives OpenCensus data',
    fluentforward: 'Receives data via Fluent Forward protocol',
    hostmetrics: 'Collects host metrics'
  },
  processor: {
    batch: 'Batches data before export',
    memory_limiter: 'Prevents memory exhaustion',
    tail_sampling: 'Samples traces at the tail',
    probabilistic_sampling: 'Samples data probabilistically',
    span: 'Processes span data',
    filter: 'Filters data based on conditions',
    resource: 'Modifies resource attributes',
    transform: 'Transforms data',
    k8s_attributes: 'Adds Kubernetes metadata',
    log_dedup: 'Deduplicates logs by detecting identical logs over a time range',
    metricstransform: 'Transforms metrics by renaming, adding/removing labels, and performing aggregations'
  },
  exporter: {
    otlp: 'Exports data via OTLP protocol',
    jaeger: 'Exports traces to Jaeger',
    zipkin: 'Exports traces to Zipkin',
    prometheus: 'Exports metrics to Prometheus',
    logging: 'Exports data to logs',
    file: 'Exports data to files',
    kafka: 'Exports data to Kafka topics',
    elasticsearch: 'Exports data to Elasticsearch',
    awsxray: 'Exports traces to AWS X-Ray',
    loadbalancing: 'Load balances data across multiple backends based on routing key'
  },
  connector: {
    count: 'Counts spans, span events, metrics, data points, and log records.',
    span_metrics: 'Aggregates Request, Error and Duration (R.E.D) OpenTelemetry metrics from span data.'
  },
};

export const Sidebar = () => {
  const [activeType, setActiveType] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedItem, setDraggedItem] = useState<{ type: string, name: string } | null>(null);
  const [hoveredItem, setHoveredItem] = useState<{ type: string, name: string } | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const onDragStart = (event: DragEvent, nodeType: string, name: string) => {
    setIsDragging(true);
    setDraggedItem({ type: nodeType, name });

    // Track component drag start
    trackCanvas.component.drag(nodeType, name);

    // Create a custom drag image
    const dragPreview = document.createElement('div');
    const colorMap: Record<string, keyof typeof COLOR_SCHEME> = {
      'receiver': 'receivers',
      'processor': 'processors',
      'exporter': 'exporters',
      'connector': 'connectors',

    };
    const schemeKey = colorMap[nodeType] || 'receivers';
    const scheme = COLOR_SCHEME[schemeKey];
    const baseColor = scheme.color;

    dragPreview.className = `p-3 rounded-lg shadow-xl border-2 border-${baseColor}-500 bg-${baseColor}-50 dark:bg-${baseColor}-900/30`;

    const content = document.createElement('div');
    content.className = 'flex items-center gap-2';

    const iconContainer = document.createElement('div');
    iconContainer.className = `flex items-center justify-center h-8 w-8 rounded-full bg-${baseColor}-500 text-white`;
    iconContainer.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${nodeType === 'receiver' ? 'arrow-down' : nodeType === 'processor' ? 'bolt' : 'arrow-up'}"><path d="${nodeType === 'receiver' ? 'M12 5v14M19 12l-7 7-7-7' : nodeType === 'processor' ? 'M13 3v18M7 16l6-6 6 6' : 'M12 19V5M5 12l7-7 7 7'}"></path></svg>`;

    const label = document.createElement('span');
    label.className = 'font-medium text-sm';
    label.textContent = name;

    content.appendChild(iconContainer);
    content.appendChild(label);
    dragPreview.appendChild(content);

    document.body.appendChild(dragPreview);

    // Set the drag image
    event.dataTransfer.setDragImage(dragPreview, 20, 20);

    // Set the data
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('component/name', name);
    event.dataTransfer.effectAllowed = 'move';

    // Remove the drag preview after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
  };

  const onDragEnd = () => {
    setIsDragging(false);
    setDraggedItem(null);
    setActiveType(null);
    if (isExpanded) {
      setIsExpanded(false);
    }
  };

  const handleTypeHover = (type: string) => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
    setActiveType(type);

    // Track component type selection
    trackCanvas.sidebar.selectComponentType(type);
  };

  const toggleType = (type: string) => {
    if (isExpanded) {
      const newActiveType = activeType === type ? null : type;
      setActiveType(newActiveType);

      // Track component type selection
      if (newActiveType) {
        trackCanvas.sidebar.selectComponentType(newActiveType);
      }
    } else {
      setIsExpanded(true);
      setActiveType(type);

      // Track component type selection
      trackCanvas.sidebar.selectComponentType(type);
    }
  };

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // Track sidebar expansion toggle
    trackCanvas.sidebar.toggleExpand(newExpandedState);

    if (!isExpanded) {
      setActiveType(null);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
      setActiveType(null);
      if (isExpanded) {
        setIsExpanded(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const filteredComponents = (type: string) => {
    if (!searchTerm) return componentTypes[type as keyof typeof componentTypes];
    return componentTypes[type as keyof typeof componentTypes].filter(name =>
      name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const typeColor = (type: string) => {
    // Map component types to their corresponding color scheme keys
    const colorMap: Record<string, keyof typeof COLOR_SCHEME> = {
      'receiver': 'receivers',
      'receivers': 'receivers',
      'processor': 'processors',
      'processors': 'processors',
      'exporter': 'exporters',
      'exporters': 'exporters',
      'connector': 'connectors',
      'connectors': 'connectors',
    };

    // Get the color scheme for this component type
    const schemeKey = colorMap[type] as keyof typeof COLOR_SCHEME;

    if (schemeKey && COLOR_SCHEME[schemeKey]) {
      const scheme = COLOR_SCHEME[schemeKey];
      const baseColor = scheme.color;

      // Use explicit Tailwind classes based on the color
      switch (baseColor) {
        case 'blue':
          return {
            bg: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
            text: 'text-white',
            border: 'border-blue-200 dark:border-blue-800',
            item: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300',
            icon: 'bg-blue-100 text-blue-600'
          };
        case 'green':
          return {
            bg: 'bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700',
            text: 'text-white',
            border: 'border-green-200 dark:border-green-800',
            item: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-green-700 dark:text-green-300',
            icon: 'bg-green-100 text-green-600'
          };
        case 'purple':
          return {
            bg: 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700',
            text: 'text-white',
            border: 'border-purple-200 dark:border-purple-800',
            item: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300',
            icon: 'bg-purple-100 text-purple-600'
          };
        case 'pink':
          return {
            bg: 'bg-pink-500 hover:bg-pink-600 dark:bg-pink-600 dark:hover:bg-pink-700',
            text: 'text-white',
            border: 'border-pink-200 dark:border-pink-800',
            item: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-pink-700 dark:text-pink-300',
            icon: 'bg-pink-100 text-pink-600'
          };
        case 'amber':
          return {
            bg: 'bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700',
            text: 'text-white',
            border: 'border-amber-200 dark:border-amber-800',
            item: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-amber-700 dark:text-amber-300',
            icon: 'bg-amber-100 text-amber-600'
          };
        default:
          // Fallback for unknown colors
          return {
            bg: 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700',
            text: 'text-white',
            border: 'border-gray-200 dark:border-gray-800',
            item: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300',
            icon: 'bg-gray-100 text-gray-600'
          };
      }
    }

    // Fallback for unknown types
    return {
      bg: 'bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700',
      text: 'text-white',
      border: 'border-gray-400 dark:border-gray-500',
      item: 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300',
      icon: 'bg-gray-100 text-gray-600'
    };
  };

  return (
    <TooltipProvider>
      <div
        ref={sidebarRef}
        className={`absolute left-4 top-4 flex items-start transition-all duration-300 z-[1000] ${isDragging ? 'opacity-90' : 'opacity-100'}`}
        onMouseLeave={() => {
          if (!isDragging && !draggedItem) {
            setActiveType(null);
          }
        }}
      >
        {/* Expanded sidebar */}
        <div
          className={`bg-white dark:bg-slate-900 shadow-xl border rounded-lg transition-all duration-300 overflow-hidden flex ${isExpanded ? 'w-[320px]' : 'w-14'}`}
          style={{ maxHeight: 'calc(100vh - 32px)' }}
        >
          {/* Sidebar icons column */}
          <div className="w-14 flex flex-col gap-3 p-2 border-r dark:border-slate-700 pt-4 pb-4 bg-slate-50 dark:bg-slate-800 rounded-l-lg">
            {Object.entries(componentTypes).map(([type]) => (
              <Tooltip key={type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleType(type)}
                    onMouseEnter={() => handleTypeHover(type)}
                    className={`h-10 w-10 rounded-lg transition-all duration-200 shadow-sm
                      ${activeType === type ? 'scale-110 ring-2 ring-offset-2 ' + typeColor(type).border : 'hover:scale-105'}
                      ${typeColor(type).bg} ${typeColor(type).text}`}
                  >
                    {componentIcons[type as keyof typeof componentIcons]}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" className="capitalize">
                  {typeLabels[type as keyof typeof typeLabels]}
                </TooltipContent>
              </Tooltip>
            ))}

            <div className="flex-1"></div>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleExpanded}
                  className="h-10 w-10 rounded-lg transition-all duration-200 shadow-sm mt-auto"
                >
                  {isExpanded ? <X size={16} /> : <ChevronRight size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Expanded content area */}
          <div className={`flex-1 transition-all duration-300 bg-white dark:bg-slate-900 rounded-r-lg ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 p-0 overflow-hidden'}`}>
            {activeType && (
              <div className="p-3 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base">{typeLabels[activeType as keyof typeof typeLabels]}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full">
                          <Info size={14} className="text-slate-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[220px]">
                        {typeDescriptions[activeType as keyof typeof typeDescriptions]}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                <div className="relative mb-3">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${activeType}...`}
                    className="pl-8 h-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto pr-1" style={{ overflowY: 'auto' }}>
                  {filteredComponents(activeType).length > 0 ? (
                    filteredComponents(activeType).map((name) => (
                      <div
                        key={name}
                        className={`p-2.5 rounded-md border cursor-move transition-all duration-200 ${typeColor(activeType).item} 
                          ${hoveredItem?.type === activeType && hoveredItem?.name === name ? 'shadow-md scale-[1.02]' : 'hover:shadow-sm'}`}
                        draggable
                        onDragStart={(e) => onDragStart(e, activeType, name)}
                        onDragEnd={onDragEnd}
                        onMouseEnter={() => setHoveredItem({ type: activeType, name })}
                        onMouseLeave={() => setHoveredItem(null)}
                        data-id={`${activeType}-${name}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center h-6 w-6 rounded-full ${typeColor(activeType).icon} shrink-0`}>
                            {componentIcons[activeType as keyof typeof componentIcons]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                                {componentSchemas[activeType][name].displayName}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-2">
                              {componentDescriptions[activeType]?.[name] || `${activeType} component`}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-muted-foreground">
                      <div className="text-sm">No components found</div>
                      <div className="text-xs mt-1">Try a different search term</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!activeType && isExpanded && (
              <div className="p-4 flex flex-col items-center justify-center h-full">
                <h3 className="font-semibold text-sm mb-2">Component Library</h3>
                <p className="text-xs text-center text-muted-foreground mb-4">Select a component type from the sidebar to get started</p>

                <div className="space-y-3 w-full">
                  {Object.entries(componentTypes).map(([type]) => (
                    <Button
                      key={type}
                      variant="outline"
                      className={`w-full justify-start gap-2 ${typeColor(type).item}`}
                      onClick={() => setActiveType(type)}
                    >
                      <div className={`flex items-center justify-center h-6 w-6 rounded-full ${typeColor(type).bg} ${typeColor(type).text}`}>
                        {componentIcons[type as keyof typeof componentIcons]}
                      </div>
                      <span>{typeLabels[type as keyof typeof typeLabels]}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating drag preview */}
        {isDragging && draggedItem && (
          <div className="fixed top-4 left-20 p-3 rounded-lg bg-white dark:bg-slate-900 shadow-xl border z-[1001] pointer-events-none">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={typeColor(draggedItem.type).item}>
                Dragging
              </Badge>
              <span className="font-medium text-sm">{draggedItem.name}</span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};