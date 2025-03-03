import React from "react";
import { useAuth } from "../hooks/useAuth";

const Home: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="home">
      {user ? (
        <div>
          <h2>Welcome, {user.firstName}!</h2>
          <p>You are now logged in to the Script-to-UI application.</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <p>Please login or register to use the application.</p>
      )}
    </div>
  );
};

export default Home;
