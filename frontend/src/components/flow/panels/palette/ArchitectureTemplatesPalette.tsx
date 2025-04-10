// src/components/canvas/ArchitectureTemplatesPalette.tsx
import React from "react";
import { TemplatePaletteItem } from "../../../../types/flow/architectureTypes";
import { templatePaletteItems } from "../../../../constants/flowDefaults";

interface ArchitectureTemplatesPaletteProps {
  onDragStart: (
    event: React.DragEvent,
    templateInfo: TemplatePaletteItem
  ) => void;
}

const ArchitectureTemplatesPalette: React.FC<
  ArchitectureTemplatesPaletteProps
> = ({ onDragStart }) => {
  return (
    <div className="bg-white p-3 rounded-lg shadow-md">
      <div className="flex flex-col gap-3">
        {templatePaletteItems.map((template) => (
          <div
            key={template.id}
            className="p-3 border rounded cursor-move hover:bg-gray-50 transition-colors"
            draggable
            onDragStart={(event) => onDragStart(event, template)}
            title={template.description}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{template.icon}</span>
              <span className="font-medium">{template.name}</span>
            </div>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArchitectureTemplatesPalette;
