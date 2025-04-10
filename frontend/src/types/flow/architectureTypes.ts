// src/types/flow/templateTypes.ts
import { NodeType, SystemDesignNode } from "./nodeTypes";
import { SystemDesignEdge } from "./edgeTypes";

/**
 * Defines a system architecture template
 * that can be dragged onto the canvas
 */
export interface ArchitectureTemplate {
  // Unique identifier for the template
  id: string;
  // Nodes are defined with relative positions
  nodes: (Omit<SystemDesignNode, "id" | "position"> & { type: NodeType })[];
  // Edges are defined using node indices rather than IDs
  // since IDs will be generated when placed on canvas
  edges: Array<{
    source: number; // Index of the source node in the nodes array
    target: number; // Index of the target node in the nodes array
    type: SystemDesignEdge["type"];
  }>;
}

/**
 * Template palette item for display in the UI
 */
export interface TemplatePaletteItem {
  id: string;
  name: string;
  description: string;
  icon: string;
}
