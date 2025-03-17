// import { Provider } from "react-redux";
// import { BrowserRouter as Router } from "react-router-dom";
// import { AuthProvider } from "./context/auth/AuthProvider";
// import { AppRoutes } from "./components/routing/AppRoutes";
// import { ToastContainer } from "react-toastify";
// import { toastConfig } from "./utils/toast";
// import { store } from "./store";
// /**
//  * Main App component that sets up providers and routing
//  */
// function App() {
//   console.log("App rendering");
//   return (
//     <Provider store={store}>
//       <AuthProvider>
//         <Router>
//           <AppRoutes />
//           <ToastContainer {...toastConfig} />
//         </Router>
//       </AuthProvider>
//     </Provider>
//   );
// }

// export default App;

import { BrowserRouter as Router } from "react-router-dom";
import { AppRoutes } from "./components/routing/AppRoutes";
import { ToastContainer } from "react-toastify";
import { toastConfig } from "./utils/toast";
import ErrorBoundary from "./components/common/ErrorBoundary";

/**
 * Main App component that sets up providers and routing
 */
function App() {
  console.log("App rendering");
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
