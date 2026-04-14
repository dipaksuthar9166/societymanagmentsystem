import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, name, type, url, keywords, schemaMarkup }) => {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      {keywords && <meta name='keywords' content={keywords} />}
      <link rel="canonical" href={url || window.location.href} />
      {/* End standard metadata tags */}

      {/* Open Graph Tags (Facebook, LinkedIn, etc.) */}
      <meta property='og:type' content={type || 'website'} />
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta property='og:url' content={url || window.location.href} />
      <meta property='og:site_name' content="Guru Kripa" />
      {/* End Facebook tags */}

      {/* Twitter tags */}
      <meta name='twitter:creator' content={name || 'Guru Kripa Tech'} />
      <meta name='twitter:card' content={type || 'summary_large_image'} />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      {/* End Twitter tags */}

      {/* JSON-LD Schema Markup */}
      {schemaMarkup && (
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
