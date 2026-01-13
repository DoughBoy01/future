import {
  TrendingUp,
  CheckCircle,
  Info,
  FileText,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';

interface CampRowDetailsProps {
  camp: any; // Will be typed properly based on CampWithAvailability
  organisation_name?: string;
}

export function CampRowDetails({ camp, organisation_name }: CampRowDetailsProps) {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  // Get quality badge color and text
  const getQualityBadge = (quality: string) => {
    const badges = {
      excellent: { color: 'bg-green-100 text-green-800', text: 'Excellent' },
      good: { color: 'bg-blue-100 text-blue-800', text: 'Good' },
      basic: { color: 'bg-yellow-100 text-yellow-800', text: 'Basic' },
      incomplete: { color: 'bg-red-100 text-red-800', text: 'Incomplete' },
    };
    return badges[quality as keyof typeof badges] || badges.incomplete;
  };

  const qualityBadge = getQualityBadge(camp.content_quality);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Section 1: Quick Stats */}
      <DetailSection title="Quick Stats" icon={TrendingUp}>
        <StatItem label="Enrolled" value={`${camp.enrolled_count || 0} students`} />
        <StatItem label="Price" value={formatCurrency(camp.price)} />
        {camp.early_bird_price && (
          <StatItem
            label="Early Bird"
            value={formatCurrency(camp.early_bird_price)}
          />
        )}
        <StatItem label="Commission" value={`${camp.commission_rate || 0}%`} />
        {camp.review_count > 0 && (
          <StatItem
            label="Reviews"
            value={`${camp.average_rating?.toFixed(1) || '0.0'} ⭐ (${camp.review_count})`}
          />
        )}
      </DetailSection>

      {/* Section 2: Content Quality */}
      <DetailSection title="Content Quality" icon={CheckCircle}>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Completeness</span>
            <span className="text-sm font-medium">
              {camp.content_completeness || 0}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${camp.content_completeness || 0}%` }}
            />
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${qualityBadge.color}`}
            >
              {qualityBadge.text}
            </span>
            {camp.featured && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Featured
              </span>
            )}
          </div>
        </div>
      </DetailSection>

      {/* Section 3: Details */}
      <DetailSection title="Details" icon={Info}>
        <StatItem label="Category" value={camp.category || 'Not specified'} />
        <StatItem label="Location" value={camp.location || 'Not specified'} />
        <StatItem
          label="Age Range"
          value={
            camp.age_min && camp.age_max
              ? `${camp.age_min}-${camp.age_max} years`
              : 'Not specified'
          }
        />
        {camp.grade_min && camp.grade_max && (
          <StatItem label="Grade Range" value={`${camp.grade_min}-${camp.grade_max}`} />
        )}
      </DetailSection>

      {/* Section 4: Policies (conditional) */}
      {(camp.cancellation_policy || camp.refund_policy || camp.requirements) && (
        <DetailSection title="Policies" icon={FileText}>
          {camp.cancellation_policy && (
            <PolicyItem label="Cancellation" content={camp.cancellation_policy} />
          )}
          {camp.refund_policy && (
            <PolicyItem label="Refund" content={camp.refund_policy} />
          )}
          {camp.requirements && (
            <PolicyItem label="Requirements" content={camp.requirements} />
          )}
        </DetailSection>
      )}

      {/* Section 5: Media (conditional) */}
      {(camp.featured_image_url || camp.gallery_urls || camp.video_url) && (
        <DetailSection title="Media" icon={ImageIcon}>
          <div className="space-y-3">
            {camp.featured_image_url && (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-2">Featured Image:</p>
                <img
                  src={camp.featured_image_url}
                  alt={camp.name}
                  className="w-32 h-24 object-cover rounded-lg border border-gray-200"
                />
              </div>
            )}
            {camp.gallery_urls && Array.isArray(camp.gallery_urls) && camp.gallery_urls.length > 0 && (
              <StatItem label="Gallery" value={`${camp.gallery_urls.length} images`} />
            )}
            {camp.video_url && <StatItem label="Video" value="Available" />}
          </div>
        </DetailSection>
      )}

      {/* Section 6: Admin Notes (conditional - only for pending_review) */}
      {camp.status === 'pending_review' &&
        (camp.review_notes || camp.changes_requested || camp.rejection_reason) && (
          <DetailSection
            title="Admin Notes"
            icon={AlertCircle}
            className="lg:col-span-2"
          >
            {camp.review_notes && (
              <PolicyItem label="Review Notes" content={camp.review_notes} />
            )}
            {camp.changes_requested && (
              <PolicyItem label="Changes Requested" content={camp.changes_requested} />
            )}
            {camp.rejection_reason && (
              <PolicyItem label="Rejection Reason" content={camp.rejection_reason} />
            )}
          </DetailSection>
        )}
    </div>
  );
}

// Helper Components
interface DetailSectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}

function DetailSection({ title, icon: Icon, children, className = '' }: DetailSectionProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5 text-gray-400" />
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

interface StatItemProps {
  label: string;
  value: string | number;
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}:</span>
      <span className="text-sm font-medium text-gray-900">{value}</span>
    </div>
  );
}

interface PolicyItemProps {
  label: string;
  content: string;
}

function PolicyItem({ label, content }: PolicyItemProps) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-900 mb-1">{label}:</p>
      <p className="text-sm text-gray-600 line-clamp-3">{content}</p>
    </div>
  );
}
