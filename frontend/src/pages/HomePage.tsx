// frontend/src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { FeatureCard } from "../components/cards/SimpleFeatureCard";
import {
  ArrowRight,
  Activity,
  Database,
  Play,
  Share2,
  Save,
} from "lucide-react";

/**
 * Home page component (public route)
 */
const HomePage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="py-16 px-6 text-center max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-6">
          SystemFlow
        </h1>
        <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
          Design, simulate and visualize complex systems with an intuitive
          drag-and-drop interface
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          {isAuthenticated && (
            <Link
              to="/flow-library"
              className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              Go to Library <ArrowRight size={18} />
            </Link>
          )}
        </div>
      </div>

      {/* Features Section - Simplified */}
      <div className="py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-gray-800">
            Build complex system designs with ease
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Database />}
              title="Create System Components"
              description="Design customizable nodes representing services, databases, users, and more."
            />

            <FeatureCard
              icon={<Share2 />}
              title="Define Relationships"
              description="Connect components with directional flows to model system interactions."
            />

            <FeatureCard
              icon={<Play />}
              title="Run Simulations"
              description="Test your design with interactive simulations to identify bottlenecks."
            />

            <FeatureCard
              icon={<Activity />}
              title="Analyze Performance"
              description="Get real-time analytics on your system's performance characteristics."
            />

            <FeatureCard
              icon={<Save />}
              title="Save & Share"
              description="Store designs in your library and collaborate with team members."
            />

            <FeatureCard
              icon={<Database />}
              title="Template Library"
              description="Start quickly with pre-built templates for common architectures."
            />
          </div>
        </div>
      </div>

      {/* Call to Action - Simplified */}
      <div className="py-12 px-6 bg-blue-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">
            Ready to design your next system?
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Join SystemFlow today and bring your architectural visions to life.
          </p>

          {!isAuthenticated && (
            <Link
              to="/register"
              className="bg-blue-600 text-white px-8 py-3 rounded-md font-medium hover:bg-blue-700 transition inline-block"
            >
              Get Started for Free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
