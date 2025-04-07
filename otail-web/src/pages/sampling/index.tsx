'use client'

import { useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfigViewer } from '@/components/simulation/config-viewer'
import { SimulationViewer } from '@/components/simulation/simulation-viewer'
import { PolicyBuilder } from '@/components/policy/policy-builder'
import { Policy, PolicyType } from '@/types/policy'
import { useConfigState } from '@/hooks/use-config-state';
import { trackSampling } from '@/utils/events';
import { MoreHorizontal, Pencil, PlayCircle } from "lucide-react";
import { PipelineActions } from '@/components/config/PipelineActions';
import { toEmptyCollectorConfig } from './utils';
import { useActivePipeline } from '@/hooks/use-active-pipeline';
import yaml from 'js-yaml';
import { createNewPolicy } from '@/lib/policy/utils';

type Mode = 'Edit' | 'Test'


const ModeToggle = ({ mode, onToggleMode }: { mode: Mode; onToggleMode: () => void }) => {
  const handleModeChange = (newMode: Mode) => {
    if (mode !== newMode) {
      trackSampling.modeChange(mode, newMode);
      onToggleMode();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id="test-mode-button"
          variant="outline"
          size="sm"
          onClick={() => handleModeChange(mode === 'Edit' ? 'Test' : 'Edit')}
          className="gap-2"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleModeChange('Edit')} className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit Mode
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleModeChange('Test')} className="gap-2">
          <PlayCircle className="h-4 w-4" />
          Test Mode
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const ConfigEditor = () => {
  const {
    policies,
    mode,
    evaluationResults,
    finalDecision,
    toggleMode,
    handleAddPolicy,
    handleUpdatePolicy,
    handleRemovePolicy,
    handleViewerChange,
    updatePolicies,
  } = useConfigState();

  const { activePipeline, updateActiveConfig } = useActivePipeline();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    if (activePipeline?.configuration && !initialLoadDone.current) {
      const cfg = yaml.load(activePipeline.configuration) as any;
      const policies = cfg.processors?.tail_sampling?.policies || [];
      if (Array.isArray(policies)) {
        updatePolicies(policies);
        initialLoadDone.current = true;
      }
    }
  }, [activePipeline])

  const handlePolicyAdd = async (policyType: PolicyType) => {
    const policy = createNewPolicy(policyType);
    handleAddPolicy(policy);
    trackSampling.policyBuilderAction('add', policyType);
    if (activePipeline) {
      await updateActiveConfig(toEmptyCollectorConfig([...policies, policy]));
    }
  };

  const handlePolicyUpdate = async (index: number, updatedPolicy: Policy) => {
    const updatedPolicies = [...policies];
    updatedPolicies[index] = updatedPolicy;
    handleUpdatePolicy(index, updatedPolicy);
    trackSampling.policyBuilderAction('update', updatedPolicy.type);
    if (activePipeline) {
      await updateActiveConfig(toEmptyCollectorConfig(updatedPolicies));
    }
  };

  const handlePolicyRemove = async (index: number, policy: Policy) => {
    const updatedPolicies = policies.filter((_, i) => i !== index);
    handleRemovePolicy(index);
    trackSampling.policyBuilderAction('remove', policy.type);
    if (activePipeline) {
      await updateActiveConfig(toEmptyCollectorConfig(updatedPolicies));
    }
  };

  const handleConfigImport = async (configuration: any) => {
    const cfg = yaml.load(configuration) as any;
    const policies = cfg.processors?.tail_sampling?.policies || [];
    if (Array.isArray(policies)) {
      updatePolicies(policies);
      trackSampling.policyBuilderAction('import_config_set', '');
      if (activePipeline) {
        await updateActiveConfig(toEmptyCollectorConfig(policies));
      }
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 flex-1">
        {/* Left Panel - Policy Editor */}
        <div className="flex flex-col h-full min-h-0">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-muted/5">
              <div>
                <h2 className="text-lg font-medium">Policy Builder</h2>
                <p className="text-sm text-muted-foreground">Configure your sampling policies</p>
              </div>
              <PipelineActions
                getCurrentState={() => toEmptyCollectorConfig(policies)}
                onImport={handleConfigImport}
              />
            </div>
            <div className="p-6 h-full overflow-auto policy-builder">
              <PolicyBuilder
                policies={policies}
                addPolicy={handlePolicyAdd}
                updatePolicy={handlePolicyUpdate}
                removePolicy={handlePolicyRemove}
                evaluationResult={evaluationResults}
              />
            </div>
          </div>
        </div>

        {/* Right Panel - Configuration/Simulation */}
        <div className="flex flex-col h-full min-h-0">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm h-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-muted/5">
              <div>
                <h2 className="text-lg font-medium">
                  {mode === 'Edit' ? 'YAML Configuration' : 'Validate Sampling Rules with OTEL Data'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {mode === 'Edit'
                    ? 'Edit your configuration in YAML format'
                    : 'Test and validate your sampling rules'
                  }
                </p>
              </div>
              <div className="mode-toggle">
                <ModeToggle mode={mode} onToggleMode={toggleMode} />
              </div>
            </div>
            <div className="p-4 h-full overflow-auto config-viewer">
              {mode === 'Edit' ? (
                <ConfigViewer
                  policies={policies}
                  onChange={handleViewerChange}
                />
              ) : (
                <SimulationViewer
                  finalDecision={finalDecision}
                  onChange={handleViewerChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigEditor;
