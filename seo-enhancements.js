// SEO Enhancement Script for Main Website
class MainSEOEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.addViewportMetaTag();
    this.addPreloadCriticalResources();
    this.setupLazyLoading();
    this.addStructuredDataForBreadcrumbs();
    this.setupPerformanceMonitoring();
    this.enhanceInternalLinking();
    this.addSkipLink();
  }

  addViewportMetaTag() {
    // Ensure viewport meta tag is properly set
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.name = "viewport";
      viewport.content = "width=device-width, initial-scale=1.0";
      document.head.appendChild(viewport);
    }
  }

  addPreloadCriticalResources() {
    // Preload critical CSS and fonts
    const criticalResources = [
      { href: "styles.css", as: "style" },
      {
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
        as: "style",
      },
    ];

    criticalResources.forEach((resource) => {
      if (!document.querySelector(`link[href="${resource.href}"]`)) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.href = resource.href;
        link.as = resource.as;
        if (resource.as === "style") {
          link.onload = function () {
            this.rel = "stylesheet";
          };
        }
        document.head.appendChild(link);
      }
    });
  }

  setupLazyLoading() {
    // Add lazy loading to images (if any future images are added)
    const images = document.querySelectorAll("img");

    if ("IntersectionObserver" in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
            observer.unobserve(img);
          }
        });
      });

      images.forEach((img) => {
        if (img.dataset.src) {
          imageObserver.observe(img);
        }
      });
    }
  }

  addStructuredDataForBreadcrumbs() {
    // Add breadcrumb structured data for better navigation understanding
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
      ],
    };

    // Add to current page if not home
    const currentPath = window.location.pathname;
    if (currentPath !== "/" && currentPath !== "/index.html") {
      breadcrumbSchema.itemListElement.push({
        "@type": "ListItem",
        position: 2,
        name: document.title.split(" - ")[0],
        item: window.location.href,
      });
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(breadcrumbSchema);
    document.head.appendChild(script);
  }

  setupPerformanceMonitoring() {
    // Monitor Core Web Vitals for SEO
    if ("web-vital" in window) {
      // This would integrate with web-vitals library if included
      return;
    }

    // Basic performance monitoring
    window.addEventListener("load", () => {
      if ("performance" in window) {
        const navigation = performance.getEntriesByType("navigation")[0];
        const paint = performance.getEntriesByType("paint");

        // Log performance metrics (in production, send to analytics)
        console.log("Performance Metrics:", {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
          domContentLoaded:
            navigation.domContentLoadedEventEnd -
            navigation.domContentLoadedEventStart,
          firstPaint: paint.find((entry) => entry.name === "first-paint")
            ?.startTime,
          firstContentfulPaint: paint.find(
            (entry) => entry.name === "first-contentful-paint"
          )?.startTime,
        });
      }
    });
  }

  enhanceInternalLinking() {
    // Add rel="noopener" to external links for security
    const externalLinks = document.querySelectorAll(
      'a[href^="http"]:not([href*="agritech.teammo.in"])'
    );
    externalLinks.forEach((link) => {
      if (!link.rel.includes("noopener")) {
        link.rel = link.rel ? `${link.rel} noopener` : "noopener";
      }
      if (!link.rel.includes("noreferrer")) {
        link.rel = link.rel ? `${link.rel} noreferrer` : "noreferrer";
      }
    });

    // Add meaningful titles to links that don't have them
    const linksWithoutTitles = document.querySelectorAll(
      "a:not([title]):not([aria-label])"
    );
    linksWithoutTitles.forEach((link) => {
      const text = link.textContent.trim();
      if (text && text.length > 0) {
        link.title = text;
      }
    });
  }

  addSkipLink() {
    // Add skip link for accessibility (also helps with SEO)
    if (!document.querySelector(".skip-link")) {
      const skipLink = document.createElement("a");
      skipLink.href = "#main-content";
      skipLink.className = "skip-link";
      skipLink.textContent = "Skip to main content";
      skipLink.setAttribute("aria-label", "Skip to main content");

      document.body.insertBefore(skipLink, document.body.firstChild);

      // Add id to main content area
      const mainSection =
        document.querySelector("#home") ||
        document.querySelector("main") ||
        document.querySelector("section");
      if (mainSection && !mainSection.id) {
        mainSection.id = "main-content";
      }
    }
  }

  // Method to track user interactions for SEO insights
  trackUserEngagement() {
    let engagementData = {
      scrollDepth: 0,
      timeOnPage: Date.now(),
      interactions: 0,
    };

    // Track scroll depth
    window.addEventListener("scroll", () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) *
          100
      );
      engagementData.scrollDepth = Math.max(
        engagementData.scrollDepth,
        scrollPercent
      );
    });

    // Track interactions
    ["click", "touch", "keydown"].forEach((eventType) => {
      document.addEventListener(eventType, () => {
        engagementData.interactions++;
      });
    });

    // Send engagement data when user leaves (in production, send to analytics)
    window.addEventListener("beforeunload", () => {
      engagementData.timeOnPage = Date.now() - engagementData.timeOnPage;
      console.log("User Engagement:", engagementData);
    });
  }
}

// Initialize SEO enhancements when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new MainSEOEnhancer();
});

// Export for potential use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = MainSEOEnhancer;
}
