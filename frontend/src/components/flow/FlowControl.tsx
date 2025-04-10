import { useState } from "react";
import LoadFlowModal from "../modals/LoadFlowModal";
import SaveFlowModal from "../modals/SaveFlowModal";
import { useFlowStore } from "../../store/flowStore";
import Button from "../ui/Button";

export const FlowControl: React.FC = () => {
  const clearBoard = useFlowStore((state) => state.clearBoard);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isLoadModalOpen, setIsLoadModalOpen] = useState(false);
  return (
    <div className="flex flex-col space-y-1">
      {/* Save and load flow */}
      <div className="flex flex-row w-full gap-x-1">
        <Button
          label="Save"
          variant="primary"
          onClick={() => setIsSaveModalOpen(true)}
        />
        <Button
          label="Load"
          variant="info"
          onClick={() => setIsLoadModalOpen(true)}
        />
      </div>
      {/* Clear board */}
      <Button
        label="Clear Board"
        variant="warning"
        onClick={clearBoard}
        fullWidth
      />

      {/* Save Flow Modal */}
      <SaveFlowModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
      />
      {/* Load Flow Modal */}
      <LoadFlowModal
        isOpen={isLoadModalOpen}
        onClose={() => setIsLoadModalOpen(false)}
      />
    </div>
  );
};
