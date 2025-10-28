import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { ImageUpload } from '../../components/common/ImageUpload';
import { supabase } from '../../lib/supabase';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export function SiteSettings() {
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'site_logo')
        .maybeSingle();

      if (error) throw error;

      if (data?.value && typeof data.value === 'object') {
        const logoData = data.value as { url?: string | null };
        setLogoUrl(logoData.url || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('site_settings')
        .update({
          value: { url: logoUrl || null, alt: 'FutureEdge' },
          updated_by: currentUser.user.id,
          updated_at: new Date().toISOString(),
        })
        .eq('key', 'site_logo');

      if (error) throw error;

      showMessage('success', 'Settings saved successfully');

      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error saving settings:', error);
      showMessage('error', error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Site Settings</h1>
          <p className="text-gray-600">Manage global site configuration and branding</p>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Site Logo</h2>
              <p className="text-sm text-gray-600 mb-6">
                Upload your site logo. This will be displayed in the header navigation. Recommended size: 200x60px (PNG or SVG for best quality)
              </p>

              <ImageUpload
                currentImageUrl={logoUrl}
                onUploadComplete={(url) => setLogoUrl(url)}
                onUploadError={(error) => showMessage('error', error)}
                bucketName="logos"
                folderPath="site"
                maxSizeMB={5}
                previewHeight="h-48"
                label="Site Logo"
              />
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => window.location.reload()}
                  disabled={saving}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Tips for best results:</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Use a transparent background (PNG or SVG) for a professional look</li>
            <li>Ensure your logo has good contrast against a white background</li>
            <li>Test your logo at different screen sizes after uploading</li>
            <li>Keep file size under 500KB for optimal loading performance</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
