import { useEffect, useState } from "react"
import { Agent, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Agent[]> {
    const response = await fetch('http://localhost:8080/api/v1/agents');
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

const Agents = () => {
    const [data, setData] = useState<Agent[]>([])

    useEffect(() => {
        getData().then(setData)
    }, [])

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data} />
        </div>
    )
}

export default Agents
