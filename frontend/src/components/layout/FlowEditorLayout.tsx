// src/components/layout/CanvasLayout.tsx
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * Canvas layout component specifically designed for the canvas page
 * Provides full width and height for the canvas with space for sidebars
 */
const FlowEditorLayout = () => {
  console.log("CanvasLayout rendering");

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Navbar - fixed at the top */}
      <Navbar />

      {/* Main content area - takes available height without padding to maximize space */}
      <main className="flex-grow w-full flex overflow-hidden">
        <Outlet />
      </main>

      {/* Footer - always at the bottom */}
      <Footer />
    </div>
  );
};

export default FlowEditorLayout;
