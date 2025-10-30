import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

interface SocialMetaProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  price?: string;
  location?: string;
  dates?: string;
}

export function SocialMeta({
  title,
  description,
  image,
  url,
  type = 'website',
  price,
  location,
  dates,
}: SocialMetaProps) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const siteTitle = 'FutureEdge Camps';
  const fullTitle = `${title} | ${siteTitle}`;

  // Default image if none provided
  const defaultImage = '/logo.png';
  const socialImage = image || defaultImage;

  // Ensure image URL is absolute
  const absoluteImageUrl = socialImage.startsWith('http')
    ? socialImage
    : `${window.location.origin}${socialImage}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={siteTitle} />

      {/* Additional structured data for camps */}
      {price && <meta property="og:price:amount" content={price} />}
      {location && <meta property="og:location" content={location} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteImageUrl} />

      {/* Additional Meta for Mobile Apps */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content={siteTitle} />
    </Helmet>
  );
}
