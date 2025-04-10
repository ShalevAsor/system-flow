import { type FlowItem } from "../../services/api/flowService";
import { Database, Share2, Clock } from "lucide-react";
import LoadingButton from "../ui/LoadingButton";

interface FlowItemProps {
  item: FlowItem;
  isCompact?: boolean;

  // Load button props
  onLoad?: (id: string) => void;
  isLoadLoading?: boolean;
  showLoadButton?: boolean;

  // Remove button props
  onRemove?: (id: string) => void;
  isRemoveLoading?: boolean;
  showRemoveButton?: boolean;
}

export const FlowItemComponent: React.FC<FlowItemProps> = ({
  item,
  isCompact = false,

  // Load button props
  onLoad,
  isLoadLoading = false,
  showLoadButton = false,

  // Remove button props
  onRemove,
  isRemoveLoading = false,
  showRemoveButton = false,
}) => {
  // Format the date nicely
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(item.updatedAt));

  // If compact mode is enabled (for use in the modal), remove the card styling
  const containerClasses = isCompact
    ? "w-full"
    : "bg-white shadow-md rounded-xl p-6 border border-gray-300 hover:shadow-lg transition duration-300 w-full max-w-md";

  return (
    <div className={containerClasses}>
      <div className="flex flex-col h-full">
        <div className="flex-grow">
          {/* Title & Stats */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <h3 className="text-xl font-semibold text-blue-500">{item.name}</h3>
            <div className="flex items-center gap-4 text-gray-700 text-sm">
              <div className="flex items-center gap-1">
                <Database className="w-4 h-4 text-gray-500" />
                <span>{item.nodes} Nodes</span>
              </div>
              <div className="flex items-center gap-1">
                <Share2 className="w-4 h-4 text-gray-500" />
                <span>{item.edges} Edges</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-700 text-sm mt-2">{item.description}</p>

          {/* Last Updated */}
          <div className="flex items-center gap-1 text-gray-500 text-xs mt-4">
            <Clock className="w-4 h-4" />
            <span>Last updated: {formattedDate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2">
          {showLoadButton && onLoad && (
            <LoadingButton
              isLoading={isLoadLoading}
              label="Load"
              variant="info"
              onClick={() => onLoad(item.id)}
              size="sm"
              className="flex-1"
            />
          )}

          {showRemoveButton && onRemove && (
            <LoadingButton
              isLoading={isRemoveLoading}
              label="Remove"
              variant="danger"
              onClick={() => onRemove(item.id)}
              size="sm"
              className="flex-1"
            />
          )}
        </div>
      </div>
    </div>
  );
};
