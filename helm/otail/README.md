# OTail Helm Chart

This Helm chart deploys OTail, an OpenTelemetry-based log management system, in a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- Storage class for persistent volumes (if using persistent storage)
- Network policies support in your cluster

## Components

The chart deploys the following components:

- Frontend (otail-web)
- Backend (otail-server)
- OpenTelemetry Collector
- ClickHouse database
- MongoDB
- Grafana
- Prometheus
- Jaeger
- OpAMP Supervisor

## Installation

1. Add the Helm repository:
```bash
helm repo add otail https://your-helm-repo-url
helm repo update
```

2. Create a namespace for OTail:
```bash
kubectl create namespace otail
```

3. Create a values file (e.g., `my-values.yaml`) with your configuration:
```yaml
clickhouse:
  dsn: "clickhouse://clickhouse:9000/logs?username=default&password=your-password"
  user: "default"
  password: "your-password"

mongodb:
  uri: "mongodb://mongodb:27017"

grafana:
  adminPassword: "your-grafana-password"

opampSupervisor:
  apiToken: "your-opamp-token"
```

4. Install the chart:
```bash
helm install otail otail/otail \
  --namespace otail \
  --values my-values.yaml
```

## Configuration

The following table lists the configurable parameters of the OTail chart and their default values.

| Parameter | Description | Default |
|-----------|-------------|---------|
| `global.environment` | Global environment name | `production` |
| `frontend.image.repository` | Frontend container image repository | `otail-web` |
| `frontend.image.tag` | Frontend container image tag | `latest` |
| `frontend.service.type` | Frontend service type | `ClusterIP` |
| `frontend.resources.requests.cpu` | Frontend CPU resource request | `100m` |
| `frontend.resources.requests.memory` | Frontend memory resource request | `128Mi` |
| `frontend.resources.limits.cpu` | Frontend CPU resource limit | `500m` |
| `frontend.resources.limits.memory` | Frontend memory resource limit | `512Mi` |
| `backend.image.repository` | Backend container image repository | `otail-server` |
| `backend.image.tag` | Backend container image tag | `latest` |
| `backend.service.type` | Backend service type | `ClusterIP` |
| `backend.resources.requests.cpu` | Backend CPU resource request | `200m` |
| `backend.resources.requests.memory` | Backend memory resource request | `256Mi` |
| `backend.resources.limits.cpu` | Backend CPU resource limit | `1000m` |
| `backend.resources.limits.memory` | Backend memory resource limit | `1Gi` |
| `clickhouse.persistence.enabled` | Enable persistence for ClickHouse | `true` |
| `clickhouse.persistence.size` | Size of ClickHouse persistent volume | `10Gi` |
| `mongodb.persistence.enabled` | Enable persistence for MongoDB | `true` |
| `mongodb.persistence.size` | Size of MongoDB persistent volume | `5Gi` |
| `networkPolicies.enabled` | Enable network policies | `true` |
| `networkPolicies.defaultDenyAll` | Enable default deny-all network policy | `true` |

## Network Policies

The chart includes network policies to secure communication between components:

- Default deny-all policy for all pods
- Allow frontend to communicate with backend
- Allow backend to communicate with databases
- Allow collector to communicate with backend
- Allow OpAMP supervisor to communicate with backend
- Allow Prometheus to scrape collector metrics

## Persistence

The chart supports persistent storage for the following components:

- ClickHouse
- MongoDB
- Grafana
- Prometheus

To use persistent storage:

1. Ensure you have a storage class available in your cluster
2. Set the appropriate `persistence.enabled` parameter to `true`
3. Configure the `persistence.storageClass` parameter if needed
4. Adjust the `persistence.size` parameter according to your needs

## Upgrading

To upgrade the deployment:

```bash
helm upgrade otail otail/otail \
  --namespace otail \
  --values my-values.yaml
```

## Uninstalling

To uninstall the deployment:

```bash
helm uninstall otail -n otail
```

To delete the namespace and all resources:

```bash
kubectl delete namespace otail
```

## Troubleshooting

1. Check pod status:
```bash
kubectl get pods -n otail
```

2. Check pod logs:
```bash
kubectl logs -f <pod-name> -n otail
```

3. Check persistent volumes:
```bash
kubectl get pvc -n otail
```

4. Check network policies:
```bash
kubectl get networkpolicies -n otail
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 