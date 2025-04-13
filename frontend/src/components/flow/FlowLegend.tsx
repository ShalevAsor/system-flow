export const FlowLegend: React.FC = () => {
  const legendItems = [
    { color: "bg-[#2196F3]", label: "0 retries" },
    { color: "bg-[#8707ff]", label: "1 retry" },
    { color: "bg-[#FFC107]", label: "2+ retries" },
  ];

  return (
    <div className="p-2 bg-white bg-opacity-80 rounded shadow-sm">
      <h3 className="text-lg font-semibold mb-2">System Design Canvas</h3>
      <div className="flex flex-col gap-1">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
