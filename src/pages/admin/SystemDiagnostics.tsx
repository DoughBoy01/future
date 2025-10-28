import { useState, useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  Video,
  Image as ImageIcon,
  HardDrive,
  Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { validateVideoUrl } from '../../utils/videoValidation';

interface BucketInfo {
  id: string;
  name: string;
  public: boolean;
  file_size_limit: number;
  allowed_mime_types: string[];
  exists: boolean;
  fileCount?: number;
  error?: string;
}

interface DiagnosticResult {
  category: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export function SystemDiagnostics() {
  const [loading, setLoading] = useState(true);
  const [buckets, setBuckets] = useState<BucketInfo[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [testVideoUrl, setTestVideoUrl] = useState('');
  const [videoTestResult, setVideoTestResult] = useState<any>(null);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    const results: DiagnosticResult[] = [];

    try {
      const { data: bucketsData, error: bucketsError } = await supabase.storage.listBuckets();

      if (bucketsError) {
        results.push({
          category: 'Storage Buckets',
          status: 'error',
          message: 'Failed to fetch storage buckets',
          details: bucketsError.message,
        });
      } else {
        const requiredBuckets = ['camp-images', 'camp-videos'];
        const foundBuckets: BucketInfo[] = [];

        for (const bucketName of requiredBuckets) {
          const bucket = bucketsData?.find(b => b.name === bucketName);
          if (bucket) {
            try {
              const { data: files } = await supabase.storage.from(bucketName).list('', { limit: 100 });
              foundBuckets.push({
                id: bucket.id,
                name: bucket.name,
                public: bucket.public || false,
                file_size_limit: (bucket as any).file_size_limit || 0,
                allowed_mime_types: (bucket as any).allowed_mime_types || [],
                exists: true,
                fileCount: files?.length || 0,
              });

              results.push({
                category: 'Storage Buckets',
                status: 'success',
                message: `Bucket '${bucketName}' is configured correctly`,
                details: `Found ${files?.length || 0} files`,
              });
            } catch (err: any) {
              foundBuckets.push({
                id: bucketName,
                name: bucketName,
                public: false,
                file_size_limit: 0,
                allowed_mime_types: [],
                exists: false,
                error: err.message,
              });

              results.push({
                category: 'Storage Buckets',
                status: 'error',
                message: `Failed to access bucket '${bucketName}'`,
                details: err.message,
              });
            }
          } else {
            foundBuckets.push({
              id: bucketName,
              name: bucketName,
              public: false,
              file_size_limit: 0,
              allowed_mime_types: [],
              exists: false,
            });

            results.push({
              category: 'Storage Buckets',
              status: 'error',
              message: `Bucket '${bucketName}' does not exist`,
              details: 'This bucket needs to be created',
            });
          }
        }

        setBuckets(foundBuckets);
      }

      const { data: dbTest, error: dbError } = await supabase
        .from('camps')
        .select('id')
        .limit(1);

      if (dbError) {
        results.push({
          category: 'Database Connection',
          status: 'error',
          message: 'Database connection failed',
          details: dbError.message,
        });
      } else {
        results.push({
          category: 'Database Connection',
          status: 'success',
          message: 'Database connection is working',
        });
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        results.push({
          category: 'Authentication',
          status: 'success',
          message: 'User authenticated successfully',
          details: user.email || 'No email',
        });
      } else {
        results.push({
          category: 'Authentication',
          status: 'warning',
          message: 'No user currently authenticated',
        });
      }

    } catch (error: any) {
      results.push({
        category: 'System',
        status: 'error',
        message: 'Unexpected error during diagnostics',
        details: error.message,
      });
    }

    setDiagnostics(results);
    setLoading(false);
  };

  const testVideoUrlValidation = () => {
    const result = validateVideoUrl(testVideoUrl);
    setVideoTestResult(result);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const StatusIcon = ({ status }: { status: 'success' | 'warning' | 'error' }) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Diagnostics</h1>
            <p className="text-gray-600 mt-1">Check system health and troubleshoot issues</p>
          </div>
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HardDrive className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Storage Buckets</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{buckets.filter(b => b.exists).length}/2</p>
            <p className="text-sm text-gray-600 mt-1">Buckets configured</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">System Status</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {diagnostics.filter(d => d.status === 'success').length}/{diagnostics.length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Checks passed</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Total Files</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {buckets.reduce((sum, b) => sum + (b.fileCount || 0), 0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Across all buckets</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Storage Buckets</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {buckets.map((bucket) => (
              <div key={bucket.name} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    {bucket.name === 'camp-images' ? (
                      <ImageIcon className="w-6 h-6 text-gray-600" />
                    ) : (
                      <Video className="w-6 h-6 text-gray-600" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{bucket.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {bucket.exists ? (
                          <>Public: {bucket.public ? 'Yes' : 'No'} | Size Limit: {formatFileSize(bucket.file_size_limit)}</>
                        ) : (
                          'Not configured'
                        )}
                      </p>
                    </div>
                  </div>
                  {bucket.exists ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                {bucket.exists && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Files:</span> {bucket.fileCount || 0}
                    </p>
                    {bucket.allowed_mime_types.length > 0 && (
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Allowed types:</span> {bucket.allowed_mime_types.join(', ')}
                      </p>
                    )}
                  </div>
                )}
                {bucket.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{bucket.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Diagnostic Results</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {diagnostics.map((result, index) => (
              <div key={index} className="p-6">
                <div className="flex items-start gap-3">
                  <StatusIcon status={result.status} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">{result.category}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          result.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : result.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{result.message}</p>
                    {result.details && (
                      <p className="text-xs text-gray-600 mt-2 font-mono bg-gray-50 p-2 rounded">
                        {result.details}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Video URL Validator</h2>
            <p className="text-sm text-gray-600 mt-1">Test if a video URL is valid before adding it to camps</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={testVideoUrl}
                onChange={(e) => setTestVideoUrl(e.target.value)}
                placeholder="Enter YouTube, Vimeo, or direct video URL..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={testVideoUrlValidation}
                disabled={!testVideoUrl.trim()}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Test URL
              </button>
            </div>

            {videoTestResult && (
              <div
                className={`p-4 rounded-lg border ${
                  videoTestResult.isValid
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {videoTestResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${videoTestResult.isValid ? 'text-green-900' : 'text-red-900'}`}>
                      {videoTestResult.isValid ? 'Valid video URL' : 'Invalid video URL'}
                    </p>
                    {videoTestResult.isValid && (
                      <>
                        <p className="text-sm text-gray-700 mt-1">
                          Type: <span className="font-medium">{videoTestResult.videoType}</span>
                        </p>
                        {videoTestResult.videoId && (
                          <p className="text-sm text-gray-700">
                            Video ID: <span className="font-mono text-xs">{videoTestResult.videoId}</span>
                          </p>
                        )}
                        {videoTestResult.embedUrl && (
                          <p className="text-xs text-gray-600 mt-2 font-mono bg-white p-2 rounded border border-gray-200">
                            {videoTestResult.embedUrl}
                          </p>
                        )}
                      </>
                    )}
                    {videoTestResult.errorMessage && (
                      <p className="text-sm text-red-800 mt-1">{videoTestResult.errorMessage}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
