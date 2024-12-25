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

export type Agent = {
    id: string;
    status: "pending" | "processing" | "success" | "failed";
    EffectiveConfig: string;
}

export type Agents = {
    [key: string]: Agent
}

export const columns: ColumnDef<Agent>[] = [
    {
        accessorKey: "InstanceId",
        header: "InstanceId",
    },
    {
        accessorKey: "StartedAt",
        header: "StartedAt",
    },
    {
        accessorKey: "Status.health.healthy",
        header: "Status",
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const agent = row.original
            const [configOpen, setConfigOpen] = useState(false)

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
                            <DropdownMenuSeparator />
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={configOpen} onOpenChange={setConfigOpen}>
                        <DialogContent className="max-w-[90vw] max-h-[90vh]">
                            <DialogHeader>
                                <DialogTitle>Agent Configuration</DialogTitle>
                            </DialogHeader>
                            <div className="h-[80vh] overflow-auto">
                                <OtelConfig config={agent.EffectiveConfig} onUpdate={(_value: string) => setConfigOpen(false)} />
                            </div>
                        </DialogContent>
                    </Dialog>
                </>
            )
        },
    }
]
