"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import OtelConfig from "@/config/page"
import { Agent } from "@/api/types"
import { fetchAgentLogs, updateConfig } from "@/api/agent"
import { load } from 'js-yaml';


export const columns: ColumnDef<Agent>[] = [
    {
        accessorKey: "InstanceId",
        header: "Instance Id",
    },
    {
        accessorKey: "StartedAt",
        header: "Started At",
        cell: ({ getValue }) => {
            const date = getValue() as string;
            return date ? new Date(date).toLocaleString() : "";
        },
    },
    {
        accessorKey: "Status.health.healthy",
        header: "Health",
        cell: ({ row }) => {
            const healthy = row.getValue("Status.health.healthy");
            if (healthy === undefined) {
                return row.original.Status?.health?.last_error || "Unknown";
            }
            return healthy ? "Yes" : "No";
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const agent = row.original;
            const [configOpen, setConfigOpen] = useState(false);
            const [logsOpen, setLogsOpen] = useState(false);
            const [logs, setLogs] = useState<string>("");
            const [loading, setLoading] = useState(false);

            const onUpdate = (value: string) => {
                updateConfig(agent.InstanceId, JSON.stringify(load(value)));
                setConfigOpen(false);
            }

            const handleViewLogs = async () => {
                setLoading(true);
                setLogsOpen(true);
                try {
                    const logsData = await fetchAgentLogs(agent.InstanceId);
                    setLogs(logsData);
                } catch (error) {
                    console.error('Failed to fetch logs:', error);
                    setLogs('Failed to fetch logs');
                } finally {
                    setLoading(false);
                }
            };

            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => setConfigOpen(true)}>
                                View config
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleViewLogs}>
                                View logs
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={configOpen} onOpenChange={setConfigOpen}>
                        <DialogContent className="max-w-[90vw] max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>Agent Configuration</DialogTitle>
                            </DialogHeader>
                            <div className="h-[80vh] overflow-auto">
                                <OtelConfig config={agent.EffectiveConfig} onUpdate={onUpdate} />
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
                        <DialogContent className="max-w-[90vw] max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>Agent Logs</DialogTitle>
                            </DialogHeader>
                            <div className="h-[80vh] overflow-auto">
                                {loading ? (
                                    <div>Loading logs...</div>
                                ) : (
                                    <pre className="whitespace-pre-wrap break-words">{logs}</pre>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )
        },
    }
]
