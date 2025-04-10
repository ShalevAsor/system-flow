import PropertySection from "../properties/common/PropertySection";
import { BottleneckAnalyzer } from "./BottleneckAnalyzer";
import { ComponentUtilizationView } from "./ComponentUtilizationView";
import { ErrorAnalyzer } from "./ErrorAnalyzer";
import { SimulationControl } from "./SimulationControl";
import { SimulationOverview } from "./SimulationOverview";
const SimulationPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-y-2">
      {/* Simulation Control - Start/Pause/Reset/Resume */}
      <SimulationControl />
      {/* Overview Statistics */}
      <PropertySection title="Overview" collapsible defaultOpen={true}>
        <SimulationOverview />
      </PropertySection>
      {/* Component Utilization Heatmap */}
      <PropertySection
        title="Component Utilization"
        collapsible
        defaultOpen={false}
      >
        <ComponentUtilizationView />
      </PropertySection>
      {/* Bottleneck Analysis */}
      <PropertySection
        title="Bottleneck Analysis"
        collapsible
        defaultOpen={false}
      >
        <BottleneckAnalyzer />
      </PropertySection>
      {/* Error Analysis */}
      <PropertySection title="Error Analysis" collapsible defaultOpen={false}>
        <ErrorAnalyzer />
      </PropertySection>
    </div>
  );
};

export default SimulationPanel;
