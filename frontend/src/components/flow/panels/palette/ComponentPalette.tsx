// src/components/canvas/ComponentPalette.tsx
import React from "react";
import { ComponentPaletteItem } from "../../../../types/flow/paletteItemTypes";
import { componentTypes } from "../../../../constants/flowDefaults";

// Define the props interface for the component
interface ComponentPaletteProps {
  onDragStart: (
    event: React.DragEvent,
    componentInfo: ComponentPaletteItem
  ) => void;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onDragStart }) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow-md">
      <h3 className="font-medium text-lg mb-3">Nodes</h3>
      <div className="flex flex-col gap-2">
        {componentTypes.map((component) => (
          <div
            key={component.type}
            className="p-2 border rounded cursor-move flex items-center hover:bg-gray-50"
            draggable
            onDragStart={(event) => onDragStart(event, component)}
            title={component.description}
          >
            <span className="mr-2 text-xl">{component.icon}</span>
            <span>{component.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentPalette;
