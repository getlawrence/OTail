import { Policy } from "@/types/policy";
import yaml from 'js-yaml';

const toEmptyCollectorConfig = (policies: Policy[]) => {
    return yaml.dump({
        processors: {
            "tail_sampling": {
                decision_wait: "30s",
                num_traces: 5000,
                policies: policies
            },
        },
        exporters: {},
        receivers: {},
        service: {
            pipelines: {
                traces: {
                    receivers: [],
                    processors: ["tail_sampling"],
                    exporters: []
                }
            }
        }
    })
}

export { toEmptyCollectorConfig }