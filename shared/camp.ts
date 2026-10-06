/** Public camp shape returned by GET /api/camps. Shared by the Worker and the web app. */
export interface PublicCamp {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  location: string;
  address: string | null;
  ageMin: number;
  ageMax: number;
  startDate: string;
  endDate: string;
  priceCents: number;
  earlyBirdCents: number | null;
  earlyBirdDeadline: string | null;
  currency: string;
  capacity: number;
  enrolled: number;
  featured: boolean;
  image: string | null;
  gallery: string[];
  videos: string[];
  highlights: string[];
  amenities: { category: string; items: string[] }[];
  faqs: { question: string; answer: string }[];
  included: string | null;
  notIncluded: string | null;
  whatToBring: string | null;
  requirements: string | null;
  safety: string | null;
  cancellationPolicy: string | null;
  organisation: { id: string; slug: string; name: string; logoUrl: string | null; verified: boolean };
}
