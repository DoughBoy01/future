import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, User, Tag, ArrowLeft, Share2 } from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';
import SocialMeta from '../components/seo/SocialMeta';
import { getBlogPostBySlug, getRelatedBlogPosts, BlogPost } from '../services/blogService';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  async function loadPost(slug: string) {
    setLoading(true);
    setError(false);
    try {
      const postData = await getBlogPostBySlug(slug);
      setPost(postData);

      // Load related posts
      if (postData?.category_id) {
        const related = await getRelatedBlogPosts(
          postData.id,
          postData.category_id,
          3
        );
        setRelatedPosts(related);
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-8">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
      </div>
    );
  }

  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const seoTitle = post.seo_title || post.title;
  const seoDescription = post.seo_description || post.excerpt || '';

  // Structured data for blog post
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.featured_image || '',
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author?.name || 'FutureEdge Team',
    },
    publisher: {
      '@type': 'Organization',
      name: 'FutureEdge',
      logo: {
        '@type': 'ImageObject',
        url: 'https://futureedge.com/logo.png', // Update with your logo URL
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': window.location.href,
    },
  };

  // Breadcrumb structured data
  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: window.location.origin,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${window.location.origin}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: window.location.href,
      },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{seoTitle} | FutureEdge Blog</title>
        <meta name="description" content={seoDescription} />
        {post.seo_keywords && <meta name="keywords" content={post.seo_keywords} />}
        <link rel="canonical" href={post.canonical_url || window.location.href} />
        <meta name="author" content={post.author?.name || 'FutureEdge Team'} />
        <meta name="robots" content="index, follow" />

        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbData)}
        </script>
      </Helmet>

      <SocialMeta
        title={seoTitle}
        description={seoDescription}
        image={post.featured_image || undefined}
        type="article"
        url={window.location.href}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back to Blog */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Featured Image */}
          {post.featured_image && (
            <div className="aspect-[21/9] overflow-hidden bg-gray-100">
              <img
                src={post.featured_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div className="p-8 lg:p-12">
            {/* Category */}
            {post.category && (
              <div className="flex items-center gap-1 text-sm text-pink-600 font-medium mb-4">
                <Tag className="w-4 h-4" />
                <Link
                  to={`/blog?category=${post.category.slug}`}
                  className="hover:underline"
                >
                  {post.category.name}
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b border-gray-200">
              {post.author && (
                <div className="flex items-center gap-2">
                  {post.author.avatar_url && (
                    <img
                      src={post.author.avatar_url}
                      alt={post.author.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <div className="flex items-center gap-1 text-sm">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{post.author.name}</span>
                    </div>
                  </div>
                </div>
              )}
              {formattedDate && (
                <div className="flex items-center gap-1 text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>{formattedDate}</span>
                </div>
              )}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: post.title,
                      text: post.excerpt || '',
                      url: window.location.href,
                    });
                  }
                }}
                className="flex items-center gap-1 text-sm hover:text-pink-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            {/* Article Body */}
            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-pink-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* Author Bio */}
            {post.author?.bio && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex gap-4">
                  {post.author.avatar_url && (
                    <img
                      src={post.author.avatar_url}
                      alt={post.author.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      About {post.author.name}
                    </h3>
                    <p className="text-gray-600">{post.author.bio}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <BlogCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
