import { useEffect, useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { getAgents, fetchAgentLogs, updateConfig } from "@/api/agent"
import { Agent, Log } from "@/api/types"
import { LogsDialog } from "@/components/agents/LogsDialog"
import { ConfigDialog } from "@/components/agents/ConfigDialog"
import { ApplyConfigSetDialog } from "@/components/agents/ApplyConfigSetDialog"
import { OnboardingState } from "@/components/agents/OnboardingState"
import { load } from 'js-yaml'
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"

const AgentsPage = () => {
    const [agents, setAgents] = useState<Agent[]>([])
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
    const [configOpen, setConfigOpen] = useState(false)
    const [logsOpen, setLogsOpen] = useState(false)
    const [applyConfigSetOpen, setApplyConfigSetOpen] = useState(false)
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()
    const { organization } = useAuth()

    const fetchAgents = async () => {
        try {
            const data = await getAgents()
            setAgents(Object.values(data))
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch agents",
            })
            console.error(error)
        }
    }

    useEffect(() => {
        fetchAgents()
    }, [])

    const handleViewConfig = (agent: Agent) => {
        setSelectedAgent(agent)
        setConfigOpen(true)
    }

    const handleViewLogs = async (agent: Agent) => {
        setSelectedAgent(agent)
        setLoading(true)
        setLogsOpen(true)
        try {
            const logsData = await fetchAgentLogs(agent.InstanceId)
            setLogs(logsData)
        } catch (error) {
            console.error('Failed to fetch logs:', error)
            setLogs([])
        } finally {
            setLoading(false)
        }
    }

    const handleApplyConfigSet = (agent: Agent) => {
        setSelectedAgent(agent)
        setApplyConfigSetOpen(true)
    }

    const handleUpdateConfig = async (value: string) => {
        if (!selectedAgent) return

        try {
            const parsedConfig = JSON.stringify(load(value))
            await updateConfig(selectedAgent.InstanceId, parsedConfig)
            toast({
                variant: "default",
                title: "Success",
                description: "Configuration updated successfully",
            })
            setConfigOpen(false)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update configuration",
            })
            console.error('Failed to update config:', error)
        }
    }

    const tableColumns = columns({ 
        onViewConfig: handleViewConfig, 
        onViewLogs: handleViewLogs,
        onApplyConfigSet: handleApplyConfigSet 
    })

    // Show onboarding state if no agents are connected and org has never connected an agent
    if (agents.length === 0 && organization && !organization.has_connected_agent) {
        return (
            <div className="container mx-auto py-10">
                <OnboardingState 
                    onRefresh={fetchAgents} 
                    apiToken={organization.tokens[0]?.token || ''} 
                />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={tableColumns} data={agents} />
            
            {selectedAgent && (
                <>
                    <ConfigDialog
                        open={configOpen}
                        onOpenChange={setConfigOpen}
                        config={selectedAgent.EffectiveConfig}
                        onUpdate={handleUpdateConfig}
                    />

                    <LogsDialog
                        open={logsOpen}
                        onOpenChange={setLogsOpen}
                        logs={logs}
                        loading={loading}
                    />

                    <ApplyConfigSetDialog
                        open={applyConfigSetOpen}
                        onOpenChange={setApplyConfigSetOpen}
                        agent={selectedAgent}
                    />
                </>
            )}
        </div>
    )
}

export default AgentsPage
