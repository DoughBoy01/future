import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, BookOpen } from 'lucide-react';
import BlogCard from '../components/blog/BlogCard';
import { getAllBlogPosts, getAllBlogCategories, searchBlogPosts, BlogPost, BlogCategory } from '../services/blogService';

export default function BlogIndexPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [postsData, categoriesData] = await Promise.all([
        getAllBlogPosts(),
        getAllBlogCategories(),
      ]);
      setPosts(postsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        const results = await searchBlogPosts(query);
        setPosts(results);
      } catch (error) {
        console.error('Error searching posts:', error);
      }
    } else {
      loadData();
    }
  }

  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category?.slug === selectedCategory)
    : posts;

  return (
    <>
      <Helmet>
        <title>Summer Camp Blog - Expert Tips & Guides | FutureEdge</title>
        <meta
          name="description"
          content="Discover expert advice, tips, and guides for choosing the perfect summer camp for your child. Read parent stories, safety tips, and activity ideas."
        />
        <meta name="keywords" content="summer camp blog, parenting tips, camp guides, summer activities, child development" />
        <link rel="canonical" href={window.location.href} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-8 h-8 text-pink-600" />
            <h1 className="text-4xl font-bold text-gray-900">FutureEdge Blog</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expert guides, tips, and stories to help you choose the perfect summer camp experience for your child.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full font-medium transition-colors ${
                selectedCategory === null
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              All Articles
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.slug)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        {/* Blog Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">
              {searchQuery
                ? 'Try a different search term'
                : 'Check back soon for new content!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
