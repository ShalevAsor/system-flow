// frontend/src/pages/profile/ProfilePage.tsx
import { useAuth } from "../../hooks/useAuth";

/**
 * User profile page component (protected route)
 */
const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>User Profile</h1>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar">
            {/* Placeholder avatar using initials */}
            <div className="avatar-circle">
              {user?.firstName.charAt(0)}
              {user?.lastName.charAt(0)}
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-item">
              <label>Name:</label>
              <span>
                {user?.firstName} {user?.lastName}
              </span>
            </div>

            <div className="profile-item">
              <label>Email:</label>
              <span>{user?.email}</span>
            </div>

            <div className="profile-item">
              <label>Account ID:</label>
              <span>{user?.id}</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="edit-profile-button">Edit Profile</button>
          <button className="change-password-button">Change Password</button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
