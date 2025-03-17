// frontend/src/pages/dashboard/DashboardPage.tsx

// import { useUser } from "../../hooks/useUser";

/**
 * Dashboard page component (protected route)
 */
const DashboardPage = () => {
  console.log("DashboardPage rendered");
  // const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // const { user } = useUser();
  // return (
  //   <div className="dashboard-page">
  //     <div className="dashboard-header">
  //       <h1>Dashboard</h1>
  //       {/* <p>Welcome back, {user?.firstName}!</p> */}
  //     </div>

  //     <div className="dashboard-content">
  //       <div className="dashboard-card">
  //         <h2>Quick Stats</h2>
  //         <div className="stats-container">
  //           {/* Sample stats - will be replaced with real data */}
  //           <div className="stat-item">
  //             <span className="stat-value">5</span>
  //             <span className="stat-label">Projects</span>
  //           </div>
  //           <div className="stat-item">
  //             <span className="stat-value">12</span>
  //             <span className="stat-label">Tasks</span>
  //           </div>
  //           <div className="stat-item">
  //             <span className="stat-value">3</span>
  //             <span className="stat-label">Completed</span>
  //           </div>
  //         </div>
  //       </div>

  //       <div className="dashboard-card">
  //         <h2>Recent Activity</h2>
  //         <div className="activity-list">
  //           <p>No recent activity to display.</p>
  //         </div>
  //       </div>
  //     </div>
  //   </div>
  // );
  return <div>dashboard </div>;
};
DashboardPage.whyDidYouRender = true;
export default DashboardPage;
