/**
 * Dynamic SEO & Metadata Manager Module
 * Handles dynamic title, meta description, Open Graph tags, and Schema.org TouristAttraction JSON-LD injection.
 */
const SeoComponent = (() => {

  const defaultTitle = 'Digital Heritage Explorer — Gujarat Heritage Tourism';
  const defaultDesc = 'Discover local historical monuments, stepwells, sun temples, and ancient ruins in Gujarat with interactive maps, 3D views, audio guides, and offline support.';
  const defaultImage = 'images/rani-ki-vav/1.webp';

  /**
   * Update page metadata, Open Graph, and JSON-LD schema for a specific site or reset to default.
   * @param {Object|null} site - Heritage site object or null for default homepage.
   */
  function updateMetadata(site) {
    if (site) {
      const getSiteText = (s, f) => window.I18nComponent ? I18nComponent.getSiteText(s, f) : s[f];
      const name = getSiteText(site, 'name');
      const city = getSiteText(site, 'city');
      const summary = getSiteText(site, 'summary') || site.description;

      const pageTitle = `${name}, ${city} — Digital Heritage Explorer`;
      const pageDesc = `${summary} Explore period, visiting hours, audio guide, 3D model, and directions.`;

      setMetaTitle(pageTitle);
      setMetaTag('description', pageDesc);

      // Open Graph Tags
      setOgTag('og:title', pageTitle);
      setOgTag('og:description', pageDesc);
      setOgTag('og:image', getAbsoluteUrl(site.cover));
      setOgTag('og:url', window.location.href);

      // JSON-LD TouristAttraction Schema
      injectJsonLdSchema(site);
    } else {
      setMetaTitle(defaultTitle);
      setMetaTag('description', defaultDesc);
      setOgTag('og:title', defaultTitle);
      setOgTag('og:description', defaultDesc);
      setOgTag('og:image', getAbsoluteUrl(defaultImage));
      setOgTag('og:url', window.location.origin + window.location.pathname);
      removeJsonLdSchema();
    }
  }

  function setMetaTitle(titleStr) {
    document.title = titleStr;
  }

  function setMetaTag(name, content) {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function setOgTag(property, content) {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function getAbsoluteUrl(relativeUrl) {
    if (!relativeUrl) return window.location.href;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return new URL(relativeUrl, window.location.href).href;
  }

  function injectJsonLdSchema(site) {
    removeJsonLdSchema();

    const isFree = site.entryFee ? (site.entryFee.toLowerCase().includes('free') && !site.entryFee.toLowerCase().includes('foreign')) : true;

    const schemaData = {
      "@context": "https://schema.org",
      "@type": "TouristAttraction",
      "name": site.name,
      "alternateName": site.name_gu || site.name_hi,
      "description": site.description || site.summary,
      "image": getAbsoluteUrl(site.cover),
      "touristType": [site.category, "Heritage Site", "Historical Monument"],
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": site.lat,
        "longitude": site.lng
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": site.city,
        "addressRegion": "Gujarat",
        "addressCountry": "IN"
      },
      "isAccessibleForFree": isFree
    };

    if (site.officialUrl) {
      schemaData.sameAs = site.officialUrl;
    }

    const script = document.createElement('script');
    script.id = 'json-ld-tourist-attraction';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schemaData, null, 2);
    document.head.appendChild(script);
  }

  function removeJsonLdSchema() {
    const existing = document.getElementById('json-ld-tourist-attraction');
    if (existing) {
      existing.remove();
    }
  }

  return {
    updateMetadata
  };
})();

window.SeoComponent = SeoComponent;
