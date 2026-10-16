import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const BASE_URL = 'https://www.reflecto.com.sa';
const DEFAULT_IMAGE = 'https://www.reflecto.com.sa/assets/photo/logo-dark.png';

/**
 * Reusable SEO Component for helmet management & JSON-LD injection
 */
const SEOHead = ({
  title,
  description,
  canonicalPath = '',
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  schema = null,
  keywords = '',
  noIndex = false,
}) => {
  const { i18n } = useTranslation();
  const currentLang = i18n.language || 'ar';
  const isAr = currentLang === 'ar';

  const cleanPath = canonicalPath ? (canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`) : '';
  const canonicalUrl = `${BASE_URL}${cleanPath}`;
  const arUrl = `${BASE_URL}${cleanPath}`;
  const enUrl = `${BASE_URL}${cleanPath}?lang=en`;

  const siteName = 'Reflecto Premium';
  const defaultTitle = isAr
    ? 'Reflecto Premium | مركز حماية السيارات الفاخرة جدة والرياض'
    : 'Reflecto Premium | Luxury Car Protection Center Jeddah & Riyadh';
  const defaultDesc = isAr
    ? 'مركز ريفليكتو بريميوم لحماية السيارات — أفلام حماية الطلاء PPF، طلاء النانو سيراميك والجرافين، وتظليل النوافذ العازل للحرارة وتصحيح الطلاء مع ضمان حتى 10 سنوات.'
    : 'Reflecto Premium Car Protection Center — PPF self-healing films, Nano Ceramic & Graphene coating, Thermal Insulation Tinting, and Paint Correction with up to 10 years warranty.';

  const pageTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const pageDesc = description || defaultDesc;

  return (
    <Helmet>
      <html lang={currentLang} dir={isAr ? 'rtl' : 'ltr'} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      {keywords && <meta name="keywords" content={keywords} />}
      
      {noIndex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}

      {/* Canonical & Alternate Hreflang */}
      <link rel="canonical" href={canonicalUrl} />
      <link rel="alternate" hrefLang="ar" href={arUrl} />
      <link rel="alternate" hrefLang="en" href={enUrl} />
      <link rel="alternate" hrefLang="x-default" href={arUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content={isAr ? 'ar_SA' : 'en_US'} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD Schema Injection */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;
