import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { usePipelineManager } from '../usePipelineManager';
import { Node, Edge } from 'reactflow';

describe('usePipelineManager', () => {
  const mockSetNodes = jest.fn();
  const mockSetEdges = jest.fn();
  const mockNodes: Node[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderPipelineManager = () => {
    return renderHook(() => usePipelineManager({
      setNodes: mockSetNodes,
      setEdges: mockSetEdges,
      nodes: mockNodes
    }));
  };

  describe('parseInitialYaml', () => {
    it('should create correct nodes and edges for a simple pipeline', () => {
      const { result } = renderPipelineManager();
      
      const simpleYaml = `
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: localhost:4317

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 1000

exporters:
  logging:
    verbosity: detailed

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter]
      exporters: [logging]
`;

      result.current.parseInitialYaml(simpleYaml);

      // Verify nodes were created correctly
      expect(mockSetNodes).toHaveBeenCalled();
      const setNodesCallback = mockSetNodes.mock.calls[0][0];
      const sectionNodes = [{ type: 'section', id: 'section-traces' }];
      const newNodes = setNodesCallback(sectionNodes);

      // Should have 3 nodes (receiver, processor, exporter) plus section
      expect(newNodes).toHaveLength(4);

      // Verify node types and labels
      const componentNodes = newNodes.filter((node: Node) => node.type !== 'section');
      expect(componentNodes).toHaveLength(3);
      expect(componentNodes.map((n: Node) => n.type)).toEqual(['receiver', 'processor', 'exporter']);
      expect(componentNodes.map((n: Node) => n.data.label)).toEqual(['otlp', 'memory_limiter', 'logging']);

      // Verify edges were created correctly
      expect(mockSetEdges).toHaveBeenCalled();
      const edges = mockSetEdges.mock.calls[0][0];
      expect(edges).toHaveLength(2); // Should have receiver->processor and processor->exporter

      // Verify edge connections
      const receiverNode = componentNodes.find((n: Node) => n.type === 'receiver');
      const processorNode = componentNodes.find((n: Node) => n.type === 'processor');
      const exporterNode = componentNodes.find((n: Node) => n.type === 'exporter');

      expect(edges).toEqual(expect.arrayContaining([
        expect.objectContaining({
          source: receiverNode?.id,
          target: processorNode?.id
        }),
        expect.objectContaining({
          source: processorNode?.id,
          target: exporterNode?.id
        })
      ]));
    });

    it('should handle multiple pipelines correctly', () => {
      const { result } = renderPipelineManager();
      
      const multiPipelineYaml = `
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: localhost:4317
  jaeger:
    protocols:
      grpc:
        endpoint: localhost:14250

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 1000
  batch:
    timeout: 1s
    send_batch_size: 1000

exporters:
  logging:
    verbosity: detailed
  otlp/2:
    endpoint: localhost:4317

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter]
      exporters: [logging]
    metrics:
      receivers: [jaeger]
      processors: [batch]
      exporters: [otlp/2]
`;

      result.current.parseInitialYaml(multiPipelineYaml);

      // Verify nodes were created correctly
      expect(mockSetNodes).toHaveBeenCalled();
      const setNodesCallback = mockSetNodes.mock.calls[0][0];
      const sectionNodes = [
        { type: 'section', id: 'section-traces' },
        { type: 'section', id: 'section-metrics' }
      ];
      const newNodes = setNodesCallback(sectionNodes);

      // Should have 6 nodes (2 receivers, 2 processors, 2 exporters) plus 2 sections
      expect(newNodes).toHaveLength(8);

      // Verify node types and labels
      const componentNodes = newNodes.filter((node: Node) => node.type !== 'section');
      expect(componentNodes).toHaveLength(6);
      
      const traceNodes = componentNodes.filter((n: Node) => n.data.pipelineType === 'traces');
      const metricNodes = componentNodes.filter((n: Node) => n.data.pipelineType === 'metrics');

      expect(traceNodes.map((n: Node) => n.data.label)).toEqual(['otlp', 'memory_limiter', 'logging']);
      expect(metricNodes.map((n: Node) => n.data.label)).toEqual(['jaeger', 'batch', 'otlp/2']);

      // Verify edges were created correctly
      expect(mockSetEdges).toHaveBeenCalled();
      const edges = mockSetEdges.mock.calls[0][0];
      expect(edges).toHaveLength(4); // Should have 2 edges per pipeline

      // Helper to find node by type and label
      const findNode = (type: string, label: string, pipelineType: string) => 
        componentNodes.find((n: Node) => n.type === type && n.data.label === label && n.data.pipelineType === pipelineType);

      // Verify trace pipeline edges
      const traceReceiver = findNode('receiver', 'otlp', 'traces');
      const traceProcessor = findNode('processor', 'memory_limiter', 'traces');
      const traceExporter = findNode('exporter', 'logging', 'traces');

      expect(edges).toEqual(expect.arrayContaining([
        expect.objectContaining({
          source: traceReceiver?.id,
          target: traceProcessor?.id
        }),
        expect.objectContaining({
          source: traceProcessor?.id,
          target: traceExporter?.id
        })
      ]));

      // Verify metric pipeline edges
      const metricReceiver = findNode('receiver', 'jaeger', 'metrics');
      const metricProcessor = findNode('processor', 'batch', 'metrics');
      const metricExporter = findNode('exporter', 'otlp/2', 'metrics');

      expect(edges).toEqual(expect.arrayContaining([
        expect.objectContaining({
          source: metricReceiver?.id,
          target: metricProcessor?.id
        }),
        expect.objectContaining({
          source: metricProcessor?.id,
          target: metricExporter?.id
        })
      ]));
    });

    it('should handle connectors between pipelines correctly', () => {
      const { result } = renderPipelineManager();
      
      const connectorYaml = `
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: localhost:4317

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 1000

exporters:
  logging:
    verbosity: detailed

connectors:
  trace_metrics:
    type: spanmetrics

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter]
      exporters: [trace_metrics]
    metrics:
      receivers: [trace_metrics]
      exporters: [logging]
`;

      result.current.parseInitialYaml(connectorYaml);

      // Verify nodes were created correctly
      expect(mockSetNodes).toHaveBeenCalled();
      const setNodesCallback = mockSetNodes.mock.calls[0][0];
      const sectionNodes = [
        { type: 'section', id: 'section-traces' },
        { type: 'section', id: 'section-metrics' }
      ];
      const newNodes = setNodesCallback(sectionNodes);

      // Should have 4 nodes (receiver, processor, connector, exporter) plus 2 sections
      expect(newNodes).toHaveLength(6);

      // Verify connector node was created
      const connectorNode = newNodes.find((n: Node) => n.type === 'connector');
      expect(connectorNode).toBeDefined();
      expect(connectorNode?.data.label).toBe('trace_metrics');
      expect(connectorNode?.data.sourcePipelineType).toBe('traces');
      expect(connectorNode?.data.targetPipelineType).toBe('metrics');

      // Verify edges were created correctly
      expect(mockSetEdges).toHaveBeenCalled();
      const edges = mockSetEdges.mock.calls[0][0];

      // Helper to find node by type and label
      const findNode = (type: string, label: string, pipelineType: string) => 
        newNodes.find((n: Node) => n.type === type && n.data.label === label && n.data.pipelineType === pipelineType);

      const traceReceiver = findNode('receiver', 'otlp', 'traces');
      const traceProcessor = findNode('processor', 'memory_limiter', 'traces');
      const metricExporter = findNode('exporter', 'logging', 'metrics');

      // Should have edges connecting through the connector
      expect(edges).toEqual(expect.arrayContaining([
        expect.objectContaining({
          source: traceReceiver?.id,
          target: traceProcessor?.id
        }),
        expect.objectContaining({
          source: traceProcessor?.id,
          target: connectorNode?.id
        }),
        expect.objectContaining({
          source: connectorNode?.id,
          target: metricExporter?.id
        })
      ]));
    });

    it('should handle a complex pipeline with multiple components correctly', () => {
      const { result } = renderPipelineManager();
      
      const complexPipelineYaml = `
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: localhost:4317
  jaeger:
    protocols:
      grpc:
        endpoint: localhost:14250

processors:
  memory_limiter:
    check_interval: 1s
    limit_mib: 1000
  batch:
    timeout: 1s
    send_batch_size: 1000

exporters:
  logging:
    verbosity: detailed
  otlp/2:
    endpoint: localhost:4317

service:
  pipelines:
    traces:
      receivers: [otlp, jaeger]
      processors: [memory_limiter, batch]
      exporters: [logging, otlp/2]
`;

      result.current.parseInitialYaml(complexPipelineYaml);

      // Verify nodes were created correctly
      expect(mockSetNodes).toHaveBeenCalled();
      const setNodesCallback = mockSetNodes.mock.calls[0][0];
      const sectionNodes = [{ type: 'section', id: 'section-traces' }];
      const newNodes = setNodesCallback(sectionNodes);

      // Should have 6 nodes (2 receivers, 2 processors, 2 exporters) plus section
      expect(newNodes).toHaveLength(7);

      // Verify node types and labels
      const componentNodes = newNodes.filter((node: Node) => node.type !== 'section');
      expect(componentNodes).toHaveLength(6);

      // Group nodes by type
      const receivers = componentNodes.filter((n: Node) => n.type === 'receiver');
      const processors = componentNodes.filter((n: Node) => n.type === 'processor');
      const exporters = componentNodes.filter((n: Node) => n.type === 'exporter');

      // Verify we have the right number of each type
      expect(receivers).toHaveLength(2);
      expect(processors).toHaveLength(2);
      expect(exporters).toHaveLength(2);

      // Verify node labels
      expect(receivers.map((n: Node) => n.data.label).sort()).toEqual(['jaeger', 'otlp']);
      expect(processors.map((n: Node) => n.data.label).sort()).toEqual(['batch', 'memory_limiter']);
      expect(exporters.map((n: Node) => n.data.label).sort()).toEqual(['logging', 'otlp/2']);

      // Verify edges were created correctly
      expect(mockSetEdges).toHaveBeenCalled();
      const edges = mockSetEdges.mock.calls[0][0];

      // Should have edges from:
      // - each receiver to first processor (2 edges)
      // - first processor to second processor (1 edge)
      // - second processor to each exporter (2 edges)
      // Total: 5 edges
      expect(edges).toHaveLength(5);

      // Helper to verify edge exists
      const hasEdge = (sourceId: string, targetId: string) => 
        edges.some((e: Edge) => e.source === sourceId && e.target === targetId);

      // Get first processor (memory_limiter)
      const firstProcessor = processors.find((n: Node) => n.data.label === 'memory_limiter');
      const secondProcessor = processors.find((n: Node) => n.data.label === 'batch');

      // Verify each receiver connects only to the first processor
      receivers.forEach((receiver: Node) => {
        // Should connect to first processor
        expect(hasEdge(receiver.id, firstProcessor!.id)).toBe(true);
        // Should NOT connect to second processor
        expect(hasEdge(receiver.id, secondProcessor!.id)).toBe(false);
      });

      // Verify first processor connects to second processor
      expect(hasEdge(firstProcessor!.id, secondProcessor!.id)).toBe(true);

      // Verify second processor connects to all exporters
      exporters.forEach((exporter: Node) => {
        expect(hasEdge(secondProcessor!.id, exporter.id)).toBe(true);
      });

      // Verify node positions
      const receiverXPositions = receivers.map((n: Node) => n.position.x);
      const processorXPositions = processors.map((n: Node) => n.position.x);
      const exporterXPositions = exporters.map((n: Node) => n.position.x);

      // All receivers should be in the same column
      expect(new Set(receiverXPositions).size).toBe(1);
      // All processors should be in the same column
      expect(new Set(processorXPositions).size).toBe(1);
      // All exporters should be in the same column
      expect(new Set(exporterXPositions).size).toBe(1);

      // Verify column ordering (receivers -> processors -> exporters)
      const receiverX = receiverXPositions[0];
      const processorX = processorXPositions[0];
      const exporterX = exporterXPositions[0];

      expect(receiverX).toBeLessThan(processorX);
      expect(processorX).toBeLessThan(exporterX);
    });
  });
}); 