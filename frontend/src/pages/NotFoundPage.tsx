// frontend/src/pages/NotFoundPage.tsx
import { Link } from "react-router-dom";

/**
 * 404 Not Found page with visually appealing design
 */
const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      {/* Error Code */}
      <h1 className="text-9xl font-bold text-indigo-600">404</h1>

      {/* Error Message */}
      <div className="mt-4 mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved.
        </p>
      </div>

      {/* Call to Action */}
      <Link
        to="/"
        className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
