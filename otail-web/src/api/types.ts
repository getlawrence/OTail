export type Agent = {
    InstanceId: string;
    status: "pending" | "processing" | "success" | "failed";
    EffectiveConfig: string;
}

export type Agents = {
    [key: string]: Agent
}