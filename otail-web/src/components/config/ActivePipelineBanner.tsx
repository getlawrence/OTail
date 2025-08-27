import { Button } from '@/components/ui/button';
import { useActivePipeline } from '@/hooks/use-active-pipeline';
import { useLocation } from 'react-router-dom';

export function ActivePipelineBanner() {
  const { activePipeline, clearActive } = useActivePipeline();
  const location = useLocation();

  // Don't show pipeline banner when on agent config page
  if (!activePipeline || location.pathname.match(/^\/agents\/([^\/]+)\/config$/)) {
    return null;
  }

  return (
    <div className="flex-1 flex items-center justify-between ml-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">
            Active Pipeline: {activePipeline.name}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={clearActive}
          variant="ghost"
          size="sm"
        >
          Clear Active
        </Button>
      </div>
    </div>
  );
} 