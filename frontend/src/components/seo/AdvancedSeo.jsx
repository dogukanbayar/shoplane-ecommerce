import { Helmet } from 'react-helmet-async'

function AdvancedSeo({
  title = 'MyShop - Türkiye\'nin En İyi Online Alışveriş Sitesi',
  description = 'MyShop\'ta binlerce ürün arasından seçim yapın. Elektronik, giyim, kozmetik ve daha fazlası. Ücretsiz kargo, hızlı teslimat, güvenli ödeme. Türkiye\'nin en güvenilir e-ticaret platformu.',
  keywords = 'online alışveriş, e-ticaret, elektronik, giyim, ayakkabı, kozmetik, ev dekorasyon, spor, indirim, kampanya, ücretsiz kargo',
  image = 'https://myshop.com/og-image.jpg',
  url = window.location.href,
  type = 'website',
  product,
  breadcrumbs,
  article,
  faq
}) {
  // Canonical URL
  const canonicalUrl = url.split('?')[0]

  // Structured Data
  const structuredData = []

  // 1. Organization Schema
  structuredData.push({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MyShop',
    url: 'https://myshop.com',
    logo: 'https://myshop.com/logo.png',
    sameAs: [
      'https://facebook.com/myshop',
      'https://twitter.com/myshop',
      'https://instagram.com/myshop',
      'https://linkedin.com/company/myshop'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-555-123-4567',
      contactType: 'Customer Service',
      areaServed: 'TR',
      availableLanguage: 'Turkish'
    }
  })

  // 2. Website Schema
  structuredData.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MyShop',
    url: 'https://myshop.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://myshop.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  })

  // 3. Product Schema (Ürün sayfası için)
  if (product) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      image: product.images,
      description: product.description,
      brand: {
        '@type': 'Brand',
        name: product.brand
      },
      offers: {
        '@type': 'Offer',
        url: url,
        priceCurrency: 'TRY',
        price: product.price,
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        itemCondition: 'https://schema.org/NewCondition',
        availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        seller: {
          '@type': 'Organization',
          name: 'MyShop'
        }
      },
      aggregateRating: product.rating ? {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.numReviews,
        bestRating: 5,
        worstRating: 1
      } : undefined
    })
  }

  // 4. Breadcrumb Schema
  if (breadcrumbs) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url
      }))
    })
  }

  // 5. Article Schema (Blog için)
  if (article) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      image: article.image,
      datePublished: article.datePublished,
      dateModified: article.dateModified,
      author: {
        '@type': 'Person',
        name: article.author
      },
      publisher: {
        '@type': 'Organization',
        name: 'MyShop',
        logo: {
          '@type': 'ImageObject',
          url: 'https://myshop.com/logo.png'
        }
      }
    })
  }

  // 6. FAQ Schema
  if (faq && faq.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer
        }
      }))
    })
  }

  // 7. Local Business Schema
  structuredData.push({
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://myshop.com',
    name: 'MyShop',
    image: 'https://myshop.com/logo.png',
    telephone: '+90-555-123-4567',
    email: 'info@myshop.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Atatürk Bulvarı No:123',
      addressLocality: 'Kadıköy',
      addressRegion: 'Istanbul',
      postalCode: '34710',
      addressCountry: 'TR'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 40.9917,
      longitude: 29.0229
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '00:00',
      closes: '23:59'
    },
    priceRange: '₺₺'
  })

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="MyShop" />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@myshop" />

      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="bingbot" content="index, follow" />
      <meta name="author" content="MyShop" />
      <meta name="publisher" content="MyShop" />
      <meta name="language" content="Turkish" />
      <meta name="revisit-after" content="1 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />

      {/* Mobile Optimization */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="MyShop" />

      {/* Geo Tags */}
      <meta name="geo.region" content="TR" />
      <meta name="geo.placename" content="Istanbul" />
      <meta name="geo.position" content="40.9917;29.0229" />
      <meta name="ICBM" content="40.9917, 29.0229" />

      {/* Business Info */}
      <meta name="contact" content="info@myshop.com" />
      <meta name="copyright" content="MyShop © 2026" />

      {/* Alternate Languages (Gelecek için) */}
      <link rel="alternate" hrefLang="tr" href={url} />
      <link rel="alternate" hrefLang="en" href={url.replace('/tr/', '/en/')} />
      <link rel="alternate" hrefLang="x-default" href={url} />

      {/* Structured Data (JSON-LD) */}
      {structuredData.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}

      {/* Preconnect to External Domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
    </Helmet>
  )
}

export default AdvancedSeo