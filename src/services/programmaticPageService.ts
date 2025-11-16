import { supabase } from '../lib/supabase';

export interface ProgrammaticPage {
  id: string;
  page_type: 'location' | 'category' | 'age' | 'location_category' | 'location_age' | 'category_age';
  slug: string;
  location: string | null;
  category: string | null;
  age_min: number | null;
  age_max: number | null;
  title: string;
  meta_description: string | null;
  h1_title: string | null;
  intro_content: string | null;
  auto_generated: boolean;
  camp_count: number;
  last_updated: string;
  created_at: string;
}

/**
 * Get programmatic page by slug
 */
export async function getProgrammaticPage(slug: string) {
  const { data, error } = await supabase
    .from('programmatic_pages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching programmatic page:', error);
    return null;
  }

  return data as ProgrammaticPage;
}

/**
 * Get camps for programmatic page based on filters
 */
export async function getCampsForProgrammaticPage(page: ProgrammaticPage) {
  let query = supabase
    .from('camps')
    .select(`
      *,
      organisation:organisations(*)
    `)
    .eq('status', 'published');

  // Apply location filter
  if (page.location) {
    query = query.ilike('location', `%${page.location}%`);
  }

  // Apply category filter
  if (page.category) {
    // Join with camp_category_assignments to filter by category
    query = query.in('id',
      supabase
        .from('camp_category_assignments')
        .select('camp_id')
        .in('category_id',
          supabase
            .from('camp_categories')
            .select('id')
            .eq('slug', page.category)
        )
    );
  }

  // Apply age filter
  if (page.age_min !== null) {
    query = query.lte('age_min', page.age_min);
  }
  if (page.age_max !== null) {
    query = query.gte('age_max', page.age_max);
  }

  query = query.order('created_at', { ascending: false }).limit(50);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching camps for programmatic page:', error);
    return [];
  }

  return data;
}

/**
 * Generate or get programmatic page for a specific filter combination
 */
