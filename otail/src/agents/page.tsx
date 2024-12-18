import React, { useEffect, useState } from "react"
import { Agents, Agent, columns } from "./columns"
import { DataTable } from "./data-table"

async function getData(): Promise<Agents> {
    const baseUrl = 'http://localhost:8080'
    const response = await fetch(`${baseUrl}/api/v1/agents`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

const AgentsPage = () => {
    const [data, setData] = useState<Agent[]>([])

    useEffect(() => {
        getData().then(data => {
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
