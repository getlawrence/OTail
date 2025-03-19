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
import { useConfigSets } from "@/hooks/use-config-sets"
import { ConfigSet } from "@/types/configSet"
import { Agent } from "@/api/types"
import { updateConfig } from "@/api/agent"

interface ApplyConfigSetDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    agent: Agent | null
}

export function ApplyConfigSetDialog({ open, onOpenChange, agent }: ApplyConfigSetDialogProps) {
    const [selectedConfigSet, setSelectedConfigSet] = useState<string>("")
    const [configSets, setConfigSets] = useState<ConfigSet[]>([])
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const { listConfigSets } = useConfigSets()

    useEffect(() => {
        if (open) {
            loadConfigSets()
        }
    }, [open])

    const loadConfigSets = async () => {
        try {
            setLoading(true)
            const sets = await listConfigSets()
            setConfigSets(sets)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load config sets",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    const handleApply = async () => {
        if (!agent || !selectedConfigSet) return

        try {
            setLoading(true)
            const configSet = configSets.find(set => set.id === selectedConfigSet)
            if (!configSet) {
                throw new Error("Config set not found")
            }

            await updateConfig(agent.InstanceId, JSON.stringify(configSet.configuration))
            toast({
                title: "Success",
                description: "Config set applied successfully",
            })
            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to apply config set",
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
                    <DialogTitle>Apply Config Set</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Select Config Set</label>
                        <Select
                            value={selectedConfigSet}
                            onValueChange={setSelectedConfigSet}
                            disabled={loading}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a config set" />
                            </SelectTrigger>
                            <SelectContent>
                                {configSets.map((set) => (
                                    <SelectItem key={set.id} value={set.id}>
                                        {set.name}
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
                            disabled={!selectedConfigSet || loading}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 