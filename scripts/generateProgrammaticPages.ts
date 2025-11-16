/**
 * Script to generate programmatic SEO landing pages
 *
 * This creates location-based, category-based, and combination pages
 * for maximum SEO coverage
 *
 * Run: npx ts-node scripts/generateProgrammaticPages.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Top US cities for summer camps (prioritize by population and camp demand)
const topLocations = [
  'New York City', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
  'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Boston',
  'Nashville', 'Portland', 'Las Vegas', 'Detroit', 'Memphis',
  'Atlanta', 'Miami', 'Minneapolis', 'Cleveland', 'Tampa'
];

// Popular camp categories
const categories = [
  'stem', 'sports', 'arts', 'outdoor', 'adventure',
  'music', 'theater', 'coding', 'robotics', 'dance',
  'soccer', 'basketball', 'swimming', 'nature'
];

// Age ranges
const ageRanges = [
  { min: 5, max: 8, label: '5-8' },
  { min: 9, max: 12, label: '9-12' },
  { min: 13, max: 17, label: '13-17' },
  { min: 5, max: 12, label: '5-12' },
];

function generateSlug(parts: string[]): string {
  return parts
    .map(p => p.toLowerCase().replace(/\s+/g, '-'))
    .join('-') + '-summer-camps';
}

function generateTitle(location?: string, category?: string, age?: string): string {
  let title = '';

  if (category) {
    title += category.charAt(0).toUpperCase() + category.slice(1) + ' ';
  }

  title += 'Summer Camps';

  if (location) {
    title += ' in ' + location;
  }

  if (age) {
    title += ' for Ages ' + age;
  }

  title += ' | FutureEdge';

  return title;
}

function generateMetaDescription(location?: string, category?: string, age?: string): string {
  let desc = 'Discover amazing ';

  if (category) {
    desc += category + ' ';
  }

  desc += 'summer camps';

  if (location) {
    desc += ' in ' + location;
  }

  if (age) {
    desc += ' for children ages ' + age;
  }

  desc += '. Browse verified camps, read parent reviews, and book with confidence on FutureEdge.';

  return desc;
}

function generateH1(location?: string, category?: string, age?: string): string {
  let h1 = 'Best ';

  if (category) {
    h1 += category.charAt(0).toUpperCase() + category.slice(1) + ' ';
  }

  h1 += 'Summer Camps';

  if (location) {
    h1 += ' in ' + location;
  }

  if (age) {
    h1 += ' (Ages ' + age + ')';
  }

  return h1;
}

function generateIntroContent(location?: string, category?: string, age?: string): string {
  let intro = '<p>Looking for the perfect ';

  if (category) {
    intro += category + ' ';
  }

  intro += 'summer camp';

  if (location) {
    intro += ' in ' + location;
  }

  if (age) {
    intro += ' for children ages ' + age;
  }

  intro += '? You\'re in the right place!</p>';

  intro += '<p>FutureEdge makes it easy to discover, compare, and book ';
  if (category) {
    intro += category + ' ';
  }
  intro += 'summer camps that match your child\'s interests and your family\'s needs. ';
  intro += 'All camps are verified, reviewed by real parents, and backed by our safety guarantee.</p>';

  intro += '<p>Browse our curated selection below and find the perfect summer experience for your child. ';
  intro += 'Book with confidence knowing you\'re choosing from the best camps';
  if (location) {
    intro += ' in ' + location;
  }
  intro += '.</p>';

  return intro;
}

async function generatePages() {
  console.log('🚀 Starting programmatic page generation...\n');

  const pagesToCreate: any[] = [];

  // 1. Location-only pages (30 pages)
  console.log('📍 Generating location pages...');
  topLocations.forEach(location => {
    pagesToCreate.push({
      page_type: 'location',
      slug: generateSlug([location]),
      location,
      category: null,
      age_min: null,
      age_max: null,
      title: generateTitle(location),
      meta_description: generateMetaDescription(location),
      h1_title: generateH1(location),
      intro_content: generateIntroContent(location),
      auto_generated: true,
      camp_count: 0,
    });
  });
  console.log(`✓ Created ${topLocations.length} location pages`);

  // 2. Category-only pages (14 pages)
  console.log('\n📂 Generating category pages...');
  categories.forEach(category => {
    pagesToCreate.push({
      page_type: 'category',
      slug: generateSlug([category]),
      location: null,
      category,
      age_min: null,
      age_max: null,
      title: generateTitle(undefined, category),
      meta_description: generateMetaDescription(undefined, category),
      h1_title: generateH1(undefined, category),
      intro_content: generateIntroContent(undefined, category),
      auto_generated: true,
      camp_count: 0,
    });
  });
  console.log(`✓ Created ${categories.length} category pages`);

  // 3. Location + Category combinations (top 10 cities × top 5 categories = 50 pages)
  console.log('\n🌎 Generating location + category pages...');
  const topCities = topLocations.slice(0, 10);
  const topCategories = categories.slice(0, 5);

  topCities.forEach(location => {
    topCategories.forEach(category => {
      pagesToCreate.push({
        page_type: 'location_category',
        slug: generateSlug([location, category]),
        location,
        category,
        age_min: null,
        age_max: null,
        title: generateTitle(location, category),
        meta_description: generateMetaDescription(location, category),
        h1_title: generateH1(location, category),
        intro_content: generateIntroContent(location, category),
        auto_generated: true,
        camp_count: 0,
      });
    });
  });
  console.log(`✓ Created ${topCities.length * topCategories.length} location + category pages`);

  // 4. Age-based pages (4 pages)
  console.log('\n👶 Generating age-based pages...');
  ageRanges.forEach(range => {
    pagesToCreate.push({
      page_type: 'age',
      slug: generateSlug(['ages', range.label]),
      location: null,
      category: null,
      age_min: range.min,
      age_max: range.max,
      title: generateTitle(undefined, undefined, range.label),
      meta_description: generateMetaDescription(undefined, undefined, range.label),
      h1_title: generateH1(undefined, undefined, range.label),
      intro_content: generateIntroContent(undefined, undefined, range.label),
      auto_generated: true,
      camp_count: 0,
    });
  });
  console.log(`✓ Created ${ageRanges.length} age-based pages`);

  // 5. Category + Age combinations (top 5 categories × 4 age ranges = 20 pages)
  console.log('\n🎯 Generating category + age pages...');
  topCategories.forEach(category => {
    ageRanges.forEach(range => {
      pagesToCreate.push({
        page_type: 'category_age',
        slug: generateSlug([category, 'ages', range.label]),
        location: null,
        category,
        age_min: range.min,
        age_max: range.max,
        title: generateTitle(undefined, category, range.label),
        meta_description: generateMetaDescription(undefined, category, range.label),
        h1_title: generateH1(undefined, category, range.label),
        intro_content: generateIntroContent(undefined, category, range.label),
        auto_generated: true,
        camp_count: 0,
      });
    });
  });
  console.log(`✓ Created ${topCategories.length * ageRanges.length} category + age pages`);

  // Insert all pages
  console.log(`\n💾 Inserting ${pagesToCreate.length} pages into database...`);

  const chunkSize = 100;
  for (let i = 0; i < pagesToCreate.length; i += chunkSize) {
    const chunk = pagesToCreate.slice(i, i + chunkSize);
    const { error } = await supabase
      .from('programmatic_pages')
      .insert(chunk);

    if (error) {
      console.error(`❌ Error inserting chunk ${i / chunkSize + 1}:`, error.message);
    } else {
      console.log(`✓ Inserted pages ${i + 1}-${Math.min(i + chunkSize, pagesToCreate.length)}`);
    }
  }

  console.log('\n✅ Programmatic page generation complete!');
  console.log(`\n📊 Summary:`);
  console.log(`   Total pages created: ${pagesToCreate.length}`);
  console.log(`   - Location pages: ${topLocations.length}`);
  console.log(`   - Category pages: ${categories.length}`);
  console.log(`   - Location + Category: ${topCities.length * topCategories.length}`);
  console.log(`   - Age pages: ${ageRanges.length}`);
  console.log(`   - Category + Age: ${topCategories.length * ageRanges.length}`);

  console.log('\n📝 Sample URLs:');
  console.log(`   /explore/new-york-city-summer-camps`);
  console.log(`   /explore/stem-summer-camps`);
  console.log(`   /explore/new-york-city-stem-summer-camps`);
  console.log(`   /explore/ages-5-8-summer-camps`);
  console.log(`   /explore/coding-ages-9-12-summer-camps`);

  console.log('\n🔍 Next steps:');
  console.log('1. Update camp_count for each page by running actual camp queries');
  console.log('2. Create sitemap including all these pages');
  console.log('3. Submit sitemap to Google Search Console');
  console.log('4. Monitor rankings and traffic in Google Analytics');
}

// Run the script
generatePages();
