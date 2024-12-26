import { Agents } from "./types";

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export async function getAgents(): Promise<Agents> {
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

export async function getConfig(agentId: string): Promise<string> {
    const response = await fetch(`${baseUrl}/api/v1/agents/${agentId}/config`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.text();
}

export async function updateConfig(agentId: string, config: string): Promise<void> {
    const response = await fetch(`${baseUrl}/api/v1/agents/${agentId}/config`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: config,
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
}