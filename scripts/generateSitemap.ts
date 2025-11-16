/**
 * Sitemap Generator for SEO
 *
 * Generates an XML sitemap including all:
 * - Static pages (home, camps, partners, etc.)
 * - Dynamic camp detail pages
 * - Blog posts
 * - Programmatic landing pages
 *
 * Run: npx ts-node scripts/generateSitemap.ts
 * Output: public/sitemap.xml
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const DOMAIN = 'https://futureedge.com'; // Update with your actual domain
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

function generateUrlEntry(url: SitemapUrl): string {
  let entry = '  <url>\n';
  entry += `    <loc>${url.loc}</loc>\n`;
  if (url.lastmod) {
    entry += `    <lastmod>${url.lastmod}</lastmod>\n`;
  }
  if (url.changefreq) {
    entry += `    <changefreq>${url.changefreq}</changefreq>\n`;
  }
  if (url.priority !== undefined) {
    entry += `    <priority>${url.priority.toFixed(1)}</priority>\n`;
  }
  entry += '  </url>\n';
  return entry;
}

async function generateSitemap() {
  console.log('🗺️  Generating sitemap...\n');

  const urls: SitemapUrl[] = [];
  const today = new Date().toISOString().split('T')[0];

  // 1. Static pages
  console.log('📄 Adding static pages...');
  const staticPages = [
    { path: '/', priority: 1.0, changefreq: 'daily' as const },
    { path: '/camps', priority: 0.9, changefreq: 'daily' as const },
    { path: '/partners', priority: 0.7, changefreq: 'monthly' as const },
    { path: '/talk-to-advisor', priority: 0.6, changefreq: 'monthly' as const },
    { path: '/blog', priority: 0.8, changefreq: 'weekly' as const },
  ];

  staticPages.forEach(page => {
    urls.push({
      loc: `${DOMAIN}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  });
  console.log(`✓ Added ${staticPages.length} static pages`);

  // 2. Camp detail pages
  console.log('\n🏕️  Adding camp detail pages...');
  const { data: camps, error: campsError } = await supabase
    .from('camps')
    .select('id, updated_at')
    .eq('status', 'published');

  if (campsError) {
    console.error('❌ Error fetching camps:', campsError.message);
  } else if (camps) {
    camps.forEach(camp => {
      urls.push({
        loc: `${DOMAIN}/camps/${camp.id}`,
        lastmod: camp.updated_at ? camp.updated_at.split('T')[0] : today,
        changefreq: 'weekly',
        priority: 0.8,
      });
    });
    console.log(`✓ Added ${camps.length} camp detail pages`);
  }

  // 3. Blog posts
  console.log('\n📝 Adding blog posts...');
  const { data: posts, error: postsError } = await supabase
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (postsError) {
    console.error('❌ Error fetching blog posts:', postsError.message);
  } else if (posts) {
    posts.forEach(post => {
      urls.push({
        loc: `${DOMAIN}/blog/${post.slug}`,
        lastmod: post.updated_at ? post.updated_at.split('T')[0] : today,
        changefreq: 'monthly',
        priority: 0.7,
      });
    });
    console.log(`✓ Added ${posts.length} blog post pages`);
  }

  // 4. Programmatic landing pages
  console.log('\n🌍 Adding programmatic landing pages...');
  const { data: programmaticPages, error: pagesError } = await supabase
    .from('programmatic_pages')
    .select('slug, last_updated, page_type')
    .order('page_type', { ascending: true });

  if (pagesError) {
    console.error('❌ Error fetching programmatic pages:', pagesError.message);
  } else if (programmaticPages) {
    programmaticPages.forEach(page => {
      // Priority based on page type
      let priority = 0.6;
      if (page.page_type === 'location') priority = 0.8;
      if (page.page_type === 'category') priority = 0.7;
      if (page.page_type === 'location_category') priority = 0.75;

      urls.push({
        loc: `${DOMAIN}/explore/${page.slug}`,
        lastmod: page.last_updated ? page.last_updated.split('T')[0] : today,
        changefreq: 'weekly',
        priority,
      });
    });
    console.log(`✓ Added ${programmaticPages.length} programmatic landing pages`);
  }

  // Generate XML
  console.log('\n📝 Generating XML...');
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  urls.forEach(url => {
    xml += generateUrlEntry(url);
  });

  xml += '</urlset>';

  // Write to file
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf8');

  console.log('\n✅ Sitemap generated successfully!');
  console.log(`\n📊 Summary:`);
  console.log(`   Total URLs: ${urls.length}`);
  console.log(`   Static pages: ${staticPages.length}`);
  console.log(`   Camp pages: ${camps?.length || 0}`);
  console.log(`   Blog posts: ${posts?.length || 0}`);
  console.log(`   Programmatic pages: ${programmaticPages?.length || 0}`);
  console.log(`\n📁 Output: ${OUTPUT_PATH}`);
  console.log(`\n🔍 Next steps:`);
  console.log('1. Deploy sitemap to production (ensure it\'s accessible at /sitemap.xml)');
  console.log('2. Submit to Google Search Console: https://search.google.com/search-console');
  console.log('3. Submit to Bing Webmaster Tools: https://www.bing.com/webmasters');
  console.log('4. Add sitemap URL to robots.txt:');
  console.log(`   Sitemap: ${DOMAIN}/sitemap.xml`);
  console.log('5. Re-run this script monthly or after adding new content');
}

// Run the script
generateSitemap();
