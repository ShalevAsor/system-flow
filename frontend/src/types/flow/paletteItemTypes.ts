import { NodeType } from "./nodeTypes";
// ==============================
// Component Palette Definitions
// ==============================

/**
 * Interface for items in the component palette
 */
export type ComponentPaletteItem = {
  type: NodeType;
  label: string;
  icon: string;
  description?: string;
};
