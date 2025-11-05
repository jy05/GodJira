import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '../services/settings.service';
import { COMMON_TIMEZONES } from '@/lib/timezone';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [registrationEnabled, setRegistrationEnabled] = useState(false);
  const [systemTimezone, setSystemTimezone] = useState('America/Chicago');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
  });

  useEffect(() => {
    if (settings) {
      setRegistrationEnabled(settings.registrationEnabled);
      setSystemTimezone(settings.systemTimezone || 'America/Chicago');
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (data: { registrationEnabled?: boolean; systemTimezone?: string }) => 
      settingsApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const handleToggle = async () => {
    const newValue = !registrationEnabled;
    setRegistrationEnabled(newValue);
    await updateSettingsMutation.mutateAsync({ registrationEnabled: newValue });
  };

  const handleTimezoneChange = async (newTimezone: string) => {
    setSystemTimezone(newTimezone);
    await updateSettingsMutation.mutateAsync({ systemTimezone: newTimezone });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">System Settings</h1>
        
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-8 space-y-8">
            {/* Registration Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Registration Settings</h2>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-base font-medium text-gray-900">Enable User Registration</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Allow new users to register accounts on the login page
                  </p>
                </div>
                
                <button
                  onClick={handleToggle}
                  disabled={updateSettingsMutation.isPending}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    registrationEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  } ${updateSettingsMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  role="switch"
                  aria-checked={registrationEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      registrationEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Timezone Settings */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Timezone Settings</h2>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">System Timezone</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Master timezone for the system. All timestamps are stored in this timezone. Users can set their own preferred display timezone.
                  </p>
                  <select
                    value={systemTimezone}
                    onChange={(e) => handleTimezoneChange(e.target.value)}
                    disabled={updateSettingsMutation.isPending}
                    className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {COMMON_TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label} ({tz.value})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {updateSettingsMutation.isError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">
                  Failed to update settings. Please try again.
                </p>
              </div>
            )}

            {updateSettingsMutation.isSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  Settings updated successfully.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