export async function getOrCreateProgrammaticPage(params: {
  location?: string;
  category?: string;
  ageMin?: number;
  ageMax?: number;
}): Promise<ProgrammaticPage | null> {
  const { location, category, ageMin, ageMax } = params;

  // Determine page type
  let pageType: ProgrammaticPage['page_type'] = 'location';
  if (location && category && (ageMin || ageMax)) {
    // Too complex for now, default to location_category
    pageType = 'location_category';
  } else if (location && category) {
    pageType = 'location_category';
  } else if (location && (ageMin || ageMax)) {
    pageType = 'location_age';
  } else if (category && (ageMin || ageMax)) {
    pageType = 'category_age';
  } else if (location) {
    pageType = 'location';
  } else if (category) {
    pageType = 'category';
  } else if (ageMin || ageMax) {
    pageType = 'age';
  }

  // Generate slug
  const slugParts: string[] = [];
  if (location) slugParts.push(location.toLowerCase().replace(/\s+/g, '-'));
  if (category) slugParts.push(category.toLowerCase().replace(/\s+/g, '-'));
  if (ageMin || ageMax) slugParts.push('ages-' + (ageMin || 'all') + '-to-' + (ageMax || 'all'));
  const slug = slugParts.join('-') + '-summer-camps';

  // Check if page already exists
  const existingPage = await getProgrammaticPage(slug);
  if (existingPage) {
    return existingPage;
  }

  // Generate title and content
  const title = generatePageTitle(params);
  const metaDescription = generateMetaDescription(params);
  const h1Title = generateH1Title(params);
  const introContent = generateIntroContent(params);

  // Count matching camps
  const camps = await getCampsForProgrammaticPage({
    page_type: pageType,
    location,
    category,
    age_min: ageMin ?? null,
    age_max: ageMax ?? null,
  } as any);

  // Create new programmatic page
  const { data, error } = await supabase
    .from('programmatic_pages')
    .insert({
      page_type: pageType,
      slug,
      location,
      category,
      age_min: ageMin ?? null,
      age_max: ageMax ?? null,
      title,
      meta_description: metaDescription,
      h1_title: h1Title,
      intro_content: introContent,
      auto_generated: true,
      camp_count: camps.length,
      last_updated: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating programmatic page:', error);
    return null;
  }

  return data as ProgrammaticPage;
}

/**
 * Helper: Generate page title for SEO
 */
function generatePageTitle(params: {
  location?: string;
  category?: string;
  ageMin?: number;
  ageMax?: number;
}): string {
  const { location, category, ageMin, ageMax } = params;

  let title = '';

  if (category) {
    title += category.charAt(0).toUpperCase() + category.slice(1) + ' ';
  }

  title += 'Summer Camps';

  if (location) {
    title += ' in ' + location;
  }

  if (ageMin || ageMax) {
    const ageRange = ageMin && ageMax ? `Ages ${ageMin}-${ageMax}` :
                     ageMin ? `Ages ${ageMin}+` :
                     ageMax ? `Ages up to ${ageMax}` : '';
    title += ' for ' + ageRange;
  }

  title += ' | FutureEdge';

  return title;
}

/**
 * Helper: Generate meta description
 */
function generateMetaDescription(params: {
  location?: string;
  category?: string;
  ageMin?: number;
  ageMax?: number;
}): string {
  const { location, category, ageMin, ageMax } = params;

  let desc = 'Discover amazing ';

  if (category) {
    desc += category + ' ';
  }

  desc += 'summer camps';

  if (location) {
    desc += ' in ' + location;
  }

  if (ageMin || ageMax) {
    const ageRange = ageMin && ageMax ? `ages ${ageMin}-${ageMax}` :
                     ageMin ? `ages ${ageMin} and up` :
                     ageMax ? `ages up to ${ageMax}` : '';
    desc += ' for children ' + ageRange;
  }

  desc += '. Browse verified camps, read parent reviews, and book with confidence on FutureEdge.';

  return desc;
}

/**
 * Helper: Generate H1 title
 */
function generateH1Title(params: {
  location?: string;
  category?: string;
  ageMin?: number;
  ageMax?: number;
}): string {
  const { location, category, ageMin, ageMax } = params;

  let h1 = 'Best ';

  if (category) {
    h1 += category.charAt(0).toUpperCase() + category.slice(1) + ' ';
  }

  h1 += 'Summer Camps';

  if (location) {
    h1 += ' in ' + location;
  }

  if (ageMin || ageMax) {
    const ageRange = ageMin && ageMax ? `Ages ${ageMin}-${ageMax}` :
                     ageMin ? `Ages ${ageMin}+` :
                     ageMax ? `Up to Age ${ageMax}` : '';
    h1 += ' (' + ageRange + ')';
  }

  return h1;
}

/**
 * Helper: Generate intro content
 */
function generateIntroContent(params: {
  location?: string;
  category?: string;
  ageMin?: number;
  ageMax?: number;
}): string {
  const { location, category, ageMin, ageMax } = params;

  let intro = '<p>Looking for the perfect ';

  if (category) {
    intro += category + ' ';
  }

  intro += 'summer camp';

  if (location) {
    intro += ' in ' + location;
  }

  if (ageMin || ageMax) {
    const ageRange = ageMin && ageMax ? `ages ${ageMin}-${ageMax}` :
                     ageMin ? `ages ${ageMin} and older` :
                     ageMax ? `ages ${ageMax} and younger` : '';
    intro += ' for children ' + ageRange;
  }

  intro += '? You\'re in the right place!</p>';

  intro += '<p>FutureEdge makes it easy to discover, compare, and book ';
  if (category) {
    intro += category + ' ';
  }
  intro += 'summer camps that match your child\'s interests and your family\'s needs. ';
  intro += 'All camps are verified, reviewed by real parents, and backed by our safety guarantee.</p>';

  intro += '<p>Browse our curated selection below and find the perfect summer experience for your child. ';
  intro += 'Book with confidence knowing you\'re choosing from the best camps ';
  if (location) {
    intro += 'in ' + location;
  }
  intro += '.</p>';

  return intro;
}

/**
 * Get all locations from camps for sitemap/navigation
 */
export async function getAllCampLocations(): Promise<string[]> {
  const { data, error } = await supabase
    .from('camps')
    .select('location')
    .eq('status', 'published');

  if (error) {
    console.error('Error fetching locations:', error);
    return [];
  }

  // Extract unique locations
  const locations = [...new Set(data.map(camp => camp.location).filter(Boolean))];
  return locations as string[];
}

/**
 * Get popular location/category combinations for sitemap
 */
export async function getPopularPageCombinations(limit: number = 100) {
  // This would ideally analyze your actual camp data
  // For now, return common combinations
  const locations = await getAllCampLocations();

  const { data: categories } = await supabase
    .from('camp_categories')
    .select('slug, name')
    .eq('active', true);

  const combinations: Array<{location?: string; category?: string}> = [];

  // Location pages
  locations.slice(0, 20).forEach(location => {
    combinations.push({ location });
  });

  // Category pages
  categories?.forEach(category => {
    combinations.push({ category: category.slug });
  });

  // Location + Category combinations (top cities only)
  const topCities = locations.slice(0, 10);
  topCities.forEach(location => {
    categories?.slice(0, 5).forEach(category => {
      combinations.push({ location, category: category.slug });
    });
  });

  return combinations.slice(0, limit);
}
