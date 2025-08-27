import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { agentsApi } from "@/api/agent"
import type { Agent, Log } from "@/api/types"
import { LogsDialog } from "@/components/agents/LogsDialog"
import { ApplyPipelineDialog } from "@/components/agents/ApplyPipelineDialog"
import { OnboardingState } from "@/components/agents/OnboardingState"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const AgentsPage = () => {
    const [agents, setAgents] = useState<Agent[]>([])
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
    const [logsOpen, setLogsOpen] = useState(false)
    const [applyPipelineOpen, setApplyPipelineOpen] = useState(false)
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [isConnectAgentDialogOpen, setIsConnectAgentDialogOpen] = useState(false)
    const { toast } = useToast()
    const { organization } = useAuth()
    const navigate = useNavigate()

    const fetchAgents = async () => {
        try {
            const data = await agentsApi.list()
            setAgents(data)
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
        navigate(`/agents/${agent.InstanceId}/config`)
    }

    const handleViewLogs = async (agent: Agent) => {
        setSelectedAgent(agent)
        setLoading(true)
        setLogsOpen(true)
        try {
            const logsData = await agentsApi.getLogs(agent.InstanceId)
            setLogs(logsData)
        } catch (error) {
            console.error('Failed to fetch logs:', error)
            setLogs([])
        } finally {
            setLoading(false)
        }
    }

    const handleApplyPipeline = (agent: Agent) => {
        setSelectedAgent(agent)
        setApplyPipelineOpen(true)
    }

    const handleViewDetails = (agent: Agent) => {
        navigate(`/agents/${agent.InstanceId}`)
    }



    const tableColumns = columns({
        onViewConfig: handleViewConfig,
        onViewLogs: handleViewLogs,
        onApplyPipeline: handleApplyPipeline,
        onViewDetails: handleViewDetails
    })

    // Show onboarding state if no agents are connected and org has never connected an agent
    if (agents.length === 0 && organization && !organization.has_connected_agent) {
        return (
            <OnboardingState
                onRefresh={fetchAgents}
                apiToken={organization.tokens?.[0]?.token || ''}
            />
        )
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Agents</h1>
                <Button onClick={() => setIsConnectAgentDialogOpen(true)}>
                    Connect Agent
                </Button>
            </div>

            <div className="mb-4">
                <Input
                    placeholder="Search agents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <DataTable columns={tableColumns} data={agents} />
            {<Dialog open={isConnectAgentDialogOpen} onOpenChange={() => setIsConnectAgentDialogOpen(!isConnectAgentDialogOpen)}>
                <DialogContent>
                    <OnboardingState
                        onRefresh={fetchAgents}
                        apiToken={organization?.tokens?.[0]?.token || ''}
                    />
                </DialogContent>
            </Dialog>}

            {selectedAgent && (
                <>
                    <LogsDialog
                        open={logsOpen}
                        onOpenChange={setLogsOpen}
                        logs={logs}
                        loading={loading}
                    />

                    <ApplyPipelineDialog
                        open={applyPipelineOpen}
                        onOpenChange={setApplyPipelineOpen}
                        agent={selectedAgent}
                    />
                </>
            )}
        </>
    )
}

export default AgentsPage
