import { useCallback, useRef, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  type NodeTypes,
  type EdgeTypes,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
/* Custom nodes */
import ServerNodeComponent from "../../components/flow/node/ServerNode";
import DatabaseNodeComponent from "../../components/flow/node/DatabaseNode";
import ClientNodeComponent from "../../components/flow/node/ClientNode";
import LoadBalancerNodeComponent from "../../components/flow/node/LoadBalancer";
import CacheNodeComponent from "../../components/flow/node/CacheNode";
/* Custom edges */
import HTTPEdge from "../../components/flow/edge/HTTPEdge";
import WebSocketEdge from "../../components/flow/edge/WebSocketEdge";
import DatabaseEdge from "../../components/flow/edge/DatabaseEdge";
import GRPCEdge from "../../components/flow/edge/GRPCEdge";
import TCPEdge from "../../components/flow/edge/TCPEdge";
import UDPEdge from "../../components/flow/edge/UDPEdge";
import KafkaEdge from "../../components/flow/edge/KafkaEdge";
import MQTTEdge from "../../components/flow/edge/MQTTEdge";
import AMQPEdge from "../../components/flow/edge/AMQPEdge";
import EventStreamEdge from "../../components/flow/edge/EventStreamEdge";
/* Types */
import { NodeType, SystemDesignNode } from "../../types/flow/nodeTypes";
import { EdgeType, SystemDesignEdge } from "../../types/flow/edgeTypes";
import { TemplatePaletteItem } from "../../types/flow/architectureTypes";
import { ComponentPaletteItem } from "../../types/flow/paletteItemTypes";
/* State management */
import { useShallow } from "zustand/react/shallow";
import { useFlowStore } from "../../store/flowStore";
/* Ui  */
import PropertiesPanel from "../../components/flow/panels/NodePropertiesPanel";
import EdgePropertiesPanel from "../../components/flow/panels/EdgePropertiesPanel";
import CollapsiblePanel from "../../components/flow/panels/CollapsiblePanel";
import SimulationPanel from "../../components/flow/simulation/SimulationPanel";
import { ComponentsPanel } from "../../components/flow/panels/ComponentsPanel";
import "./flow.css";
import { FlowControl } from "../../components/flow/FlowControl";
import { FlowLegend } from "../../components/flow/FlowLegend";
/* Wrap the FlowContent in ReactFlowProvider */
const FlowContent = () => {
  // Refs
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Define node types with useMemo to prevent re-renders
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      [NodeType.Server]: ServerNodeComponent,
      [NodeType.Database]: DatabaseNodeComponent,
      [NodeType.Client]: ClientNodeComponent,
      [NodeType.LoadBalancer]: LoadBalancerNodeComponent,
      [NodeType.Cache]: CacheNodeComponent,
    }),
    []
  );
  const edgeTypes = useMemo<EdgeTypes>(
    () => ({
      [EdgeType.HTTP]: HTTPEdge,
      [EdgeType.WebSocket]: WebSocketEdge,
      [EdgeType.gRPC]: GRPCEdge,
      [EdgeType.Database]: DatabaseEdge,
      [EdgeType.TCP]: TCPEdge,
      [EdgeType.UDP]: UDPEdge,
      [EdgeType.Kafka]: KafkaEdge,
      [EdgeType.MQTT]: MQTTEdge,
      [EdgeType.AMQP]: AMQPEdge,
      [EdgeType.EventStream]: EventStreamEdge,
    }),
    []
  );

  // Get the ReactFlow instance
  const reactFlowInstance = useReactFlow();

  // Use useShallow with selector to optimize renders for action functions
  const {
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
    selectEdge,
    loadTemplate,
  } = useFlowStore(
    useShallow((state) => ({
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      onConnect: state.onConnect,
      addNode: state.addNode,
      selectNode: state.selectNode,
      selectEdge: state.selectEdge,
      loadTemplate: state.loadTemplate,
    }))
  );

  // Get these separately as they might change frequently
  // This pattern prevents re-renders when other parts of the state change
  const nodes = useFlowStore((state) => state.nodes);
  const edges = useFlowStore((state) => state.edges);
  const selectedNode = useFlowStore((state) => state.selectedNode);
  const selectedEdge = useFlowStore((state) => state.selectedEdge);
  const updateNodeData = useFlowStore((state) => state.updateNodeData);
  const updateEdgeData = useFlowStore((state) => state.updateEdgeData);

  // Drag over handler
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onTemplateDragStart = (
    event: React.DragEvent,
    templateInfo: TemplatePaletteItem
  ) => {
    event.dataTransfer.setData(
      "application/template",
      JSON.stringify(templateInfo)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  /* Handle drop events */
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      // Get the drop position
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      // Check if it's a component or a template
      const componentData = event.dataTransfer.getData("application/reactflow");
      const templateData = event.dataTransfer.getData("application/template");

      if (componentData) {
        try {
          const componentInfo = JSON.parse(
            componentData
          ) as ComponentPaletteItem;
          const { type, label } = componentInfo;

          // Check if the dropped element is valid
          if (!type) {
            return;
          }

          // Add new node
          addNode(type, label, position);
        } catch (error) {
          console.error("Error creating node:", error);
        }
      } else if (templateData) {
        try {
          const templateInfo = JSON.parse(templateData) as TemplatePaletteItem;
          const { id } = templateInfo;

          // Load the template at the drop position
          loadTemplate(id, position);
        } catch (error) {
          console.error("Error creating template:", error);
        }
      }
    },
    [reactFlowInstance, addNode, loadTemplate]
  );

  // Node selection handler
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: SystemDesignNode) => {
      selectNode(node);
    },
    [selectNode]
  );
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: SystemDesignEdge) => {
      selectEdge(edge);
    },
    [selectEdge]
  );

  // Background click handler to deselect
  const onPaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // Drag start handler for palette items
  const onDragStart = (
    event: React.DragEvent,
    componentInfo: ComponentPaletteItem
  ) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(componentInfo)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="flex w-full h-[calc(100vh-120px)]">
      {/* Left Sidebar - Component palette */}
      <CollapsiblePanel
        title="Flow Panel"
        direction="left"
        width="w-64"
        collapsedTooltip="Show component palette"
        expandedTooltip="Hide component palette"
      >
        <div className="flex flex-col space-y-2">
          <FlowControl />
          <ComponentsPanel
            onDragStart={onDragStart}
            onTemplateDragStart={onTemplateDragStart}
          />
        </div>
      </CollapsiblePanel>
      {/* Flow - Central area */}
      <div className="flex-grow h-full" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          onPaneClick={onPaneClick}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
          <Panel position="top-left">
            <FlowLegend />
          </Panel>
        </ReactFlow>
      </div>
      {/* Right Sidebar - When node is selected, show the node properties panel */}
      {selectedNode && (
        <div className="w-64 h-full bg-white shadow-md overflow-y-auto">
          <PropertiesPanel
            selectedNode={selectedNode}
            onPropertyChange={updateNodeData}
          />
        </div>
      )}
      {/* When edge is selected, show the edge properties panel */}
      {selectedEdge && (
        <div className="w-64 h-full bg-white shadow-md overflow-y-auto">
          <EdgePropertiesPanel
            selectedEdge={selectedEdge}
            onPropertyChange={updateEdgeData}
          />
        </div>
      )}
      {/* Right Sidebar - Simulation panel */}
      <CollapsiblePanel
        title="Simulation Panel"
        direction="right"
        width="w-80"
        collapsedTooltip="Show panel"
        expandedTooltip="Hide panel"
      >
        <SimulationPanel />
      </CollapsiblePanel>
    </div>
  );
};

/* FlowPage Component */
const FlowEditorPage: React.FC = () => {
  return (
    <ReactFlowProvider>
      <FlowContent />
    </ReactFlowProvider>
  );
};

export default FlowEditorPage;
