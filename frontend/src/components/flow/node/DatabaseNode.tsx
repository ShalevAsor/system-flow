import { memo } from "react";
import { Handle, Position, NodeProps, NodeResizeControl } from "@xyflow/react";
import {
  Braces,
  Database,
  HardDrive,
  MoveDiagonal2,
  Warehouse,
} from "lucide-react";
import MetricBadge from "./common/MetricBadge";
import { DatabaseNode } from "../../../types/flow/nodeTypes";
import { resizeControlStyle } from "../../../utils/flow/nodeUtils";

function DatabaseNodeComponent({ data }: NodeProps<DatabaseNode>) {
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
          <Database />
        </div>
      </div>
      <div className="wrapper gradient">
        <div className="inner">
          <div className="body">
            {data.dbType && (
              <div className="icon">{<HardDrive size={18} />}</div>
            )}
            <div>
              <div className="title">{data.dbType}</div>
              {data.description && (
                <div className="subtitle">{data.description}</div>
              )}
            </div>
          </div>
          <div className="metrics-container">
            {data.dbSubType && (
              <MetricBadge
                color="blue"
                icon={<Braces size={12} />}
                value={data.dbSubType}
              />
            )}
            <MetricBadge
              color="purple"
              icon={<Warehouse size={12} />}
              label="Capacity: "
              value={data.storageCapacity}
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

export default memo(DatabaseNodeComponent);
