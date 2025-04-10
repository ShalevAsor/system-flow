import { useSimulationStore } from "../../../store/simulationStore";
import Button from "../../ui/Button";

export const SimulationControl: React.FC = () => {
  const {
    isRunning,
    isPaused,
    startSimulation,
    resetSimulation,
    resumeSimulation,
    pauseSimulation,
  } = useSimulationStore();

  return (
    <div className="flex flex-col space-y-1">
      {/* If simulation is not running or paused, show start button */}
      {!isRunning && !isPaused && (
        <Button label="Start" onClick={startSimulation} variant="primary" />
      )}
      {/* If simulation is running, show pause and reset buttons */}
      {isRunning && (
        <div className="flex flex-row w-full gap-x-2">
          <Button label="Pause" onClick={pauseSimulation} variant="warning" />
          <Button label="Reset" onClick={resetSimulation} variant="danger" />
        </div>
      )}
      {/* If simulation is paused, show resume and reset button */}
      {isPaused && (
        <div className="flex flex-row w-full gap-x-2 ">
          <Button
            label="Resume"
            onClick={resumeSimulation}
            variant="success"
            fullWidth
          />
          <Button
            label="Reset"
            onClick={resetSimulation}
            variant="danger"
            fullWidth
          />
        </div>
      )}
    </div>
  );
};
