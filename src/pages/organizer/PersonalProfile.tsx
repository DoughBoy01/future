import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, User, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { OrganizerDashboardLayout } from '../../components/dashboard/OrganizerDashboardLayout';

interface ProfileFormData {
  first_name: string;
  last_name: string;
  phone: string;
  avatar_url: string;
}

interface ValidationErrors {
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export default function PersonalProfile() {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    first_name: '',
    last_name: '',
    phone: '',
    avatar_url: '',
  });
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    if (!profile) {
      setError('No profile found');
      setLoading(false);
      return;
    }

    setFormData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || '',
      avatar_url: profile.avatar_url || '',
    });
    setLoading(false);
  }, [profile]);

  // Validation functions
  const validateFirstName = (name: string): string | undefined => {
    if (!name.trim()) return 'First name is required';
    if (name.length < 1 || name.length > 50) return 'First name must be 1-50 characters';
    if (!/^[a-zA-Z\s'\-]+$/.test(name)) return 'First name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  };

  const validateLastName = (name: string): string | undefined => {
    if (!name.trim()) return 'Last name is required';
    if (name.length < 1 || name.length > 50) return 'Last name must be 1-50 characters';
    if (!/^[a-zA-Z\s'\-]+$/.test(name)) return 'Last name can only contain letters, spaces, hyphens, and apostrophes';
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone.trim()) return undefined; // Optional field
    // E.164 format: +[country code][number] (max 15 digits total)
    const cleaned = phone.replace(/[\s()\-]/g, '');
    if (!/^\+?[1-9]\d{1,14}$/.test(cleaned)) {
      return 'Please enter a valid phone number (e.g., +1234567890)';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      first_name: validateFirstName(formData.first_name),
      last_name: validateLastName(formData.last_name),
      phone: validatePhone(formData.phone),
    };

    setValidationErrors(errors);
    return !Object.values(errors).some(error => error !== undefined);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      setSaving(false);
      setError('Please fix the validation errors before saving');
      return;
    }

    try {
      const { error: updateError } = await updateProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone || null,
        avatar_url: formData.avatar_url || null,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    setValidationErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleBlur = (field: keyof ProfileFormData) => {
    let error: string | undefined;
    if (field === 'first_name') error = validateFirstName(formData.first_name);
    if (field === 'last_name') error = validateLastName(formData.last_name);
    if (field === 'phone') error = validatePhone(formData.phone);
    setValidationErrors(prev => ({ ...prev, [field]: error }));
  };

  // Avatar initials and color
  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (userId: string): string => {
    const colors = [
      'bg-pink-500', 'bg-blue-500', 'bg-green-500',
      'bg-purple-500', 'bg-yellow-500', 'bg-red-500',
      'bg-indigo-500', 'bg-teal-500'
    ];
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const avatarColor = useMemo(() =>
    user ? getAvatarColor(user.id) : 'bg-gray-500',
    [user]
  );

  const formatRole = (role: string): string => {
    return role.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <OrganizerDashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
        </div>
      </OrganizerDashboardLayout>
    );
  }

  return (
    <OrganizerDashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-2 text-gray-600">
            Manage your personal information and account settings
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">Profile updated successfully!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-pink-600" />
              <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            </div>

            {/* Avatar Section */}
            <div className="mb-6 flex flex-col items-center">
              <div className="mb-4">
                {formData.avatar_url ? (
                  <img
                    src={formData.avatar_url}
                    alt="Avatar"
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg ${avatarColor}`}>
                    {getInitials(formData.first_name || 'U', formData.last_name || 'U')}
                  </div>
                )}
              </div>
              <div className="w-full max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.avatar_url}
                  onChange={(e) => handleChange('avatar_url', e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter a URL to your profile picture (optional)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => handleChange('first_name', e.target.value)}
                  onBlur={() => handleBlur('first_name')}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    validationErrors.first_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.first_name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => handleChange('last_name', e.target.value)}
                  onBlur={() => handleBlur('last_name')}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    validationErrors.last_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.last_name}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="+1234567890"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {validationErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.phone}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  International format recommended (e.g., +1234567890)
                </p>
              </div>
            </div>
          </div>

          {/* Account Information (Read-only) */}
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email Address
                </p>
                <p className="font-medium text-gray-900">{user?.email || 'Not available'}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Contact support to change your email
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Role
                </p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {profile ? formatRole(profile.role) : 'Camp Organizer'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Account Created
                </p>
                <p className="font-medium text-gray-900">{formatDate(profile?.created_at)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">User ID</p>
                <p className="font-mono text-xs text-gray-700 truncate">{user?.id || 'Unknown'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/organizer-dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-500 text-white font-semibold rounded-lg hover:from-pink-700 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </OrganizerDashboardLayout>
  );
}
