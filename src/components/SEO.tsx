import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEO = ({ 
  title = "Finda - AI-Powered Marketplace | Find Products & Services Effortlessly",
  description = "Discover amazing products and services on Finda, the AI-powered marketplace. Find local vendors, compare prices, get AI recommendations, and shop smarter with advanced search and personalized suggestions.",
  keywords = "finda, marketplace, AI marketplace, e-commerce, find products, local vendors, AI recommendations, online shopping, product search, service finder, finda-ai",
  image = "/og-image.png",
  url = "https://finda.ai",
  type = "website"
}: SEOProps) => {
  const fullTitle = title.includes('Finda') ? title : `${title} | Finda`;
  const fullUrl = url.startsWith('http') ? url : `https://finda.ai${url}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Finda Team" />
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Finda" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO */}
      <link rel="canonical" href={fullUrl} />
      <meta name="theme-color" content="#2563eb" />
      
      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Finda",
          "description": description,
          "url": "https://finda.ai",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://finda.ai/listings?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
