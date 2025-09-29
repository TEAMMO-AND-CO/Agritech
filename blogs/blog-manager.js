// Blog Management System
class BlogManager {
  constructor() {
    this.blogs = [];
    this.categories = [];
    this.settings = {};
    this.currentPage = 1;
    this.postsPerPage = 6;
    this.filteredBlogs = [];
    this.currentFilter = "all";
    this.searchTerm = "";

    this.init();
  }

  async init() {
    try {
      await this.loadBlogData();
      this.setupEventListeners();
      this.renderBlogs();
      this.setupNavigation();
    } catch (error) {
      console.error("Error initializing blog manager:", error);
      this.showError("Failed to load blog content. Please try again later.");
    }
  }

  async loadBlogData() {
    try {
      const response = await fetch("./data/blogs.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      this.blogs = data.blogs || [];
      this.categories = data.categories || [];
      this.settings = data.settings || {};
      this.postsPerPage = this.settings.postsPerPage || 6;
      this.filteredBlogs = [...this.blogs];

      // Sort blogs by date (newest first)
      this.blogs.sort((a, b) => new Date(b.date) - new Date(a.date));
      this.filteredBlogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (error) {
      console.error("Error loading blog data:", error);
      // Fallback to empty data
      this.blogs = [];
      this.categories = [];
      this.settings = {};
    }
  }

  setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll(".filter-btn");
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const category = e.target.dataset.category;
        this.filterByCategory(category);
        this.updateActiveFilter(e.target);
      });
    });

    // Search functionality
    const searchInput = document.getElementById("blog-search");
    if (searchInput) {
      let searchTimeout;
      searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.searchBlogs(e.target.value);
        }, 300);
      });
    }

    // Load more button
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        this.loadMorePosts();
      });
    }

    // Newsletter form
    const newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", (e) => {
        this.handleNewsletterSubmission(e);
      });
    }

    // Category links in footer
    document.querySelectorAll("[data-category]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const category = e.target.dataset.category;
        this.filterByCategory(category);
        this.updateActiveFilter(
          document.querySelector(`[data-category="${category}"]`)
        );
        this.scrollToArticles();
      });
    });
  }

  filterByCategory(category) {
    this.currentFilter = category;
    this.currentPage = 1;

    if (category === "all") {
      this.filteredBlogs = [...this.blogs];
    } else {
      this.filteredBlogs = this.blogs.filter(
        (blog) => blog.category === category
      );
    }

    // Apply search filter if active
    if (this.searchTerm) {
      this.applySearchFilter();
    }

    this.renderBlogs();
  }

  searchBlogs(term) {
    this.searchTerm = term.toLowerCase();
    this.currentPage = 1;

    // Start with current category filter
    let blogs =
      this.currentFilter === "all"
        ? [...this.blogs]
        : this.blogs.filter((blog) => blog.category === this.currentFilter);

    if (this.searchTerm) {
      this.applySearchFilter(blogs);
    } else {
      this.filteredBlogs = blogs;
    }

    this.renderBlogs();
  }

  applySearchFilter(blogs = null) {
    const blogsToSearch = blogs || this.filteredBlogs;

    this.filteredBlogs = blogsToSearch.filter((blog) => {
      return (
        blog.title.toLowerCase().includes(this.searchTerm) ||
        blog.excerpt.toLowerCase().includes(this.searchTerm) ||
        blog.content.toLowerCase().includes(this.searchTerm) ||
        blog.tags.some((tag) => tag.toLowerCase().includes(this.searchTerm))
      );
    });
  }

  updateActiveFilter(activeButton) {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    activeButton.classList.add("active");
  }

  renderBlogs() {
    this.renderFeaturedArticle();
    this.renderArticlesGrid();
    this.updateLoadMoreButton();
    this.updateStats();
  }

  renderFeaturedArticle() {
    const featuredContainer = document.getElementById("featured-article");
    if (!featuredContainer) return;

    const featured =
      this.filteredBlogs.find((blog) => blog.featured) || this.filteredBlogs[0];
    if (!featured) {
      featuredContainer.innerHTML = "<p>No featured article available.</p>";
      return;
    }

    const categoryInfo = this.categories.find(
      (cat) => cat.id === featured.category
    );
    const categoryName = categoryInfo ? categoryInfo.name : featured.category;

    featuredContainer.innerHTML = `
            <div class="article-image" style="background-image: url('${
              featured.image
            }')">
                <div class="article-badge">${categoryName}</div>
            </div>
            <div class="article-content">
                <div class="article-meta">
                    <span><i class="fas fa-calendar"></i> ${this.formatDate(
                      featured.date
                    )}</span>
                    <span><i class="fas fa-clock"></i> ${
                      featured.readTime
                    }</span>
                </div>
                <h2 class="article-title">${featured.title}</h2>
                <p class="article-excerpt">${featured.excerpt}</p>
                <a href="${featured.id}.html" class="article-link">
                    Read Full Article <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;

    featuredContainer.classList.add("fade-in");
  }

  renderArticlesGrid() {
    const grid = document.getElementById("articles-grid");
    if (!grid) return;

    const startIndex = 0;
    const endIndex = this.currentPage * this.postsPerPage;
    const articlesToShow = this.filteredBlogs.slice(startIndex, endIndex);

    if (articlesToShow.length === 0) {
      grid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No articles found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            `;
      return;
    }

    grid.innerHTML = articlesToShow
      .map((blog) => this.createArticleCard(blog))
      .join("");

    // Add animation to new cards
    const cards = grid.querySelectorAll(".article-card");
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("fade-in");
      }, index * 100);
    });
  }

  createArticleCard(blog) {
    const categoryInfo = this.categories.find(
      (cat) => cat.id === blog.category
    );
    const categoryName = categoryInfo ? categoryInfo.name : blog.category;

    return `
            <div class="article-card" onclick="this.style.cursor='pointer'; window.location.href='${
              blog.id
            }.html'">
                <div class="article-image" style="background-image: url('${
                  blog.image
                }')">
                    <div class="article-badge">${categoryName}</div>
                </div>
                <div class="article-content">
                    <div class="article-meta">
                        <span><i class="fas fa-calendar"></i> ${this.formatDate(
                          blog.date
                        )}</span>
                        <span><i class="fas fa-clock"></i> ${
                          blog.readTime
                        }</span>
                    </div>
                    <h3 class="article-title">${blog.title}</h3>
                    <p class="article-excerpt">${blog.excerpt}</p>
                    <a href="${blog.id}.html" class="read-more">
                        Read More <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
  }

  updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById("load-more-btn");
    if (!loadMoreBtn) return;

    const totalPosts = this.filteredBlogs.length;
    const shownPosts = this.currentPage * this.postsPerPage;

    if (shownPosts >= totalPosts) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "inline-flex";
      loadMoreBtn.textContent = `Load More Articles (${
        totalPosts - shownPosts
      } remaining)`;
    }
  }

  loadMorePosts() {
    this.currentPage++;
    this.renderArticlesGrid();
  }

  updateStats() {
    const totalArticlesElement = document.getElementById("total-articles");
    if (totalArticlesElement) {
      totalArticlesElement.textContent = this.filteredBlogs.length;
    }
  }

  handleNewsletterSubmission(e) {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    // Disable form during submission
    submitBtn.disabled = true;
    submitBtn.textContent = "Subscribing...";

    // Simulate API call
    setTimeout(() => {
      this.showNotification(
        "Thank you for subscribing to our newsletter!",
        "success"
      );
      form.reset();
      submitBtn.disabled = false;
      submitBtn.textContent = "Subscribe";
    }, 1500);
  }

  formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  scrollToArticles() {
    const articlesSection = document.querySelector(".blog-articles");
    if (articlesSection) {
      articlesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  setupNavigation() {
    // Handle navigation highlighting
    const currentPage = window.location.pathname;
    if (currentPage.includes("/blogs/")) {
      const blogLink = document.querySelector('a[href*="blogs"]');
      if (blogLink) {
        blogLink.classList.add("active");
      }
    }
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${
                  type === "success"
                    ? "fa-check-circle"
                    : type === "error"
                    ? "fa-exclamation-circle"
                    : "fa-info-circle"
                }"></i>
                <span>${message}</span>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

    // Add notification styles if not already present
    if (!document.querySelector("#notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
      style.textContent = `
                .notification {
                    position: fixed;
                    top: 90px;
                    right: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                    z-index: 10000;
                    transform: translateX(400px);
                    transition: transform 0.3s ease-out;
                    max-width: 400px;
                    border-left: 4px solid var(--primary-color);
                }
                .notification-success { border-left-color: #4CAF50; }
                .notification-error { border-left-color: #f44336; }
                .notification-content {
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .notification-content i:first-child {
                    font-size: 20px;
                    color: var(--primary-color);
                }
                .notification-success .notification-content i:first-child { color: #4CAF50; }
                .notification-error .notification-content i:first-child { color: #f44336; }
                .notification-content span {
                    flex: 1;
                    font-size: 14px;
                    line-height: 1.4;
                }
                .notification-close {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #666;
                    font-size: 16px;
                    padding: 4px;
                }
            `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Auto remove
    const autoRemove = setTimeout(() => {
      this.removeNotification(notification);
    }, 5000);

    // Manual remove
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        clearTimeout(autoRemove);
        this.removeNotification(notification);
      });
  }

  removeNotification(notification) {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Content</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">Retry</button>
            </div>
        `;

    const container =
      document.querySelector(".blog-articles .container") || document.body;
    container.appendChild(errorDiv);
  }
}

// Individual Blog Post Manager
class BlogPostManager {
  constructor() {
    this.blog = null;
    this.allBlogs = [];
    this.init();
  }

  async init() {
    try {
      await this.loadBlogData();
      const postId = this.getPostIdFromUrl();
      if (postId) {
        this.renderBlogPost(postId);
      }
    } catch (error) {
      console.error("Error loading blog post:", error);
      this.showError("Failed to load blog post content.");
    }
  }

  async loadBlogData() {
    const response = await fetch("./data/blogs.json");
    const data = await response.json();
    this.allBlogs = data.blogs || [];
    this.categories = data.categories || [];
  }

  getPostIdFromUrl() {
    const path = window.location.pathname;
    const match = path.match(/\/(\d+)\.html/);
    return match ? parseInt(match[1]) : null;
  }

  renderBlogPost(postId) {
    this.blog = this.allBlogs.find((blog) => blog.id === postId);

    if (!this.blog) {
      this.show404();
      return;
    }

    this.updatePageTitle();
    this.updateMetaTags();
    // Skip rendering content and navigation since they're already in the HTML files
  }

  updatePageTitle() {
    document.title = `${this.blog.title} - Teammo Agritech Solutions Blog`;
  }

  updateMetaTags() {
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = this.blog.seoDescription || this.blog.excerpt;

    // Update other meta tags for social sharing
    this.updateMetaTag("og:title", this.blog.seoTitle || this.blog.title);
    this.updateMetaTag(
      "og:description",
      this.blog.seoDescription || this.blog.excerpt
    );
    this.updateMetaTag("og:image", this.blog.image);
    this.updateMetaTag("twitter:title", this.blog.seoTitle || this.blog.title);
    this.updateMetaTag(
      "twitter:description",
      this.blog.seoDescription || this.blog.excerpt
    );
    this.updateMetaTag("twitter:image", this.blog.image);
  }

  updateMetaTag(property, content) {
    let tag =
      document.querySelector(`meta[property="${property}"]`) ||
      document.querySelector(`meta[name="${property}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(property.includes(":") ? "property" : "name", property);
      document.head.appendChild(tag);
    }
    tag.content = content;
  }

  renderPostContent() {
    // Since the HTML files already have the content, we don't need to render it
    // This method is kept for compatibility but doesn't perform any operations
    // The static HTML files already contain all the necessary blog post content
  }

  formatContent(content) {
    // Convert markdown-like formatting to HTML
    return content
      .split("\n\n")
      .map((paragraph) => {
        if (paragraph.startsWith("## ")) {
          return `<h2>${paragraph.substring(3)}</h2>`;
        } else if (paragraph.startsWith("### ")) {
          return `<h3>${paragraph.substring(4)}</h3>`;
        } else if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
          return `<h4>${paragraph.slice(2, -2)}</h4>`;
        } else if (paragraph.includes("**")) {
          return `<p>${paragraph.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
          )}</p>`;
        } else if (paragraph.startsWith("- ")) {
          const items = paragraph
            .split("\n")
            .map((item) =>
              item.startsWith("- ") ? `<li>${item.substring(2)}</li>` : item
            )
            .join("");
          return `<ul>${items}</ul>`;
        } else if (paragraph.trim()) {
          return `<p>${paragraph}</p>`;
        }
        return "";
      })
      .join("");
  }

  formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  }

  renderNavigation() {
    // Since the HTML files already have navigation, we don't need to render it
    // This method is kept for compatibility but doesn't perform any operations
    // The static HTML files already contain the necessary navigation elements
  }

  show404() {
    document.body.innerHTML = `
            <div class="error-404">
                <div class="container">
                    <h1>404 - Blog Post Not Found</h1>
                    <p>The blog post you're looking for doesn't exist.</p>
                    <a href="index.html" class="btn btn-primary">Back to Blog</a>
                </div>
            </div>
        `;
  }

  showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
                <a href="index.html" class="btn btn-primary">Back to Blog</a>
            </div>
        `;
    document.body.appendChild(errorDiv);
  }
}

// Initialize appropriate manager based on page
document.addEventListener("DOMContentLoaded", function () {
  const path = window.location.pathname;

  if (path.includes("/blogs/") && path.match(/\/\d+\.html/)) {
    // Individual blog post page
    new BlogPostManager();
  } else if (path.includes("/blogs/")) {
    // Blog index page
    new BlogManager();
  }
});

// Export for external use
window.BlogManager = BlogManager;
window.BlogPostManager = BlogPostManager;
