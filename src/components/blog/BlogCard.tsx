import { Link } from 'react-router-dom';
import { Calendar, User, Tag } from 'lucide-react';
import { BlogPost } from '../../services/blogService';

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200"
    >
      {/* Featured Image */}
      {post.featured_image && (
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category */}
        {post.category && (
          <div className="flex items-center gap-1 text-sm text-pink-600 font-medium mb-2">
            <Tag className="w-4 h-4" />
            <span>{post.category.name}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-pink-600 transition-colors mb-2 line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          {post.author && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{post.author.name}</span>
            </div>
          )}
          {formattedDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
