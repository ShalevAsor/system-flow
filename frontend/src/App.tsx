// frontend/src/App.tsx
import { useState } from "react";
import { AuthProvider } from "./context/auth/AuthProvider";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import Home from "./pages/Home";
import "./App.css";

function App() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <AuthProvider>
      <div className="container">
        <header>
          <h1>Script-to-UI Web App</h1>
          <p>Convert your scripts into user-friendly interfaces</p>
        </header>
        <main>
          <Home />

          {!showRegister ? (
            <div>
              <LoginForm />
              <p>
                Don't have an account?{" "}
                <button onClick={() => setShowRegister(true)}>Register</button>
              </p>
            </div>
          ) : (
            <div>
              <RegisterForm />
              <p>
                Already have an account?{" "}
                <button onClick={() => setShowRegister(false)}>Login</button>
              </p>
            </div>
          )}
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
