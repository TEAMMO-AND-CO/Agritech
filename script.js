// AgriTech Solutions - Interactive JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // Mobile Navigation Toggle
  const navToggle = document.getElementById("nav-toggle");
  const navMenu = document.getElementById("nav-menu");

  navToggle.addEventListener("click", function () {
    navMenu.classList.toggle("active");

    // Animate hamburger menu
    const bars = navToggle.querySelectorAll(".bar");
    bars.forEach((bar) => bar.classList.toggle("active"));
  });

  // Close mobile menu when clicking on nav links
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      navMenu.classList.remove("active");
      const bars = navToggle.querySelectorAll(".bar");
      bars.forEach((bar) => bar.classList.remove("active"));
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Navbar background on scroll
  const navbar = document.querySelector(".navbar");
  window.addEventListener("scroll", function () {
    if (window.scrollY > 50) {
      navbar.style.background = "rgba(255, 255, 255, 0.98)";
      navbar.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
    } else {
      navbar.style.background = "rgba(255, 255, 255, 0.95)";
      navbar.style.boxShadow = "none";
    }
  });

  // Active navigation link highlighting
  function updateActiveNavLink() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link");

    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionHeight = section.offsetHeight;
      if (
        window.scrollY >= sectionTop &&
        window.scrollY < sectionTop + sectionHeight
      ) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href").substring(1) === current) {
        link.classList.add("active");
      }
    });
  }

  window.addEventListener("scroll", updateActiveNavLink);

  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animateElements = document.querySelectorAll(
    ".service-card, .project-card, .feature, .stat"
  );
  animateElements.forEach((el) => {
    observer.observe(el);
  });

  // Counter animation for stats
  function animateCounters() {
    const counters = document.querySelectorAll(".stat h4");
    counters.forEach((counter) => {
      const target = parseInt(counter.textContent.replace(/\D/g, ""));
      const increment = target / 100;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          counter.textContent = counter.textContent.replace(/\d+/, target);
          clearInterval(timer);
        } else {
          counter.textContent = counter.textContent.replace(
            /\d+/,
            Math.floor(current)
          );
        }
      }, 20);
    });
  }

  // Trigger counter animation when stats section is visible
  const statsObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  const statsSection = document.querySelector(".stats");
  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // Contact form handling
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const formData = new FormData(contactForm);
      const formObject = {};
      formData.forEach((value, key) => {
        formObject[key] = value;
      });

      // Basic form validation
      const requiredFields = ["name", "email", "service", "message"];
      let isValid = true;
      let errorMessage = "";

      requiredFields.forEach((field) => {
        if (!formObject[field] || formObject[field].trim() === "") {
          isValid = false;
          errorMessage += `Please fill in the ${
            field.charAt(0).toUpperCase() + field.slice(1)
          } field.\n`;
        }
      });

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formObject.email && !emailRegex.test(formObject.email)) {
        isValid = false;
        errorMessage += "Please enter a valid email address.\n";
      }

      if (!isValid) {
        showNotification(errorMessage, "error");
        return;
      }

      // Simulate form submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;

      // Simulate API call
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        contactForm.reset();
        showNotification(
          "Thank you for your message! We'll get back to you within 24 hours.",
          "success"
        );
      }, 2000);
    });
  }

  // Notification system
  function showNotification(message, type = "info") {
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

    // Add styles for notification
    const style = document.createElement("style");
    style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
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
            .notification-success {
                border-left-color: #4CAF50;
            }
            .notification-error {
                border-left-color: #f44336;
            }
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
            .notification-success .notification-content i:first-child {
                color: #4CAF50;
            }
            .notification-error .notification-content i:first-child {
                color: #f44336;
            }
            .notification-content span {
                flex: 1;
                font-size: 14px;
                line-height: 1.4;
                white-space: pre-line;
            }
            .notification-close {
                background: none;
                border: none;
                cursor: pointer;
                color: #666;
                font-size: 16px;
                padding: 4px;
            }
            .notification-close:hover {
                color: #333;
            }
        `;
    document.head.appendChild(style);

    // Add to DOM
    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);

    // Auto remove after 5 seconds
    const autoRemove = setTimeout(() => {
      removeNotification();
    }, 5000);

    // Manual remove
    function removeNotification() {
      clearTimeout(autoRemove);
      notification.style.transform = "translateX(400px)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }

    notification
      .querySelector(".notification-close")
      .addEventListener("click", removeNotification);
  }

  // Parallax effect for hero section
  window.addEventListener("scroll", function () {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    const heroBackground = document.querySelector(".hero");
    if (heroBackground && scrolled < window.innerHeight) {
      heroBackground.style.transform = `translateY(${rate}px)`;
    }
  });

  // Floating cards animation enhancement
  const floatingCards = document.querySelectorAll(".floating-card");
  floatingCards.forEach((card, index) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px) scale(1.05)";
      this.style.transition = "all 0.3s ease-out";
    });

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0px) scale(1)";
    });
  });

  // Service cards hover effect
  const serviceCards = document.querySelectorAll(".service-card");
  serviceCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      const icon = this.querySelector("i");
      icon.style.transform = "scale(1.2) rotate(5deg)";
      icon.style.transition = "transform 0.3s ease-out";
    });

    card.addEventListener("mouseleave", function () {
      const icon = this.querySelector("i");
      icon.style.transform = "scale(1) rotate(0deg)";
    });
  });

  // Project cards interactive enhancement
  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      const icon = this.querySelector(".project-icon");
      icon.style.transform = "scale(1.1)";
      icon.style.transition = "transform 0.3s ease-out";
    });

    card.addEventListener("mouseleave", function () {
      const icon = this.querySelector(".project-icon");
      icon.style.transform = "scale(1)";
    });
  });

  // Typewriter effect for hero title
  function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = "";

    function type() {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  // Initialize typewriter effect on load
  const heroTitle = document.querySelector(".hero-title");
  if (heroTitle) {
    const originalText = heroTitle.textContent;
    setTimeout(() => {
      typeWriter(heroTitle, originalText, 50);
    }, 500);
  }

  // Back to top button
  const backToTopBtn = document.createElement("button");
  backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTopBtn.className = "back-to-top";
  backToTopBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        border: none;
        cursor: pointer;
        z-index: 1000;
        opacity: 0;
        transform: translateY(100px);
        transition: all 0.3s ease-out;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

  document.body.appendChild(backToTopBtn);

  backToTopBtn.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  window.addEventListener("scroll", function () {
    if (window.scrollY > 300) {
      backToTopBtn.style.opacity = "1";
      backToTopBtn.style.transform = "translateY(0)";
    } else {
      backToTopBtn.style.opacity = "0";
      backToTopBtn.style.transform = "translateY(100px)";
    }
  });

  // Loading animation
  function initializePageLoad() {
    document.body.classList.add("page-loaded");

    // Add loading styles
    const loadingStyle = document.createElement("style");
    loadingStyle.textContent = `
            body:not(.page-loaded) * {
                animation-play-state: paused !important;
            }
            .page-loaded {
                animation: fadeInPage 0.8s ease-out;
            }
            @keyframes fadeInPage {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
    document.head.appendChild(loadingStyle);
  }

  // Initialize page load animation
  initializePageLoad();

  // Console log for developers
  console.log(`
    🌱 Teammo Agritech Solutions Website
    ════════════════════════════════════
    
    Built with modern web technologies:
    • Responsive HTML5 structure
    • CSS3 with custom properties
    • Vanilla JavaScript ES6+
    • Font Awesome icons
    • Google Fonts (Inter)
    
    Features:
    ✅ Fully responsive design
    ✅ Smooth scrolling navigation
    ✅ Interactive animations
    ✅ Form validation
    ✅ Performance optimized
    
    Contact: teammo.and.co@gmail.com
    Phone: +91 74980 17600
    Location: Sangli, Maharashtra, India
    `);
});

// Utility functions for external use
window.AgriTechUtils = {
  // Scroll to section
  scrollToSection: function (sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  },

  // Show custom notification
  showNotification: function (message, type = "info") {
    // This would trigger the notification function defined above
    const event = new CustomEvent("showNotification", {
      detail: { message, type },
    });
    document.dispatchEvent(event);
  },

  // Get form data as object
  getFormData: function (formId) {
    const form = document.getElementById(formId);
    if (form) {
      const formData = new FormData(form);
      const formObject = {};
      formData.forEach((value, key) => {
        formObject[key] = value;
      });
      return formObject;
    }
    return null;
  },
};
