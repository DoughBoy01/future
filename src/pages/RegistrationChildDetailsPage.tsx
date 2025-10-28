import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { AlertCircle, CheckCircle, User, Heart, Apple, AlertTriangle, Phone, Camera, Save } from 'lucide-react';
import { getRegistration, createOrUpdateRegistrationForm, updateRegistrationFormStatus, getRegistrationForm } from '../services/registrationService';

interface FormData {
  dateOfBirth: string;
  medicalConditions: string;
  allergies: string;
  medications: string;
  dietaryRestrictions: string;
  specialNeeds: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  photoPermission: boolean;
  additionalNotes: string;
}

export function RegistrationChildDetailsPage() {
  const { registrationId } = useParams<{ registrationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [registration, setRegistration] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormData>({
    dateOfBirth: '',
    medicalConditions: '',
    allergies: '',
    medications: '',
    dietaryRestrictions: '',
    specialNeeds: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    photoPermission: false,
    additionalNotes: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadRegistration();
  }, [user, registrationId]);

  async function loadRegistration() {
    try {
      if (!registrationId) {
        setError('Invalid registration ID');
        setLoading(false);
        return;
      }

      const reg = await getRegistration(registrationId);

      if (!reg) {
        setError('Registration not found');
        setLoading(false);
        return;
      }

      setRegistration(reg);

      const existingForm = await getRegistrationForm(registrationId);
      if (existingForm && existingForm.form_data) {
        const savedData = existingForm.form_data as Record<string, any>;
        setFormData({
          dateOfBirth: savedData.dateOfBirth || reg.children.date_of_birth || '',
          medicalConditions: savedData.medicalConditions || '',
          allergies: savedData.allergies || '',
          medications: savedData.medications || '',
          dietaryRestrictions: savedData.dietaryRestrictions || '',
          specialNeeds: savedData.specialNeeds || '',
          emergencyContactName: savedData.emergencyContactName || '',
          emergencyContactPhone: savedData.emergencyContactPhone || '',
          emergencyContactRelationship: savedData.emergencyContactRelationship || '',
          photoPermission: savedData.photoPermission || false,
          additionalNotes: savedData.additionalNotes || '',
        });
      } else {
        setFormData(prev => ({
          ...prev,
          dateOfBirth: reg.children.date_of_birth || '',
        }));
      }
    } catch (err) {
      console.error('Error loading registration:', err);
      setError('Failed to load registration details');
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDraft() {
    if (!registration || !registrationId) return;

    try {
      await createOrUpdateRegistrationForm({
        registrationId: registrationId,
        childId: registration.child_id,
        formData: formData,
        completed: false,
      });
    } catch (err) {
      console.error('Error saving draft:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!registration || !registrationId) return;

    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return;
    }

    if (!formData.emergencyContactName || !formData.emergencyContactPhone) {
      setError('Emergency contact information is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await supabase
        .from('children')
        .update({
          date_of_birth: formData.dateOfBirth,
          medical_conditions: formData.medicalConditions || null,
          allergies: formData.allergies || null,
          medications: formData.medications || null,
          dietary_restrictions: formData.dietaryRestrictions || null,
          special_needs: formData.specialNeeds || null,
          notes: formData.additionalNotes || null,
        })
        .eq('id', registration.child_id);

      await supabase
        .from('parents')
        .update({
          emergency_contact_name: formData.emergencyContactName,
          emergency_contact_phone: formData.emergencyContactPhone,
          emergency_contact_relationship: formData.emergencyContactRelationship || null,
        })
        .eq('id', registration.parent_id);

      await createOrUpdateRegistrationForm({
        registrationId: registrationId,
        childId: registration.child_id,
        formData: formData,
        completed: true,
      });

      await updateRegistrationFormStatus(registrationId, true);

      await supabase
        .from('registrations')
        .update({
          photo_permission: formData.photoPermission,
        })
        .eq('id', registrationId);

      setSuccess(true);

      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const totalSteps = 4;
  const progressPercentage = (currentStep / totalSteps) * 100;

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error && !registration) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Form</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <CheckCircle className="w-20 h-20 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for completing the child information form. You'll receive a confirmation email shortly.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!registration) return null;

  const child = registration.children;
  const camp = registration.camps;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to="/dashboard" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Child Information Form</h1>
            <p className="text-green-100">
              Please provide important health and safety information for {child.first_name}
            </p>
          </div>

          <div className="p-2 bg-gray-200">
            <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>

          <div className="p-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">Important Information</p>
                  <p>This information helps us ensure {child.first_name}'s safety and well-being during {camp.name}. All information is kept confidential.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <Heart className="w-6 h-6 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Basic & Medical Information</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      required
                      max={new Date().toISOString().split('T')[0]}
                      value={formData.dateOfBirth}
                      onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Required to verify age eligibility</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Medical Conditions
                    </label>
                    <textarea
                      value={formData.medicalConditions}
                      onChange={(e) => updateFormData('medicalConditions', e.target.value)}
                      rows={4}
                      placeholder="Please list any medical conditions (asthma, diabetes, etc.)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave blank if none</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Allergies
                    </label>
                    <textarea
                      value={formData.allergies}
                      onChange={(e) => updateFormData('allergies', e.target.value)}
                      rows={3}
                      placeholder="List any allergies (food, medication, environmental, etc.)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave blank if none</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Current Medications
                    </label>
                    <textarea
                      value={formData.medications}
                      onChange={(e) => updateFormData('medications', e.target.value)}
                      rows={3}
                      placeholder="List medications, dosage, and timing (if applicable)"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave blank if none</p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <Apple className="w-6 h-6 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Dietary & Special Needs</h2>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Dietary Restrictions
                    </label>
                    <textarea
                      value={formData.dietaryRestrictions}
                      onChange={(e) => updateFormData('dietaryRestrictions', e.target.value)}
                      rows={3}
                      placeholder="Vegetarian, vegan, gluten-free, kosher, halal, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave blank if none</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Special Needs or Accommodations
                    </label>
                    <textarea
                      value={formData.specialNeeds}
                      onChange={(e) => updateFormData('specialNeeds', e.target.value)}
                      rows={4}
                      placeholder="Any special accommodations or support needed"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-1 text-xs text-gray-500">Leave blank if none</p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <Phone className="w-6 h-6 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Emergency Contact</h2>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-900">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      Emergency contact should be someone other than yourself who can be reached immediately.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Emergency Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emergencyContactName}
                      onChange={(e) => updateFormData('emergencyContactName', e.target.value)}
                      placeholder="Full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Emergency Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.emergencyContactPhone}
                      onChange={(e) => updateFormData('emergencyContactPhone', e.target.value)}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Relationship to Child
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactRelationship}
                      onChange={(e) => updateFormData('emergencyContactRelationship', e.target.value)}
                      placeholder="Grandparent, aunt, uncle, family friend, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <Camera className="w-6 h-6 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Permissions & Additional Notes</h2>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-6">
                    <label className="flex items-start gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.photoPermission}
                        onChange={(e) => updateFormData('photoPermission', e.target.checked)}
                        className="mt-1 h-5 w-5 text-blue-600 rounded"
                      />
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">Photo & Video Permission</div>
                        <p className="text-sm text-gray-600">
                          I give permission for my child to be photographed or recorded on video during camp activities
                          for promotional and educational purposes.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={formData.additionalNotes}
                      onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                      rows={4}
                      placeholder="Any other information we should know about your child"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex gap-3">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(prev => prev - 1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Previous
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <Save className="w-5 h-5" />
                    Save Draft
                  </button>
                </div>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(prev => prev + 1)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Complete Registration'}
                  </button>
                )}
              </div>

              <p className="text-center text-sm text-gray-500">
                Step {currentStep} of {totalSteps} • All information is encrypted and secure
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
