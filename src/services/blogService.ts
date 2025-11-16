import { supabase } from '../lib/supabase';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  author_id: string | null;
  category_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  canonical_url: string | null;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
  author?: BlogAuthor;
  category?: BlogCategory;
  tags?: BlogTag[];
}

export interface BlogAuthor {
  id: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  active: boolean;
  display_order: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
}

/**
 * Get all published blog posts
 */
export async function getAllBlogPosts(limit?: number) {
  const query = supabase
    .from('blog_posts')
    .select(`
      *,
      author:blog_authors(*),
      category:blog_categories(*)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching blog posts:', error);
    throw error;
  }

  return data as BlogPost[];
}

/**
 * Get a single blog post by slug
 */
export async function getBlogPostBySlug(slug: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:blog_authors(*),
      category:blog_categories(*),
      tags:blog_post_tags(tag:blog_tags(*))
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error) {
    console.error('Error fetching blog post:', error);
    throw error;
  }

  // Increment view count
  if (data) {
    await supabase
      .from('blog_posts')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id);
  }

  return data as BlogPost;
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(categorySlug: string, limit?: number) {
  const query = supabase
    .from('blog_posts')
    .select(`
      *,
      author:blog_authors(*),
      category:blog_categories!inner(*)
    `)
    .eq('status', 'published')
    .eq('category.slug', categorySlug)
    .order('published_at', { ascending: false });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts by category:', error);
    throw error;
  }

  return data as BlogPost[];
}

/**
 * Get all blog categories
 */
export async function getAllBlogCategories() {
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .eq('active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching blog categories:', error);
    throw error;
  }

  return data as BlogCategory[];
}

/**
 * Get related blog posts (same category, exclude current post)
 */
export async function getRelatedBlogPosts(postId: string, categoryId: string | null, limit: number = 3) {
  if (!categoryId) {
    return [];
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:blog_authors(*),
      category:blog_categories(*)
    `)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }

  return data as BlogPost[];
}

/**
 * Search blog posts
 */
export async function searchBlogPosts(query: string) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      author:blog_authors(*),
      category:blog_categories(*)
    `)
    .eq('status', 'published')
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order('published_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error searching posts:', error);
    throw error;
  }

  return data as BlogPost[];
}
