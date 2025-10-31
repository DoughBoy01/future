/**
 * Verification and quality tier types for camp organizers
 */

export type VerificationLevel = 'unverified' | 'verified' | 'premium' | 'elite';

export type QualityTier = 'basic' | 'verified' | 'premium' | 'elite';

export interface VerificationBadge {
  level: VerificationLevel;
  verifiedDate?: string;
  certificationsCount?: number;
  backgroundCheckDate?: string;
}

export interface QualityIndicators {
  tier: QualityTier;
  responseRate: number; // 0-100
  responseTimeHours: number;
  bookingSuccessRate: number; // 0-100
  repeatBookingRate: number; // 0-100
  yearsOnPlatform: number;
  totalCampersServed: number;
  cancellationRate: number; // 0-100
}

export interface SafetyStandard {
  id: string;
  name: string;
  description: string;
  required: boolean;
  icon?: string;
}

export const SAFETY_STANDARDS: SafetyStandard[] = [
  {
    id: 'background-check',
    name: 'Background Checks',
    description: 'All staff undergo comprehensive background screening',
    required: true,
  },
  {
    id: 'first-aid',
    name: 'First Aid Certified',
    description: 'Staff certified in First Aid and CPR',
    required: true,
  },
  {
    id: 'insurance',
    name: 'Liability Insurance',
    description: 'Comprehensive liability insurance coverage',
    required: true,
  },
  {
    id: 'emergency-protocols',
    name: 'Emergency Protocols',
    description: 'Documented emergency response procedures',
    required: true,
  },
  {
    id: 'medical-staff',
    name: 'Medical Staff',
    description: 'Licensed medical professional on-site',
    required: false,
  },
  {
    id: 'accreditation',
    name: 'Industry Accreditation',
    description: 'Accredited by recognized camping associations',
    required: false,
  },
];

export const VERIFICATION_LEVELS: Record<VerificationLevel, { label: string; color: string; description: string }> = {
  unverified: {
    label: 'Unverified',
    color: 'grey',
    description: 'Basic listing, not yet verified by FutureEdge',
  },
  verified: {
    label: 'Verified',
    color: 'green',
    description: 'Identity and credentials verified by FutureEdge',
  },
  premium: {
    label: 'Premium',
    color: 'blue',
    description: 'Verified with excellent track record and safety standards',
  },
  elite: {
    label: 'Elite',
    color: 'gold',
    description: 'Top-tier organizer with outstanding reputation and services',
  },
};
