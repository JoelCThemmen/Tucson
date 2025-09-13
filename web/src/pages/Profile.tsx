import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useAuthProvider';
import { userService } from '../services/api';
import { useApi } from '../hooks/useApi';
import {
  UserCircleIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  PhoneIcon,
  LinkIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PencilIcon,
  CameraIcon,
  ShieldCheckIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/20/solid';

interface ProfileData {
  bio?: string;
  phone?: string;
  location?: string;
  company?: string;
  position?: string;
  website?: string;
  linkedIn?: string;
  aboutMe?: string;
  investmentPreferences?: string;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';
}

const riskToleranceOptions = [
  { value: 'conservative', label: 'Conservative', description: 'Lower risk, steady returns' },
  { value: 'moderate', label: 'Moderate', description: 'Balanced risk and reward' },
  { value: 'aggressive', label: 'Aggressive', description: 'Higher risk, higher potential' },
];

export default function Profile() {
  const { user } = useUser();
  const { isReady } = useApi();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({});
  const [editedProfile, setEditedProfile] = useState<ProfileData>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isReady && user) {
      fetchProfile();
    }
  }, [isReady, user]);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      const profileData = response.data.profile || {};
      setProfile(profileData);
      setEditedProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await userService.updateProfile(editedProfile);
      setProfile(editedProfile);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Failed to save profile' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setMessage(null);
  };

  // Calculate profile completion
  const profileFields = ['phone', 'location', 'company', 'position', 'bio', 'linkedIn', 'aboutMe', 'investmentPreferences', 'riskTolerance'];
  const completedFields = profileFields.filter(field => profile[field as keyof ProfileData]);
  const completionPercentage = Math.round((completedFields.length / profileFields.length) * 100);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <UserCircleIcon className="h-8 w-8 text-primary-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="bg-gradient-to-b from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800 rounded-lg py-12 px-6 mt-4 border-4 border-blue-400">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-800 text-white rounded-lg">
          <div className="px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition-all">
                      <CameraIcon className="h-4 w-4 text-gray-800 dark:text-neutral-300" />
                    </button>
                  )}
                </div>
                
                {/* User Info */}
                <div>
                  <h1 className="text-3xl font-bold">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-primary-200 mt-1">
                    {profile.position || 'Investor'} {profile.company && `at ${profile.company}`}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1">
                      <ShieldCheckIcon className="h-4 w-4 text-success-400" />
                      <span className="text-sm text-primary-200">Verified Account</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4 text-primary-300" />
                      <span className="text-sm text-primary-200">
                        Member since {new Date((user as any)?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white dark:bg-gray-800/20 transition-all text-sm font-medium"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="space-x-3">
                    <button
                      onClick={handleCancel}
                      className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 text-white rounded-lg hover:bg-white dark:bg-gray-800/20 transition-all text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="inline-flex items-center px-5 py-2.5 bg-white dark:bg-gray-800 text-primary-900 rounded-lg hover:bg-neutral-100 transition-all text-sm font-medium disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="-mt-6">
          <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Completion</h3>
                <p className="text-sm text-gray-900 dark:text-gray-600 mt-1">
                  Complete your profile to unlock all features
                </p>
              </div>
              <div className="text-2xl font-bold text-primary-600">{completionPercentage}%</div>
            </div>
            <div className="relative">
              <div className="h-3 bg-gray-300 dark:bg-neutral-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              {completionPercentage < 100 && (
                <p className="text-xs text-gray-900 dark:text-gray-600 mt-2">
                  Complete {profileFields.length - completedFields.length} more fields to reach 100%
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Alert Messages */}
        {message && (
          <div className="mb-6">
            <div className={`flex items-center gap-3 p-4 rounded-lg animate-fade-in ${
              message.type === 'success' 
                ? 'bg-green-100 dark:bg-success-900/20 dark:bg-success-900/20 text-green-900 dark:text-success-200 border border-green-400 dark:border-success-700' 
                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-700" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="pb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Contact & Professional */}
            <div className="lg:col-span-1 space-y-6">
              {/* Contact Information */}
              <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-400 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Email */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-800 dark:text-neutral-300 mb-2">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-800 dark:text-gray-600" />
                    Email
                  </label>
                  <p className="text-sm text-gray-900 dark:text-neutral-100 bg-gray-100 dark:bg-neutral-800 px-3 py-2 rounded-lg">
                    {(user as any)?.emailAddresses?.[0]?.emailAddress || (user as any)?.email || 'No email'}
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-800 dark:text-neutral-300 mb-2">
                    <PhoneIcon className="h-4 w-4 mr-2 text-gray-800 dark:text-gray-600" />
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-400 dark:border-neutral-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-2 focus:border-primary-500 text-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 dark:text-neutral-100 bg-gray-100 dark:bg-neutral-800 px-3 py-2 rounded-lg">
                      {profile.phone || <span className="text-gray-800 dark:text-gray-600">Not provided</span>}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-800 dark:text-neutral-300 mb-2">
                    <MapPinIcon className="h-4 w-4 mr-2 text-gray-800 dark:text-gray-600" />
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-400 dark:border-neutral-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-2 focus:border-primary-500 text-sm"
                      placeholder="Tucson, AZ"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 dark:text-neutral-100 bg-gray-100 dark:bg-neutral-800 px-3 py-2 rounded-lg">
                      {profile.location || <span className="text-gray-800 dark:text-gray-600">Not provided</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>

              {/* Professional Information */}
              <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-400 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Professional</h3>
              </div>
              <div className="p-6 space-y-4">
                {/* Company */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-800 dark:text-neutral-300 mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2 text-gray-800 dark:text-gray-600" />
                    Company
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.company || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, company: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-400 dark:border-neutral-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-2 focus:border-primary-500 text-sm"
                      placeholder="Acme Corp"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 dark:text-neutral-100 bg-gray-100 dark:bg-neutral-800 px-3 py-2 rounded-lg">
                      {profile.company || <span className="text-gray-800 dark:text-gray-600">Not provided</span>}
                    </p>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-800 dark:text-neutral-300 mb-2">
                    <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-800 dark:text-gray-600" />
                    Position
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.position || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, position: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-400 dark:border-neutral-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-2 focus:border-primary-500 text-sm"
                      placeholder="Investment Manager"
                    />
                  ) : (
                    <p className="text-sm text-gray-900 dark:text-neutral-100 bg-gray-100 dark:bg-neutral-800 px-3 py-2 rounded-lg">
                      {profile.position || <span className="text-gray-800 dark:text-gray-600">Not provided</span>}
                    </p>
                  )}
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-800 dark:text-neutral-300 mb-2">
                    <LinkIcon className="h-4 w-4 mr-2 text-gray-800 dark:text-gray-600" />
                    LinkedIn
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editedProfile.linkedIn || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, linkedIn: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-400 dark:border-neutral-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-2 focus:border-primary-500 text-sm"
                      placeholder="linkedin.com/in/username"
                    />
                  ) : (
                    <p className="text-sm bg-gray-100 dark:bg-neutral-800 px-3 py-2 rounded-lg">
                      {profile.linkedIn ? (
                        <a 
                          href={profile.linkedIn} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          View Profile →
                        </a>
                      ) : (
                        <span className="text-gray-800 dark:text-gray-600">Not provided</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-800 dark:text-neutral-300 mb-2">
                    <LinkIcon className="h-4 w-4 mr-2 text-gray-800 dark:text-gray-600" />
                    Website
                  </label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={editedProfile.website || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, website: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-400 dark:border-neutral-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-2 focus:border-primary-500 text-sm"
                      placeholder="https://example.com"
                    />
                  ) : (
                    <p className="text-sm bg-gray-100 dark:bg-neutral-800 px-3 py-2 rounded-lg">
                      {profile.website ? (
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-primary-600 hover:text-primary-700 hover:underline"
                        >
                          Visit Website →
                        </a>
                      ) : (
                        <span className="text-gray-800 dark:text-gray-600">Not provided</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
            </div>

            {/* Right Column - Bio & Investment Preferences */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Me */}
              <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-400 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">About Me</h3>
              </div>
              <div className="p-6">
                {isEditing ? (
                  <textarea
                    rows={6}
                    value={editedProfile.aboutMe || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, aboutMe: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-400 dark:border-neutral-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-2 focus:border-primary-500 text-sm resize-none"
                    placeholder="Tell us about yourself, your investment experience, and what you're looking for..."
                  />
                ) : (
                  <p className="text-gray-800 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                    {profile.aboutMe || <span className="text-gray-800 dark:text-gray-600 italic">No bio provided yet. Add one to help others get to know you!</span>}
                  </p>
                )}
              </div>
            </div>

              {/* Investment Preferences */}
              <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-400 dark:border-neutral-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Investment Profile</h3>
              </div>
              <div className="p-6 space-y-6">
                {/* Risk Tolerance */}
                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-neutral-300 mb-3 block">
                    Risk Tolerance
                  </label>
                  {isEditing ? (
                    <div className="grid grid-cols-3 gap-3">
                      {riskToleranceOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setEditedProfile({ ...editedProfile, riskTolerance: option.value as any })}
                          className={`relative p-4 rounded-lg border-2 transition-all ${
                            editedProfile.riskTolerance === option.value
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-400 dark:border-neutral-600 hover:border-gray-400 dark:hover:border-neutral-500'
                          }`}
                        >
                          {editedProfile.riskTolerance === option.value && (
                            <CheckIcon className="absolute top-2 right-2 h-5 w-5 text-primary-600" />
                          )}
                          <div className="text-left">
                            <p className="font-medium text-gray-900 dark:text-white">{option.label}</p>
                            <p className="text-xs text-gray-900 dark:text-gray-600 mt-1">{option.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      {profile.riskTolerance ? (
                        <>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                            profile.riskTolerance === 'conservative' 
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                              : profile.riskTolerance === 'moderate'
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                          }`}>
                            {riskToleranceOptions.find(o => o.value === profile.riskTolerance)?.label}
                          </div>
                          <span className="text-sm text-gray-900 dark:text-gray-600">
                            {riskToleranceOptions.find(o => o.value === profile.riskTolerance)?.description}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-800 dark:text-gray-600 text-sm">Not specified</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Investment Preferences */}
                <div>
                  <label className="text-sm font-medium text-gray-800 dark:text-neutral-300 mb-2 block">
                    Investment Preferences
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={4}
                      value={editedProfile.investmentPreferences || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, investmentPreferences: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-400 dark:border-neutral-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-2 focus:border-primary-500 text-sm resize-none"
                      placeholder="What types of investments are you interested in? (e.g., stocks, real estate, startups, etc.)"
                    />
                  ) : (
                    <p className="text-gray-800 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                      {profile.investmentPreferences || <span className="text-gray-800 dark:text-gray-600 italic">Share your investment interests and goals</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>

              {/* Account Stats */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <p className="text-2xl font-bold text-primary-600">12</p>
                  <p className="text-sm text-gray-900 dark:text-gray-600">Investments</p>
                </div>
                <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <p className="text-2xl font-bold text-primary-600">4.8</p>
                  <p className="text-sm text-gray-900 dark:text-gray-600">Avg Rating</p>
                </div>
                <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <p className="text-2xl font-bold text-primary-600">87</p>
                  <p className="text-sm text-gray-900 dark:text-gray-600">Connections</p>
                </div>
                <div className="bg-white border border-gray-300 dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <p className="text-2xl font-bold text-primary-600">Gold</p>
                  <p className="text-sm text-gray-900 dark:text-gray-600">Member Tier</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>
      </div>
    </div>
  );
}