// src/pages/profile/ProfilePage.tsx
import { useState } from "react";
import { User } from "../../types/userTypes";
import { useUser } from "../../hooks/useUser";
import ProfileUpdateForm from "../../components/profile/ProfileUpdateForm";
import ChangePasswordForm from "../../components/profile/ChangePasswordForm";
import { UserCircle, Mail, CheckCircle, XCircle } from "lucide-react";
import Loading from "../../components/ui/Loading";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/ui/ErrorMessage";
enum ProfileTab {
  PERSONAL_INFO = "personal_info",
  SECURITY = "security",
}

/**
 * Profile page component
 */
const ProfilePage = () => {
  console.log("ProfilePage rendered");
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUser();
  const [activeTab, setActiveTab] = useState<ProfileTab>(
    ProfileTab.PERSONAL_INFO
  );

  // Loading state
  if (isLoading) {
    return <Loading variant="content" message="Loading profile..." />;
  }

  // Error state
  if (error || !user) {
    return (
      <ErrorMessage
        title="Failed to load profile"
        message={
          error?.message ||
          "Could not load your profile data. Please try again."
        }
        severity="error"
        onRetry={() => navigate(0)} // Refresh current route
      />
    );
  }

  // Tab selection buttons
  const TabButton = ({ tab, label }: { tab: ProfileTab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 font-medium rounded-t-lg ${
        activeTab === tab
          ? "bg-white border-t border-r border-l border-gray-200 text-blue-600"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Profile header with user info */}
        <ProfileHeader user={user} />

        {/* Tab navigation */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-2">
            <TabButton
              tab={ProfileTab.PERSONAL_INFO}
              label="Personal Information"
            />
            <TabButton tab={ProfileTab.SECURITY} label="Security" />
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {activeTab === ProfileTab.PERSONAL_INFO && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Update Your Profile
              </h2>
              <ProfileUpdateForm />
            </div>
          )}

          {activeTab === ProfileTab.SECURITY && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Change Your Password
              </h2>
              <ChangePasswordForm />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Profile header component
const ProfileHeader = ({ user }: { user: User }) => (
  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 sm:p-8">
    <div className="flex flex-col sm:flex-row items-center sm:items-start">
      <div className="bg-white p-2 rounded-full shadow-lg mb-4 sm:mb-0 sm:mr-6">
        <UserCircle className="h-16 w-16 text-blue-500" />
      </div>
      <div className="text-center sm:text-left">
        <h1 className="text-2xl font-bold text-white">
          {user.firstName} {user.lastName}
        </h1>
        <div className="flex items-center justify-center sm:justify-start mt-2 text-blue-100">
          <Mail className="h-4 w-4 mr-1" />
          <span>{user.email}</span>
        </div>
        <div className="flex items-center justify-center sm:justify-start mt-2">
          {user.isEmailVerified ? (
            <div className="flex items-center text-green-200">
              <CheckCircle className="h-4 w-4 mr-1" />
              <span>Email verified</span>
            </div>
          ) : (
            <div className="flex items-center text-yellow-200">
              <XCircle className="h-4 w-4 mr-1" />
              <span>Email not verified</span>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
export default ProfilePage;
