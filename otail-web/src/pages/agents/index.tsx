import { useEffect, useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { getAgents, fetchAgentLogs, updateConfig } from "@/api/agent"
import { Agent, Log } from "@/api/types"
import { LogsDialog } from "@/components/agents/LogsDialog"
import { ConfigDialog } from "@/components/agents/ConfigDialog"
import { load } from 'js-yaml'

const AgentsPage = () => {
    const [agents, setAgents] = useState<Agent[]>([])
    const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
    const [configOpen, setConfigOpen] = useState(false)
    const [logsOpen, setLogsOpen] = useState(false)
    const [logs, setLogs] = useState<Log[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        getAgents().then(data => {
            setAgents(Object.values(data))
        })
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

    const handleUpdateConfig = (value: string) => {
        if (selectedAgent) {
            updateConfig(selectedAgent.InstanceId, JSON.stringify(load(value)))
            setConfigOpen(false)
        }
    }

    const tableColumns = columns({ onViewConfig: handleViewConfig, onViewLogs: handleViewLogs })

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
                </>
            )}
        </div>
    )
}

export default AgentsPage
