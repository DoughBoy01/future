export type Role = 'parent' | 'organizer' | 'admin';

export interface OrganisationDto {
  id: string;
  slug: string;
  name: string;
  about: string | null;
  logoUrl: string | null;
  website: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  verified: boolean;
  commissionRate: number;
  stripeAccountId: string | null;
  stripeStatus: 'none' | 'pending' | 'active' | 'restricted';
}

export interface MeDto {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  image: string | null;
  role: Role;
  organisationId: string | null;
  createdAt: string;
}
