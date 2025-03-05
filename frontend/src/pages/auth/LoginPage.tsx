// // LoginPage.tsx - Page responsibilities
// import { useEffect } from "react";
// import { useNavigate, useLocation, Link } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth";
// import LoginForm from "../../components/auth/LoginForm";

// /**
//  * Login page component - Handles layout and navigation
//  */
// const LoginPage = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();

//   // Get redirect path from location state or default to dashboard
//   const from =
//     (location.state as { from?: { pathname: string } })?.from?.pathname ||
//     "/dashboard";

//   // Redirect if already logged in
//   useEffect(() => {
//     if (user) {
//       navigate(from, { replace: true });
//     }
//   }, [user, navigate, from]);

//   return (
//     <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full mx-auto">
//       <div className="text-center mb-8">
//         <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
//         <p className="text-gray-600 mt-2">Sign in to your account</p>
//       </div>

//       <LoginForm />

//       <div className="mt-8 text-center text-sm">
//         <p className="text-gray-600">
//           Don't have an account?{" "}
//           <Link
//             to="/register"
//             className="text-blue-600 hover:text-blue-500 font-medium"
//           >
//             Create an account
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;
// frontend/src/pages/auth/LoginPage.tsx
import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoginForm from "../../components/auth/LoginForm";
import AuthCard from "../../components/auth/AuthCard";

/**
 * Login page component - Handles layout and navigation
 */
const LoginPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get redirect path from location state or default to dashboard
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const footerContent = (
    <p className="text-gray-600">
      Don't have an account?{" "}
      <Link
        to="/register"
        className="text-blue-600 hover:text-blue-500 font-medium"
      >
        Create an account
      </Link>
    </p>
  );

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to your account"
      footer={footerContent}
    >
      <LoginForm />
    </AuthCard>
  );
};

export default LoginPage;
