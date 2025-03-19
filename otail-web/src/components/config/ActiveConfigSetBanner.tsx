import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { useActiveConfigSet } from '@/hooks/use-active-config-set';

export function ActiveConfigSetBanner() {
  const { activeConfigSet, hasUnsavedChanges, saveActiveConfig, clearActive } = useActiveConfigSet();

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
        {hasUnsavedChanges && (
          <Badge variant="destructive" className="text-xs">
            Unsaved Changes
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        {hasUnsavedChanges && (
          <Button
            onClick={saveActiveConfig}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Changes
          </Button>
        )}
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