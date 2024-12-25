import { useEffect, useState } from "react"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { getAgents } from "@/api/agent";
import { Agent } from "@/api/types";



const AgentsPage = () => {
    const [data, setData] = useState<Agent[]>([])

    useEffect(() => {
        getAgents().then(data => {
            setData(Object.values(data))
        })
    }, [])

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    )
}

export default AgentsPage
