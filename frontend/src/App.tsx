import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./components/routing/AppRoutes";
import { ToastContainer } from "react-toastify";
import { toastConfig } from "./utils/toast";
import ErrorBoundary from "./components/common/ErrorBoundary";

/**
 * Main App component that sets up providers and routing
 */
function App() {
  return (
    <ErrorBoundary name="App">
      <Router>
        <AppRoutes />
        <ToastContainer {...toastConfig} />
      </Router>
    </ErrorBoundary>
  );
}

export default App;
