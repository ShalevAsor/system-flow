// // src/components/canvas/properties/EdgeTypeSelector.tsx
// import React, { useCallback } from "react";
// import { EdgeType } from "../../../../types/flow/edgeTypes";
// import PropertySelect from "../common/PropertySelect";
// import { useFlowStore } from "../../../../store/flowStore";
// import { getEdgeTypeName } from "../../../../utils/flow/edgeUtils";

// interface EdgeTypeSelectorProps {
//   edgeId: string;
//   sourceId: string;
//   targetId: string;
//   currentType: EdgeType;
// }

// /**
//  * A component that allows changing the type of an existing edge
//  */
// const EdgeTypeSelector: React.FC<EdgeTypeSelectorProps> = ({
//   edgeId,
//   sourceId,
//   targetId,
//   currentType,
// }) => {
//   // Get the necessary functions from the store
//   const { addEdge, edges, setEdges, selectEdge } = useFlowStore();

//   // Edge type options
//   const edgeTypeOptions = [
//     { value: EdgeType.HTTP, label: "HTTP Connection" },
//     { value: EdgeType.WebSocket, label: "WebSocket Connection" },
//     { value: EdgeType.gRPC, label: "gRPC Connection" },
//     { value: EdgeType.TCP, label: "TCP Connection" },
//     { value: EdgeType.UDP, label: "UDP Connection" },
//     { value: EdgeType.MQTT, label: "MQTT Connection" },
//     { value: EdgeType.AMQP, label: "AMQP Connection" },
//     { value: EdgeType.Kafka, label: "Kafka Connection" },
//     { value: EdgeType.EventStream, label: "Event Stream" },
//     { value: EdgeType.Database, label: "Database Connection" },
//   ];

//   // Handle changing the edge type
//   const handleTypeChange = useCallback(
//     (newType: EdgeType) => {
//       if (newType === currentType) return;

//       // Get current edge to preserve properties
//       const currentEdge = edges.find((edge) => edge.id === edgeId);
//       if (!currentEdge) return;

//       // Create the new edge
//       addEdge(
//         newType,
//         sourceId,
//         targetId,
//         currentEdge.data?.label || getEdgeTypeName(newType)
//       );

//       // Important: Get the updated list of edges AFTER adding the new edge
//       const updatedEdges = useFlowStore.getState().edges;

//       // Find the newly created edge - should be the last one added
//       const newEdge = updatedEdges[updatedEdges.length - 1];

//       // Remove the old edge AFTER capturing the new one
//       setEdges(updatedEdges.filter((edge) => edge.id !== edgeId));

//       // Select the new edge
//       if (newEdge) {
//         selectEdge(newEdge);
//       }
//     },
//     [
//       edgeId,
//       sourceId,
//       targetId,
//       currentType,
//       edges,
//       addEdge,
//       setEdges,
//       selectEdge,
//     ]
//   );

//   return (
//     <div className=" bg-blue-50 p-3 rounded border border-blue-200">
//       <PropertySelect
//         label="Edge Type"
//         value={currentType}
//         options={edgeTypeOptions}
//         onChange={handleTypeChange}
//         path="edge.type"
//         description="Change the type of this connection"
//       />
//     </div>
//   );
// };

// export default EdgeTypeSelector;
import React, { useCallback } from "react";
import { EdgeType } from "../../../../types/flow/edgeTypes";
import PropertySelect from "../common/PropertySelect";
import { useFlowStore } from "../../../../store/flowStore";

interface EdgeTypeSelectorProps {
  edgeId: string;
  currentType: EdgeType;
}

/**
 * A component that allows changing the type of an existing edge
 */
const EdgeTypeSelector: React.FC<EdgeTypeSelectorProps> = ({
  edgeId,
  currentType,
}) => {
  // Get the changeEdgeType function from the store
  const { changeEdgeType } = useFlowStore();

  // Edge type options
  const edgeTypeOptions = [
    { value: EdgeType.HTTP, label: "HTTP Connection" },
    { value: EdgeType.WebSocket, label: "WebSocket Connection" },
    { value: EdgeType.gRPC, label: "gRPC Connection" },
    { value: EdgeType.TCP, label: "TCP Connection" },
    { value: EdgeType.UDP, label: "UDP Connection" },
    { value: EdgeType.MQTT, label: "MQTT Connection" },
    { value: EdgeType.AMQP, label: "AMQP Connection" },
    { value: EdgeType.Kafka, label: "Kafka Connection" },
    { value: EdgeType.EventStream, label: "Event Stream" },
    { value: EdgeType.Database, label: "Database Connection" },
  ];

  // Handle changing the edge type
  const handleTypeChange = useCallback(
    (newType: EdgeType) => {
      if (newType === currentType) return;

      // Use the new changeEdgeType function
      changeEdgeType(edgeId, newType);
    },
    [edgeId, currentType, changeEdgeType]
  );

  return (
    <div className="bg-blue-50 p-3 rounded border border-blue-200">
      <PropertySelect
        label="Edge Type"
        value={currentType}
        options={edgeTypeOptions}
        onChange={handleTypeChange}
        path="edge.type"
        description="Change the type of this connection"
      />
    </div>
  );
};

export default EdgeTypeSelector;
