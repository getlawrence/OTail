export type Agent = {
    InstanceId: string;
    status: "pending" | "processing" | "success" | "failed";
    Status: {
        health: {
            healthy: boolean;
            last_error: string;
        }
    }
    EffectiveConfig: string;
}

export type Agents = {
    [key: string]: Agent
}