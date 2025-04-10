import { SystemDesignEdge } from "../types/flow/edgeTypes";
import { SystemDesignNode } from "../types/flow/nodeTypes";

// In graphUtils.ts
export type Graph = Map<string, Set<string>>;

export function buildSystemGraph(
  nodes: SystemDesignNode[],
  edges: SystemDesignEdge[]
): Graph {
  const graph: Graph = new Map();

  // Initialize all nodes with empty adjacency sets
  nodes.forEach((node) => {
    graph.set(node.id, new Set());
  });

  // Fill in the adjacency sets based on edges
  edges.forEach((edge) => {
    const neighbors = graph.get(edge.source);
    if (neighbors) {
      neighbors.add(edge.target);
    }
  });

  return graph;
}

export function findReachableNodes(
  graph: Graph,
  startNodeId: string
): Set<string> {
  const visited = new Set<string>();
  const queue: string[] = [startNodeId];

  while (queue.length > 0) {
    const nodeId = queue.shift()!;

    if (!visited.has(nodeId)) {
      visited.add(nodeId);

      const neighbors = graph.get(nodeId) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push(neighbor);
        }
      }
    }
  }

  // Remove the starting node from the result
  visited.delete(startNodeId);
  return visited;
}

/**
 * function to check if a node has outgoing connections
 */
export function hasOutgoingConnections(graph: Graph, nodeId: string): boolean {
  const neighbors = graph.get(nodeId) || new Set();
  return neighbors.size > 0;
}

/**
 * Find the shortest path between two nodes in a graph using breadth-first search
 *
 * @param graph - The graph representation
 * @param startNodeId - The starting node ID
 * @param endNodeId - The target node ID
 * @returns Array of node IDs representing the path, or null if no path exists
 */
export function findShortestPath(
  graph: Graph,
  startNodeId: string,
  endNodeId: string
): string[] | null {
  // Queue for BFS
  const queue: string[] = [startNodeId];

  // Keep track of visited nodes and their predecessor
  const visited = new Set<string>();
  const predecessor = new Map<string, string>();

  // Mark start as visited
  visited.add(startNodeId);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // If we've reached the target, reconstruct path
    if (current === endNodeId) {
      return reconstructPath(predecessor, startNodeId, endNodeId);
    }

    // Process all neighbors
    const neighbors = graph.get(current) || new Set();
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        predecessor.set(neighbor, current);
        queue.push(neighbor);
      }
    }
  }

  // No path found
  return null;
}

/**
 * Reconstruct the path from start to end using the predecessor map
 *
 * @param predecessor - Map of node to its predecessor
 * @param startNodeId - Starting node ID
 * @param endNodeId - Ending node ID
 * @returns Array of node IDs representing the path
 */
function reconstructPath(
  predecessor: Map<string, string>,
  startNodeId: string,
  endNodeId: string
): string[] {
  const path: string[] = [endNodeId];
  let current = endNodeId;

  while (current !== startNodeId) {
    current = predecessor.get(current)!;
    path.unshift(current);
  }

  return path;
}

/**
 * Find all possible paths from start to end node without cycles
 *
 * @param graph - The system graph
 * @param startNodeId - Starting node ID
 * @param endNodeId - Destination node ID
 * @returns Array of paths (each path is an array of node IDs)
 */
export function findAllPaths(
  graph: Graph,
  startNodeId: string,
  endNodeId: string
): string[][] {
  const paths: string[][] = [];
  const currentPath: string[] = [startNodeId];
  const visited = new Set<string>([startNodeId]);

  // Use DFS to find all paths
  findPathsDFS(graph, startNodeId, endNodeId, currentPath, visited, paths);

  return paths;
}

/**
 * Helper function for DFS path finding
 */
function findPathsDFS(
  graph: Graph,
  currentNodeId: string,
  endNodeId: string,
  currentPath: string[],
  visited: Set<string>,
  allPaths: string[][]
): void {
  // Found a path to the destination
  if (currentNodeId === endNodeId) {
    allPaths.push([...currentPath]);
    return;
  }

  // Explore all neighbors
  const neighbors = graph.get(currentNodeId) || new Set();
  for (const neighborId of neighbors) {
    // Skip if already visited (avoid cycles)
    if (visited.has(neighborId)) {
      continue;
    }

    // Add to current path and visited
    currentPath.push(neighborId);
    visited.add(neighborId);

    // Recursively find paths from this neighbor
    findPathsDFS(graph, neighborId, endNodeId, currentPath, visited, allPaths);

    // Backtrack
    currentPath.pop();
    visited.delete(neighborId);
  }
}
