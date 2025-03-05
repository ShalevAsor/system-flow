// // frontend/src/pages/auth/RegisterPage.tsx
// import { useEffect } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { useAuth } from "../../hooks/useAuth";
// import RegisterForm from "../../components/auth/RegisterForm";

// /**
//  * Register page component - Handles layout and navigation
//  */
// const RegisterPage = () => {
//   const { user } = useAuth();
//   const navigate = useNavigate();

//   // Redirect if already logged in
//   useEffect(() => {
//     if (user) {
//       navigate("/dashboard", { replace: true });
//     }
//   }, [user, navigate]);

//   return (
//     <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full mx-auto">
//       <div className="text-center mb-8">
//         <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
//         <p className="text-gray-600 mt-2">Fill in your details to register</p>
//       </div>

//       <RegisterForm />

//       <div className="mt-8 text-center text-sm">
//         <p className="text-gray-600">
//           Already have an account?{" "}
//           <Link
//             to="/login"
//             className="text-blue-600 hover:text-blue-500 font-medium"
//           >
//             Sign in
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;
// frontend/src/pages/auth/RegisterPage.tsx
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import RegisterForm from "../../components/auth/RegisterForm";
import AuthCard from "../../components/auth/AuthCard";

/**
 * Register page component - Handles layout and navigation
 */
const RegisterPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const footerContent = (
    <p className="text-gray-600">
      Already have an account?{" "}
      <Link
        to="/login"
        className="text-blue-600 hover:text-blue-500 font-medium"
      >
        Sign in
      </Link>
    </p>
  );

  return (
    <AuthCard
      title="Create Account"
      subtitle="Fill in your details to register"
      footer={footerContent}
    >
      <RegisterForm />
    </AuthCard>
  );
};

export default RegisterPage;
