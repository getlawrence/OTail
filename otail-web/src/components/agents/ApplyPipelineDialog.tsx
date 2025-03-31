"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { usePipelines } from "@/hooks/use-pipelines"
import { Agent } from "@/api/types"
import { load } from "js-yaml"
import { Pipeline } from "@/types/pipeline"
import { agentsApi } from "@/api/agent"

interface ApplyPipelineDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    agent: Agent | null
}

export function ApplyPipelineDialog({ open, onOpenChange, agent }: ApplyPipelineDialogProps) {
    const [selectedPipeline, setSelectedPipeline] = useState<string>("")
    const [pipelines, setPipelines] = useState<Pipeline[]>([])
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const { listPipelines } = usePipelines()

    useEffect(() => {
        if (open) {
            loadPipelines()
        }
    }, [open])

    const loadPipelines = async () => {
        try {
            setLoading(true)
            const pipelines = await listPipelines()
            setPipelines(pipelines)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load pipelines",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleApply = async () => {
        if (!agent || !selectedPipeline) return

        try {
            setLoading(true)
            const pipeline = pipelines.find(pipeline => pipeline.id === selectedPipeline)
            if (!pipeline) {
                throw new Error("Pipeline not found")
            }
            const parsedConfig = JSON.stringify(load(pipeline.configuration))
            await agentsApi.updateConfig(agent.InstanceId, parsedConfig)
            toast({
                title: "Success",
                description: "Pipeline applied successfully",
            })
            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to apply pipeline",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Apply Pipeline Configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Pipeline Configuration</label>
                        <Select
                            value={selectedPipeline}
                            onValueChange={setSelectedPipeline}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a pipeline" />
                            </SelectTrigger>
                            <SelectContent>
                                {pipelines.map((pipeline) => (
                                    <SelectItem key={pipeline.id} value={pipeline.id}>
                                        {pipeline.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApply}
                            disabled={!selectedPipeline || loading}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 