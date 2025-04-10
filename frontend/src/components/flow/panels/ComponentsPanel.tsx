import { TemplatePaletteItem } from "../../../types/flow/architectureTypes";
import { ComponentPaletteItem } from "../../../types/flow/paletteItemTypes";
import ArchitectureTemplatesPalette from "./palette/ArchitectureTemplatesPalette";
import ComponentPalette from "./palette/ComponentPalette";
import PropertySection from "../properties/common/PropertySection";

interface ComponentsPanelProps {
  onDragStart: (
    event: React.DragEvent,
    componentInfo: ComponentPaletteItem
  ) => void;
  onTemplateDragStart: (
    event: React.DragEvent,
    templateInfo: TemplatePaletteItem
  ) => void;
}
export const ComponentsPanel: React.FC<ComponentsPanelProps> = ({
  onDragStart,
  onTemplateDragStart,
}) => {
  return (
    <div className="flex flex-col gap-y-2">
      {/* Components Palette - Drag and Drop */}
      <PropertySection title="Components" collapsible defaultOpen>
        <ComponentPalette onDragStart={onDragStart} />
      </PropertySection>
      {/* Architecture Templates */}
      <PropertySection title="Templates" collapsible defaultOpen={false}>
        <ArchitectureTemplatesPalette onDragStart={onTemplateDragStart} />
      </PropertySection>
    </div>
  );
};
