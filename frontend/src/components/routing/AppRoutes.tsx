import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";

// Auth pages
import LoginPage from "../../pages/auth/LoginPage";
import RegisterPage from "../../pages/auth/RegisterPage";
import VerifyEmailPage from "../../pages/auth/VerifyEmailPage";
import ResendVerificationPage from "../../pages/auth/ResendVerificationPage";
import ForgotPasswordPage from "../../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../../pages/auth/ResetPasswordPage";

// Main pages
import HomePage from "../../pages/HomePage";
import DashboardPage from "../../pages/flowLibrary/FlowLibraryPage";
import ProfilePage from "../../pages/profile/ProfilePage";
import NotFoundPage from "../../pages/NotFoundPage";
import FlowEditorPage from "../../pages/flow/FlowEditorPage";
import FlowEditorLayout from "../layout/FlowEditorLayout";

/**
 * AppRoutes component that organizes all routes in the application
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes with centered layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/resend-verification"
          element={<ResendVerificationPage />}
        />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      {/* Canvas routes with maximized layout */}
      <Route element={<FlowEditorLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/flow-editor" element={<FlowEditorPage />} />
          {/* Add any other canvas-related routes here */}
        </Route>
      </Route>

      {/* Main routes with standard layout */}
      <Route element={<MainLayout />}>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/flow-library" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {/* <Route path="/canvas" element={<CanvasPage />} /> */}
          {/* Add more protected routes here as needed */}
        </Route>

        {/* Not found routes */}
        <Route path="/not-found" element={<NotFoundPage />} />
      </Route>
      {/* Redirect to not found page if route doesn't exist */}
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
};

export default AppRoutes;
