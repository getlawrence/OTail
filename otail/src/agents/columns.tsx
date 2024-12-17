"use client"

import { ColumnDef } from "@tanstack/react-table"

export type Agent = {
    id: string
    status: "pending" | "processing" | "success" | "failed"
}

export const columns: ColumnDef<Agent>[] = [
    {
        accessorKey: "id",
        header: "Id",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
]
