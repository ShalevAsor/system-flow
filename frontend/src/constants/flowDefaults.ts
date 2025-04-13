import { TemplatePaletteItem } from "../types/flow/architectureTypes";
import { ComponentPaletteItem } from "../types/flow/paletteItemTypes";
import { NodeType } from "../types/flow/nodeTypes";

/**
 * Default values for Component Palette
 */
export const componentTypes: ComponentPaletteItem[] = [
  {
    type: NodeType.Server,
    label: "Server",
    icon: "🖥️",
    description: "Application or API server",
  },
  {
    type: NodeType.Database,
    label: "Database",
    icon: "💾",
    description: "Data storage system",
  },
  {
    type: NodeType.LoadBalancer,
    label: "Load Balancer",
    icon: "⚖️",
    description: "Distributes traffic",
  },
  {
    type: NodeType.Client,
    label: "Client",
    icon: "👤",
    description: "End user or client application",
  },
  {
    type: NodeType.Cache,
    label: "Cache",
    icon: "⚡",
    description: "Fast data retrieval",
  },
];

/**
 * Default values for Architecture Templates palette
 */
export const templatePaletteItems: TemplatePaletteItem[] = [
  {
    id: "three-tier",
    name: "Three-Tier Architecture",
    description:
      "Classic web application architecture with separation of presentation, business logic, and data layers",
    icon: "🏗️",
  },
  {
    id: "microservices",
    name: "Microservices Architecture",
    description:
      "Distributed system with specialized services communicating via APIs",
    icon: "🧩",
  },
  {
    id: "web-app-caching",
    name: "Web App with Caching",
    description: "Web application with cache layer to improve performance",
    icon: "⚡",
  },
  {
    id: "event-driven",
    name: "Event-Driven Architecture",
    description: "Loosely coupled systems communicating through events",
    icon: "📨",
  },
];
/**
 * Default values for Requests
 */
export const BASE_SIZE = 1; // 1 KB
// How often the simulation updates (ms)
export const TICK_INTERVAL = 100;

// Maximum history length to prevent memory issues
export const MAX_HISTORY_LENGTH = 1000;
export const MAX_METRIC_HISTORY_LENGTH = 100;

// Simulation constants
export const READ_PROB = 0.4;
export const WRITE_PROB = 0.3;
export const COMPUTE_PROB = 0.15;
export const MAX_REQUEST_LIFETIME = 10000;
export const FAILURE_CHANCE_NODE_OVERLOAD = 0.3;
export const RETRY_CHANCE = 0.05;
