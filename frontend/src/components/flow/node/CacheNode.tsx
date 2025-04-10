// // src/components/canvas/node/CacheNode.tsx
// import { memo } from "react";
// import { Handle, Position, NodeProps } from "@xyflow/react";
// import { CacheNode } from "../../../types/canvas/nodeTypes";

// function CacheNodeComponent({ data }: NodeProps<CacheNode>) {
//   // Helper to format cache size
//   const formatCacheSize = () => {
//     if (data.cacheSizeValue !== undefined && data.cacheSizeUnit) {
//       return `${data.cacheSizeValue} ${data.cacheSizeUnit}`;
//     }
//     return data.cacheSizeValue || null; // Fallback to old property if available
//   };

//   return (
//     <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
//       <Handle type="target" position={Position.Top} />
//       <div className="flex">
//         <div className="rounded-full w-12 h-12 flex justify-center items-center bg-purple-100">
//           ⚡
//         </div>
//         <div className="ml-2">
//           <div className="text-lg font-bold">{data.label}</div>
//           <div className="text-gray-500">{data.description || "Cache"}</div>

//           {/* Cache-specific properties */}
//           <div className="mt-1 text-xs">
//             {data.cacheType && (
//               <div className="text-xs text-purple-600">
//                 Type: {data.cacheType}
//               </div>
//             )}

//             {data.evictionPolicy && (
//               <div className="text-xs text-purple-600">
//                 Policy: {data.evictionPolicy}
//               </div>
//             )}

//             {data.ttl !== undefined && (
//               <div className="text-xs text-purple-600">TTL: {data.ttl}s</div>
//             )}

//             {formatCacheSize() && (
//               <div className="text-xs text-purple-600">
//                 Size: {formatCacheSize()}
//               </div>
//             )}

//             {data.expectedHitRate !== undefined && (
//               <div className="text-xs text-purple-600">
//                 Hit Rate: {Math.round(data.expectedHitRate * 100)}%
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <Handle type="source" position={Position.Bottom} />
//     </div>
//   );
// }

// export default memo(CacheNodeComponent);
// src/components/canvas/node/CacheNode.tsx

import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizeControl } from "@xyflow/react";
import { CacheNode } from "../../../types/flow/nodeTypes";
import { DatabaseZap, MemoryStick, MoveDiagonal2, Target } from "lucide-react";
import MetricBadge from "./common/MetricBadge";
import { resizeControlStyle } from "../../../utils/flow/nodeUtils";

function CacheNodeComponent({ data }: NodeProps<CacheNode>) {
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
          <DatabaseZap />
        </div>
      </div>
      <div className="wrapper gradient">
        <div className="inner">
          <div className="body">
            {data.cacheType && (
              <div className="icon">{<MemoryStick size={18} />}</div>
            )}
            <div>
              <div className="title">{data.cacheType}</div>
              {data.description && (
                <div className="subtitle">{data.description}</div>
              )}
            </div>
          </div>
          <div className="metrics-container">
            <MetricBadge
              color="blue"
              icon={<Target size={12} />}
              label="H/R: "
              value={data.expectedHitRate}
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

export default memo(CacheNodeComponent);
