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
import { Agent } from "@/api/types"

interface ColumnsProps {
    onViewConfig: (agent: Agent) => void
    onViewLogs: (agent: Agent) => void
    onApplyConfigSet: (agent: Agent) => void
}

export const columns = ({ onViewConfig, onViewLogs, onApplyConfigSet }: ColumnsProps): ColumnDef<Agent>[] => [
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
        accessorKey: "Status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("Status") as any;
            if (status === undefined) {
                return row.original.Status?.health?.last_error || "Unknown";
            }
            return status?.health?.healthy ? "Healthy" : "No";
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const agent = row.original;
            return (
                <>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onViewConfig(agent)}>
                                View config
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onViewLogs(agent)}>
                                View logs
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onApplyConfigSet(agent)}>
                                Apply config set
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </>
            )
        },
    }
]
