import { ArchitectureTemplate } from "../../types/flow/architectureTypes";

/**
 * Calculate positions for nodes in a grid layout
 *
 * @param template The template containing nodes and edges
 * @param centerX The X coordinate where the template is being placed
 * @param centerY The Y coordinate where the template is being placed
 * @returns An array of positions for each node in the template
 */
export function calculateGridLayout(
  template: ArchitectureTemplate,
  centerX: number,
  centerY: number
): Array<{ x: number; y: number }> {
  const nodeCount = template.nodes.length;
  const columns = Math.floor(Math.sqrt(nodeCount));
  const rows = Math.ceil(nodeCount / columns);
  const colSpace = 300;
  const rowSpace = 200;

  // Calculate positions for each node
  return template.nodes.map((_, index) => {
    // Calculate grid position
    const row = Math.floor(index / columns);
    const col = index % columns;

    // Center the grid around the drop position
    const x = centerX + (col - Math.floor(columns / 2)) * colSpace;
    const y = centerY + (row - Math.floor(rows / 2)) * rowSpace;

    return { x, y };
  });
}

/**
 * Calculate positions for nodes in a tree layout
 *
 * @param template The template containing nodes and edges
 * @param centerX The X coordinate where the template is being placed
 * @param centerY The Y coordinate where the template is being placed
 * @returns An array of positions for each node in the template
 */
export function calculateTreeLayout(
  template: ArchitectureTemplate,
  centerX: number,
  centerY: number
): Array<{ x: number; y: number }> {
  const nodeCount = template.nodes.length;

  // Build relationship maps for tree layout
  const childrenMap: Record<number, number[]> = {}; // Maps nodeIndex -> array of child indices
  const parentMap: Record<number, number> = {}; // Maps nodeIndex -> parent index
  const rootIndices: number[] = []; // Store indices of root nodes

  // Build the relationship maps from edges
  template.edges.forEach((edge) => {
    const sourceIdx = edge.source;
    const targetIdx = edge.target;

    // Add child relationship
    if (!childrenMap[sourceIdx]) childrenMap[sourceIdx] = [];
    childrenMap[sourceIdx].push(targetIdx);

    // Add parent relationship
    parentMap[targetIdx] = sourceIdx;
  });

  // Find root nodes (nodes without parents)
  for (let i = 0; i < nodeCount; i++) {
    if (parentMap[i] === undefined) {
      rootIndices.push(i);
    }
  }

  // If no roots found, use the first node
  if (rootIndices.length === 0) rootIndices.push(0);

  // Get tree depth and node counts by level
  const nodeLevels: Record<number, number> = {}; // Maps nodeIndex -> level
  const levelCounts: Record<number, number> = {}; // Maps level -> count of nodes at that level

  // Assign levels to all nodes
  assignLevels(rootIndices, 0, nodeLevels, levelCounts, childrenMap);

  // Settings for tree layout
  const levelHeight = 200; // Vertical space between levels
  const nodeWidth = 350; // Horizontal space between nodes

  // Calculate horizontal positions within each level
  const horizontalPositions: Record<number, number> = {};
  const levelPositions: Record<number, number[]> = {};

  // Initialize level positions
  Object.keys(levelCounts).forEach((levelStr) => {
    const level = parseInt(levelStr);
    levelPositions[level] = [];
  });

  // Collect node indices for each level
  for (let i = 0; i < nodeCount; i++) {
    const level = nodeLevels[i] || 0;
    if (!levelPositions[level]) levelPositions[level] = [];
    levelPositions[level].push(i);
  }

  // Calculate horizontal position for each node
  Object.keys(levelPositions).forEach((levelStr) => {
    const level = parseInt(levelStr);
    const nodesAtLevel = levelPositions[level];

    nodesAtLevel.forEach((nodeIdx, positionInLevel) => {
      horizontalPositions[nodeIdx] = positionInLevel;
    });
  });

  // Calculate final positions for each node
  return template.nodes.map((_, index) => {
    const level = nodeLevels[index] || 0;
    const nodesAtLevel = levelCounts[level] || 1;
    const positionInLevel = horizontalPositions[index] || 0;

    // Calculate position - top-down tree layout
    const x = centerX + (positionInLevel - (nodesAtLevel - 1) / 2) * nodeWidth;
    const y = centerY + level * levelHeight;

    return { x, y };
  });
}

/**
 * Helper function to assign levels to nodes in a tree
 */
function assignLevels(
  nodeIndices: number[],
  level: number,
  nodeLevels: Record<number, number>,
  levelCounts: Record<number, number>,
  childrenMap: Record<number, number[]>
): void {
  if (!levelCounts[level]) levelCounts[level] = 0;

  nodeIndices.forEach((nodeIdx) => {
    nodeLevels[nodeIdx] = level;
    levelCounts[level]++;

    // Process children
    const children = childrenMap[nodeIdx] || [];
    if (children.length > 0) {
      assignLevels(children, level + 1, nodeLevels, levelCounts, childrenMap);
    }
  });
}
