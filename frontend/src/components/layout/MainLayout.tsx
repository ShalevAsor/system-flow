// frontend/src/components/layout/MainLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Main layout component that wraps all pages with a responsive and
 * accessible layout structure including navigation and footer
 */
const MainLayout = () => {
  console.log("MainLayout rendering");

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar - fixed at the top */}
      <Navbar />

      {/* Main content area - takes available height and adds padding */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* Footer - always at the bottom */}
      <Footer />
    </div>
  );
};

export default MainLayout;
