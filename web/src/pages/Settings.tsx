import { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

interface Preferences {
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  profileVisibility?: 'public' | 'private' | 'connections';
  theme?: 'light' | 'dark' | 'system';
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [preferences, setPreferences] = useState<Preferences>({
    emailNotifications: true,
    marketingEmails: false,
    profileVisibility: 'public',
    theme: theme
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await userService.getPreferences();
      if (response.data.preferences) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setPreferences({ ...preferences, theme: newTheme });
    // Immediately apply theme change
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      setTheme(systemTheme);
    } else {
      setTheme(newTheme);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await userService.updatePreferences(preferences);
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-800 dark:text-gray-400">
          Manage your account preferences and privacy settings
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200' : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Notifications */}
        <div className="bg-white border border-gray-300 dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Notifications
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-900 dark:text-gray-400">
              Choose how you want to be notified
            </p>
          </div>
          <div className="border-t border-gray-400 dark:border-gray-700 px-4 py-5 sm:px-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="email-notifications" className="font-medium text-gray-900 dark:text-gray-300">
                    Email Notifications
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-400">
                    Receive email updates about your investments and activity
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, emailNotifications: !preferences.emailNotifications })}
                  className={`${
                    preferences.emailNotifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      preferences.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="marketing-emails" className="font-medium text-gray-900 dark:text-gray-300">
                    Marketing Emails
                  </label>
                  <p className="text-sm text-gray-900 dark:text-gray-400">
                    Receive emails about new features and opportunities
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, marketingEmails: !preferences.marketingEmails })}
                  className={`${
                    preferences.marketingEmails ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
                >
                  <span
                    className={`${
                      preferences.marketingEmails ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-white border border-gray-300 dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Privacy
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-900 dark:text-gray-400">
              Control who can see your profile information
            </p>
          </div>
          <div className="border-t border-gray-400 dark:border-gray-700 px-4 py-5 sm:px-6">
            <div>
              <label htmlFor="profile-visibility" className="block text-sm font-medium text-gray-900 dark:text-gray-300">
                Profile Visibility
              </label>
              <select
                id="profile-visibility"
                value={preferences.profileVisibility}
                onChange={(e) => setPreferences({ ...preferences, profileVisibility: e.target.value as any })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-2 focus:border-primary-500 sm:text-sm rounded-md"
              >
                <option value="public">Public - Anyone can see your profile</option>
                <option value="connections">Connections Only - Only your connections can see your profile</option>
                <option value="private">Private - Only you can see your profile</option>
              </select>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white border border-gray-300 dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Appearance
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-900 dark:text-gray-400">
              Customize how the app looks
            </p>
          </div>
          <div className="border-t border-gray-400 dark:border-gray-700 px-4 py-5 sm:px-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-gray-300 mb-4">
                Theme Preference
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { 
                    value: 'light', 
                    label: 'Light', 
                    description: 'Clean and bright',
                    icon: SunIcon 
                  },
                  { 
                    value: 'dark', 
                    label: 'Dark', 
                    description: 'Easy on the eyes',
                    icon: MoonIcon 
                  },
                  { 
                    value: 'system', 
                    label: 'System', 
                    description: 'Match your device',
                    icon: ComputerDesktopIcon 
                  }
                ].map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isSelected = preferences.theme === themeOption.value;
                  
                  return (
                    <label
                      key={themeOption.value}
                      className={`
                        relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-400' 
                          : 'border-gray-400 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={themeOption.value}
                        checked={isSelected}
                        onChange={(e) => handleThemeChange(e.target.value as any)}
                        className="sr-only"
                      />
                      <Icon className={`h-6 w-6 mb-2 ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                      <div className={`text-sm font-medium ${isSelected ? 'text-primary-900 dark:text-primary-100' : 'text-gray-900 dark:text-gray-100'}`}>
                        {themeOption.label}
                      </div>
                      <div className={`text-xs text-center ${isSelected ? 'text-primary-600 dark:text-primary-300' : 'text-gray-900 dark:text-gray-400'}`}>
                        {themeOption.description}
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary-500 rounded-full"></div>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}