import { Button } from '@/components/ui/button';
import { useActiveConfigSet } from '@/hooks/use-active-config-set';

export function ActiveConfigSetBanner() {
  const { activeConfigSet, clearActive } = useActiveConfigSet();

  if (!activeConfigSet) {
    return null;
  }

  return (
    <div className="flex-1 flex items-center justify-between ml-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-medium">
            Active Project: {activeConfigSet.name}
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