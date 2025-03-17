// frontend/src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

/**
 * Home page component (public route)
 */
const HomePage = () => {
  console.log("HomePage rendering");
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to My Application</h1>
        <p className="hero-tagline">
          A powerful tool for managing your workflow
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to="/dashboard" className="primary-button">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="primary-button">
                Log In
              </Link>
              <Link to="/register" className="secondary-button">
                Create Account
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="features-section">
        <h2>Key Features</h2>

        <div className="features-container">
          <div className="feature-card">
            <h3>Feature 1</h3>
            <p>Description of the first amazing feature of your application.</p>
          </div>

          <div className="feature-card">
            <h3>Feature 2</h3>
            <p>
              Description of the second amazing feature of your application.
            </p>
          </div>

          <div className="feature-card">
            <h3>Feature 3</h3>
            <p>Description of the third amazing feature of your application.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
