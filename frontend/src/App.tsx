// // frontend/src/App.tsx
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { AuthProvider } from "./context/auth/AuthProvider";
// import ProtectedRoute from "./components/routing/ProtectedRoute";
// import MainLayout from "./components/layout/MainLayout";
// import AuthLayout from "./components/layout/AuthLayout";
// import HomePage from "./pages/HomePage";
// import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/auth/RegisterPage";
// import VerifyEmailPage from "./pages/auth/VerifyEmailPage";
// import ResendVerificationPage from "./pages/auth/ResendVerificationPage";
// import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
// import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
// import DashboardPage from "./pages/dashboard/DashboardPage";
// import ProfilePage from "./pages/profile/ProfilePage";
// import NotFoundPage from "./pages/NotFoundPage";

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <Routes>
//           {/* Auth routes with centered layout */}
//           <Route element={<AuthLayout />}>
//             <Route path="/login" element={<LoginPage />} />
//             <Route path="/register" element={<RegisterPage />} />
//             <Route path="/verify-email" element={<VerifyEmailPage />} />
//             <Route
//               path="/resend-verification"
//               element={<ResendVerificationPage />}
//             />
//             <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//             <Route path="/reset-password" element={<ResetPasswordPage />} />
//           </Route>

//           {/* Main routes with standard layout */}
//           <Route element={<MainLayout />}>
//             {/* Home page */}
//             <Route path="/" element={<HomePage />} />

//             {/* Protected routes - require authentication */}
//             <Route element={<ProtectedRoute />}>
//               <Route path="/dashboard" element={<DashboardPage />} />
//               <Route path="/profile" element={<ProfilePage />} />
//             </Route>

//             {/* Not found route */}
//             <Route path="/not-found" element={<NotFoundPage />} />
//             <Route path="*" element={<Navigate to="/not-found" replace />} />
//           </Route>
//         </Routes>
//       </AuthProvider>
//     </Router>
//   );
// }

// export default App;
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/auth/AuthProvider";
import { AppRoutes } from "./components/routing/AppRoutes";
import { ToastContainer } from "react-toastify";
import { toastConfig } from "./utils/toast";

/**
 * Main App component that sets up providers and routing
 */
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer {...toastConfig} />
      </Router>
    </AuthProvider>
  );
}

export default App;
