interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => (
  <div className="p-5 rounded-lg border border-gray-200 hover:shadow-sm transition">
    <div className="text-blue-500 mb-3">{icon}</div>
    <h3 className="text-lg font-semibold mb-2 text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);
