import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/Layout';
import { AvatarUpload } from '@/components/profile/AvatarUpload';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { ChangePasswordForm } from '@/components/profile/ChangePasswordForm';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('profile')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'profile'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                  ${
                    activeTab === 'password'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                Change Password
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {activeTab === 'profile' ? (
              <>
                {/* Avatar Section */}
                <div className="lg:col-span-1">
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Profile Picture
                    </h3>
                    <AvatarUpload currentAvatar={user.avatar} />
                  </div>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2">
                  <div className="card">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Personal Information
                    </h3>
                    <ProfileForm user={user} />
                  </div>
                </div>
              </>
            ) : (
              <div className="lg:col-span-3">
                <div className="card max-w-2xl">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Change Your Password
                  </h3>
                  <ChangePasswordForm />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
