// // src/components/canvas/node/ClientNode.tsx
// import { memo } from "react";
// import { Handle, Position, NodeProps } from "@xyflow/react";
// import { ClientNode } from "../../../types/canvas/nodeTypes";

// function ClientNodeComponent({ data }: NodeProps<ClientNode>) {
//   return (
//     <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
//       <Handle type="target" position={Position.Top} />
//       <div className="flex">
//         <div className="rounded-full w-12 h-12 flex justify-center items-center bg-yellow-100">
//           👤
//         </div>
//         <div className="ml-2">
//           <div className="text-lg font-bold">{data.label}</div>
//           <div className="text-gray-500">{data.description || "Client"}</div>

//           {/* Client-specific properties */}
//           <div className="mt-1 text-xs">
//             {data.clientType && (
//               <div className="text-yellow-600">Type: {data.clientType}</div>
//             )}

//             {data.concurrentUsers !== undefined && (
//               <div className="text-yellow-600">
//                 Users: {data.concurrentUsers.toLocaleString()}
//               </div>
//             )}

//             {data.geographicDistribution &&
//               data.geographicDistribution.length > 0 && (
//                 <div className="text-yellow-600">
//                   Regions: {data.geographicDistribution.join(", ")}
//                 </div>
//               )}

//             {data.expectedResponseTime !== undefined && (
//               <div className="text-yellow-600">
//                 Expected Response: {data.expectedResponseTime}ms
//               </div>
//             )}

//             {data.requestPattern && (
//               <div className="text-yellow-600">
//                 Traffic: {data.requestPattern}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <Handle type="source" position={Position.Bottom} />
//     </div>
//   );
// }

// export default memo(ClientNodeComponent);
// src/components/canvas/node/ClientNode.tsx
import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizeControl } from "@xyflow/react";
import { ClientNode } from "../../../types/flow/nodeTypes";
import {
  Cable,
  Globe,
  Keyboard,
  Laptop,
  MoveDiagonal2,
  Signal,
  Smartphone,
  User,
  Users,
  Wifi,
} from "lucide-react";
import {
  ClientDeviceType,
  ConnectionType,
} from "../../../types/flow/nodeTypes";
import MetricBadge from "./common/MetricBadge";
import { resizeControlStyle } from "../../../utils/flow/nodeUtils";

const getClientTypeIcon = (clientType: ClientDeviceType): React.ReactNode => {
  switch (clientType) {
    case "Browser":
      return <Globe size={18} />;
    case "Mobile App":
      return <Smartphone size={18} />;
    case "Desktop App":
      return <Laptop size={18} />;
    case "IoT Device":
      return <Keyboard size={18} />;
    default:
      return <User size={18} />;
  }
};

const getConnectionTypeIcon = (
  connectionType: ConnectionType
): React.ReactNode => {
  switch (connectionType) {
    case "Wired":
      return <Cable size={12} />;
    case "WiFi":
      return <Wifi size={12} />;
    case "Cellular":
      return <Signal size={12} />;
    default:
      return <Wifi size={12} />;
  }
};

function ClientNodeComponent({ data }: NodeProps<ClientNode>) {
  return (
    <>
      {/* Place handles OUTSIDE all other elements to avoid z-index issues */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          opacity: 0.8, // Make more visible
          zIndex: 10, // Ensure it's above other elements
          width: 12,
          height: 12,
          background: "#2a8af6",
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          opacity: 0.8, // Make more visible
          zIndex: 10, // Ensure it's above other elements
          width: 12,
          height: 12,
          background: "#e92a67",
        }}
      />

      <div className="cloud gradient">
        <div>
          <User />
        </div>
      </div>
      <div className="wrapper gradient">
        <div className="inner">
          <div className="body">
            {data.clientType && (
              <div className="icon">{getClientTypeIcon(data.clientType)}</div>
            )}
            <div>
              <div className="title">{data.clientType}</div>
              {data.description && (
                <div className="subtitle">{data.description}</div>
              )}
            </div>
          </div>

          <div className="metrics-container">
            <MetricBadge
              color="blue"
              icon={<Users size={12} />}
              value={data.concurrentUsers}
            />
            <MetricBadge
              color="purple"
              icon={getConnectionTypeIcon(data.connectionType)}
              value={data.connectionType}
            />
          </div>
        </div>
      </div>
      {/* Node Resize Control */}
      <NodeResizeControl
        style={resizeControlStyle}
        minWidth={100}
        minHeight={50}
        position="bottom-right"
        className="z-30"
      >
        <MoveDiagonal2 className="absolute bottom-1 right-1 text-[#f72585]" />
      </NodeResizeControl>
    </>
  );
}

export default memo(ClientNodeComponent);
