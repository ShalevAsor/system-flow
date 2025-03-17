import { Navigate, Outlet, useLocation } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth";
import { useAuthStore } from "../../store/authStore";
/**
 * Protected route component that redirects to login if user is not authenticated
 */
const ProtectedRoute = () => {
  console.log("ProtectedRoute rendered");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the child routes
  return <Outlet />;
};

// ProtectedRoute.whyDidYouRender = true;
export default ProtectedRoute;
