// frontend/src/components/layout/AuthLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Authentication layout component that centers the auth forms
 * and provides a cleaner experience for login/register pages
 */
const AuthLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar at the top */}
      <Navbar />

      {/* Main content area - centered both horizontally and vertically */}
      <main className="flex-grow flex items-center justify-center">
        <div className="w-full max-w-md px-6 py-8">
          <Outlet />
        </div>
      </main>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  );
};

export default AuthLayout;
