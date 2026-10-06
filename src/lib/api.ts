import type { PublicCamp } from '../../shared/camp';
import type { MeDto, OrganisationDto } from '../../shared/me';
import type { Discount, Quote } from '../../shared/pricing';

export type { PublicCamp, MeDto, OrganisationDto };

export interface BookingInput {
  campId: string;
  attendees: { firstName: string; lastName: string; age?: number }[];
  contact?: { name: string; email: string; phone?: string };
  discountCode?: string;
}

export interface BookingSummary {
  id: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'expired' | 'refunded';
  currency: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  paidAt: string | null;
  detailsCompletedAt: string | null;
  createdAt: string;
  contactName: string;
  contactEmail: string;
  camp: { id: string; slug: string; name: string; location: string; startDate: string; endDate: string; image: string | null };
}

export interface Attendee {
  id: string;
  firstName: string;
  lastName: string;
  age: number | null;
  [field: string]: unknown;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    ...init,
    headers: { 'content-type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, body.error ?? res.statusText);
  return body as T;
}

export const api = {
  camps: {
    list: (params: Record<string, string | number | undefined> = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]),
      );
      return request<{ camps: PublicCamp[] }>(`/camps${qs.size ? `?${qs}` : ''}`).then((r) => r.camps);
    },
    get: (idOrSlug: string) => request<{ camp: PublicCamp }>(`/camps/${encodeURIComponent(idOrSlug)}`).then((r) => r.camp),
  },
  config: () => request<{ paymentsEnabled: boolean }>('/config'),
  bookings: {
    quote: (input: { campId: string; quantity: number; discountCode?: string }) =>
      request<Quote & { currency: string; discount: (Discount & { code: string }) | null }>('/bookings/quote', { method: 'POST', body: JSON.stringify(input) }),
    create: (input: BookingInput) =>
      request<{ bookingId: string; url: string | null; free?: boolean }>('/bookings', { method: 'POST', body: JSON.stringify(input) }),
    mine: () => request<{ bookings: BookingSummary[] }>('/bookings').then((r) => r.bookings),
    bySession: (sessionId: string) => request<{ booking: BookingSummary }>(`/bookings/by-session/${encodeURIComponent(sessionId)}`).then((r) => r.booking),
    get: (id: string) => request<{ booking: BookingSummary; attendees: Attendee[] }>(`/bookings/${encodeURIComponent(id)}`),
    saveDetails: (id: string, attendees: Partial<Attendee>[]) =>
      request<{ ok: true }>(`/bookings/${encodeURIComponent(id)}/attendees`, { method: 'PUT', body: JSON.stringify({ attendees }) }),
  },
  me: {
    get: () => request<{ user: MeDto | null; organisation: OrganisationDto | null }>('/me'),
    update: (patch: { name?: string; phone?: string | null; image?: string | null }) =>
      request<{ ok: true }>('/me', { method: 'PATCH', body: JSON.stringify(patch) }),
  },
  organisations: {
    create: (name: string) =>
      request<{ organisation: { id: string; name: string } }>('/organisations', { method: 'POST', body: JSON.stringify({ name }) }),
  },
  enquiries: {
    create: (input: EnquiryInput) => request<{ ok: true }>('/enquiries', { method: 'POST', body: JSON.stringify(input) }),
  },
};

export interface EnquiryInput {
  campId: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export const fromCents = (cents: number) => cents / 100;
export const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
