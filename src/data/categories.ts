/** Presentation metadata for camp categories. `slug` is what `camp.category` stores. */
export interface CampCategory {
  slug: string;
  name: string;
  description: string;
  iconName: string;
  colorTheme: string;
}

export const CAMP_CATEGORIES: CampCategory[] = [
  { slug: 'stem-coding', name: 'STEM & Coding', description: "Build Tomorrow's Innovations", iconName: 'Rocket', colorTheme: 'blue' },
  { slug: 'language-culture', name: 'Language & Culture', description: 'Speak the World', iconName: 'Globe', colorTheme: 'indigo' },
  { slug: 'adventure-outdoor', name: 'Adventure & Outdoor', description: 'Challenge Them', iconName: 'Mountain', colorTheme: 'green' },
  { slug: 'arts-creativity', name: 'Arts & Creativity', description: 'Help them Express themselves', iconName: 'Palette', colorTheme: 'pink' },
  { slug: 'sports-athletics', name: 'Sports & Athletics', description: 'Excel at Play', iconName: 'Trophy', colorTheme: 'orange' },
  { slug: 'leadership', name: 'Leadership', description: 'Lead with Confidence', iconName: 'Target', colorTheme: 'purple' },
  { slug: 'academic-excellence', name: 'Academic Excellence', description: 'Stay Sharp, whilst having Fun', iconName: 'BookOpen', colorTheme: 'teal' },
  { slug: 'heritage-culture', name: 'Heritage & Culture', description: 'Discover Your Roots', iconName: 'Landmark', colorTheme: 'amber' },
];

export const categoryName = (slug: string) => CAMP_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
