// SEO Enhancement Script for Blog Posts
class SEOEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.addSchemaMarkup();
    this.optimizeImages();
    this.addBreadcrumbSchema();
    this.setupAnalytics();
  }

  // Add structured data markup
  addSchemaMarkup() {
    const blogData = this.getBlogPostData();
    if (blogData) {
      const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: blogData.title,
        description: blogData.excerpt,
        image: blogData.image,
        publisher: {
          "@type": "Organization",
          name: "Teammo Agritech Solutions",
          logo: {
            "@type": "ImageObject",
            url: "https://agritech.teammo.in/assets/leaf.ico",
          },
        },
        datePublished: blogData.date,
        dateModified: blogData.date,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": window.location.href,
        },
      };

      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    }
  }

  // Add breadcrumb schema
  addBreadcrumbSchema() {
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://agritech.teammo.in/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: "https://agritech.teammo.in/blogs/",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: document.title.split(" - ")[0],
          item: window.location.href,
        },
      ],
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);
  }

  // Optimize images for SEO
  optimizeImages() {
    const images = document.querySelectorAll("img");
    images.forEach((img) => {
      // Add loading="lazy" for better performance
      if (!img.hasAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }

      // Ensure alt text exists
      if (!img.hasAttribute("alt") || img.alt === "") {
        const figcaption = img.closest("figure")?.querySelector("figcaption");
        if (figcaption) {
          img.alt = figcaption.textContent;
        } else {
          img.alt = "Agricultural technology image";
        }
      }
    });
  }

  // Setup Google Analytics and Search Console
  setupAnalytics() {
    // Google Analytics 4
    if (typeof gtag !== "undefined") {
      gtag("config", "GA_MEASUREMENT_ID", {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          dimension1: "blog_category",
        },
      });
    }
  }

  getBlogPostData() {
    // Extract blog data from page
    const title = document.querySelector("h1")?.textContent;
    const excerpt = document.querySelector('meta[name="description"]')?.content;
    const image = document.querySelector('meta[property="og:image"]')?.content;
    const date = document
      .querySelector(".blog-post-meta")
      ?.textContent?.match(/📅\s*(.+?)\s*🕒/)?.[1];

    return title ? { title, excerpt, image, date } : null;
  }
}

// Initialize SEO enhancements
document.addEventListener("DOMContentLoaded", () => {
  new SEOEnhancer();
});

// Export for use in other scripts
window.SEOEnhancer = SEOEnhancer;
