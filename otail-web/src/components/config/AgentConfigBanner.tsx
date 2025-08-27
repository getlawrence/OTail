import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { agentsApi } from '@/api/agent';
import type { Agent } from '@/api/types';

export function AgentConfigBanner() {
  const navigate = useNavigate();
  const location = useLocation();
  const [agent, setAgent] = useState<Agent | null>(null);

  // Check if we're on an agent config page
  const isAgentConfigPage = location.pathname.match(/^\/agents\/([^\/]+)\/config$/);
  const agentId = isAgentConfigPage ? isAgentConfigPage[1] : null;

  useEffect(() => {
    if (agentId) {
      loadAgent();
    } else {
      setAgent(null);
    }
  }, [agentId]);

  const loadAgent = async () => {
    if (!agentId) return;
    
    try {
      const agents = await agentsApi.list();
      const foundAgent = agents.find(a => a.InstanceId === agentId);
      setAgent(foundAgent || null);
    } catch (error) {
      console.error('Failed to load agent:', error);
      setAgent(null);
    }
  };

  if (!isAgentConfigPage || !agent) {
    return null;
  }

  return (
    <div className="flex-1 flex items-center justify-between ml-4">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm font-medium">
            Agent Configuration: {agent.InstanceId}
          </span>
          <span className="text-xs text-muted-foreground">
            Status: {agent.Status?.health?.healthy ? 'Healthy' : 'Unhealthy'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={() => navigate('/agents')}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Agents
        </Button>
      </div>
    </div>
  );
}
