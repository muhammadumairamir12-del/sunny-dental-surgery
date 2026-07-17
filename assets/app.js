/**
 * SUNNY DENTAL SURGERY — app.js
 * Core Application Logic: Navigation, Transitions, Animations, Interactions
 */

(function () {
  'use strict';

  /* ================================================================
     1. PAGE TRANSITION ENGINE
     Real multi-page routing with smooth transitions.
     Browser back/forward buttons work natively (actual URL changes).
  ================================================================ */

  // overlay may not exist yet at parse time; grab lazily when needed
  function getOverlay() { return document.getElementById('page-overlay'); }

  /* ── HISTORY STATE FOR MOBILE BACK BUTTON ── */
  (function setupHistoryRouting() {
    const isHome = document.body.dataset.page === 'home';
    // Check if the user landed directly on a deep page from outside
    const isFreshSession = !document.referrer || !document.referrer.includes(window.location.host);

    if (!isHome && isFreshSession) {
      try {
        const currentUrl = window.location.href;
        // Replace current state (sub-page) with Home page
        window.history.replaceState({ page: 'home' }, '', 'index.html');
        // Push the sub-page onto the stack
        window.history.pushState({ page: 'sub' }, '', currentUrl);

        // When back button is pressed, it popstates to Home state
        window.addEventListener('popstate', function (e) {
          if (e.state && e.state.page === 'home') {
            window.location.href = 'index.html';
          }
        });
      } catch (err) {
        console.warn("History routing not supported: ", err);
      }
    }
  })();


  /**
   * Navigate to a page with a smooth fade transition.
   * We intercept internal link clicks, animate out, then change location.
   */
  function navigateTo(href) {
    const overlay = getOverlay();
    if (!overlay) { location.href = href; return; }
    overlay.classList.add('active');
    setTimeout(() => { location.href = href; }, 320);
  }

  // Intercept all internal same-origin links
  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[href]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Skip: external links, hash-only, mailto, tel, new-tab
    const isExternal = anchor.hostname !== location.hostname;
    const isHashOnly = href.startsWith('#');
    const isSpecial  = href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('whatsapp:') || href.startsWith('https://wa.me');
    const isNewTab   = anchor.target === '_blank';

    if (isExternal || isHashOnly || isSpecial || isNewTab) return;

    // Skip if it's the current page
    const targetPath = new URL(href, location.href).pathname;
    if (targetPath === location.pathname) return;

    e.preventDefault();
    closeMobileDrawer();
    navigateTo(href);
  });

  // Page enter animation on load
  window.addEventListener('pageshow', function (e) {
    const overlay = getOverlay();
    if (e.persisted && overlay) {
      overlay.classList.remove('active');
    }
    document.body.classList.add('page-enter');
  });

  // Remove overlay on new page load
  document.addEventListener('DOMContentLoaded', () => {
    const overlay = getOverlay();
    if (overlay) {
      requestAnimationFrame(() => {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
      });
    }
  });


  /* ================================================================
     2. NAVIGATION
     All DOM queries run inside DOMContentLoaded so that nav-footer.js
     has already injected the hamburger / drawer HTML before we wire up
     event listeners.
  ================================================================ */

  // Shared drawer helpers — defined in outer scope so navigateTo() can call closeMobileDrawer()
  function openMobileDrawer() {
    const hamburger    = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    hamburger?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    const hamburger    = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const nav          = document.getElementById('mainNav');
    const hamburger    = document.getElementById('hamburger');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerBackdrop = mobileDrawer?.querySelector('.drawer-backdrop');
    const drawerClose  = document.getElementById('drawerClose');

    // ── SCROLL BEHAVIOUR ──
    const NAV_THRESHOLD = 20;

    function updateNav() {
      if (!nav) return;
      const scrollY = window.scrollY;
      const isTop = scrollY < NAV_THRESHOLD;

      if (nav.dataset.style === 'transparent') {
        nav.classList.toggle('transparent', isTop);
        nav.classList.toggle('solid', !isTop);
        nav.classList.remove('white');
      } else {
        nav.classList.add('white');
        nav.classList.remove('transparent', 'solid');
      }
    }

    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav(); // Initial call

    // ── ACTIVE LINK HIGHLIGHTING ──
    function setActiveNavLinks() {
      const currentFile = location.pathname.split('/').pop() || 'index.html';
      document.querySelectorAll('[data-nav-link]').forEach(link => {
        const href = link.getAttribute('href') || '';
        const linkFile = href.split('/').pop() || 'index.html';
        const isActive = linkFile === currentFile ||
          (currentFile === '' && linkFile === 'index.html') ||
          (currentFile === 'index.html' && (href === './' || href === 'index.html'));
        link.classList.toggle('active', isActive);
      });
    }
    setActiveNavLinks();

    // ── HAMBURGER TOGGLE ──
    if (hamburger) {
      hamburger.addEventListener('click', () => {
        const isOpen = mobileDrawer?.classList.contains('open');
        isOpen ? closeMobileDrawer() : openMobileDrawer();
      });
    }

    // ── CLOSE ON BACKDROP / X BUTTON ──
    drawerBackdrop?.addEventListener('click', closeMobileDrawer);
    drawerClose?.addEventListener('click', closeMobileDrawer);

    // ── CLOSE ON DRAWER LINK CLICK (navigates then closes) ──
    mobileDrawer?.querySelectorAll('.drawer-link').forEach(link => {
      link.addEventListener('click', () => {
        closeMobileDrawer();
      });
    });

    // ── CLOSE ON ESCAPE KEY ──
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeMobileDrawer();
        closeQuickBookingModal();
      }
    });

    setupBookingValidation();
  }); // end DOMContentLoaded


  /* ================================================================
     3. SCROLL REVEAL ANIMATIONS
  ================================================================ */

  function setupReveal() {
    const elements = document.querySelectorAll('[data-reveal]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const delay = parseInt(entry.target.dataset.revealDelay || 0, 10);
        setTimeout(() => entry.target.classList.add('revealed'), delay);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  }
  setupReveal();


  /* ================================================================
     4. ANIMATED COUNTERS
  ================================================================ */

  function setupCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = parseFloat(el.dataset.counter);
        const isFloat = (target % 1) !== 0;
        const duration = 1800;
        const start = performance.now();

        function tick(now) {
          const elapsed = Math.min((now - start) / duration, 1);
          // Ease-out-expo
          const eased = elapsed === 1 ? 1 : 1 - Math.pow(2, -10 * elapsed);
          const val = target * eased;
          el.textContent = isFloat ? val.toFixed(1) : Math.round(val);
          if (elapsed < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }
  setupCounters();


  /* ================================================================
     5. FAQ ACCORDION
  ================================================================ */

  function setupFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const btn = item.querySelector('.faq-question');
      btn?.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close all
        items.forEach(i => i.classList.remove('open'));
        // Toggle current
        if (!isOpen) item.classList.add('open');
      });
    });
  }
  setupFAQ();


  /* ================================================================
     6. GALLERY FILTER
  ================================================================ */

  function setupGalleryFilter() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item[data-category]');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.dataset.filter;

        galleryItems.forEach(item => {
          const show = category === 'all' || item.dataset.category === category;
          item.style.opacity = show ? '1' : '0.2';
          item.style.transform = show ? 'scale(1)' : 'scale(0.95)';
        });
      });
    });
  }
  setupGalleryFilter();


  /* ================================================================
     7. CONTACT FORM
  ================================================================ */

  function setupContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const successEl = document.getElementById('formSuccess');

      // Simulate submission (replace with actual backend call)
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;animation:spin 1s linear infinite">
          <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity=".25"/>
          <path d="M12 3a9 9 0 019 9"/>
        </svg>
        Sending...
      `;

      setTimeout(() => {
        form.style.display = 'none';
        if (successEl) successEl.classList.add('show');
      }, 1500);
    });
  }
  setupContactForm();


  /* ================================================================
     8. BACK TO TOP
  ================================================================ */

  function setupBackTop() {
    const btn = document.getElementById('backTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }
  setupBackTop();


  /* ================================================================
     9. SMOOTH ANCHOR SCROLL (with nav offset)
  ================================================================ */

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const offset = window.innerHeight * 0.12 + parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || 68);
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });


  /* ================================================================
     10. RIPPLE EFFECT ON BUTTONS
  ================================================================ */

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const ripple = document.createElement('span');
      Object.assign(ripple.style, {
        position: 'absolute',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.25)',
        width: '0', height: '0',
        left: x + 'px', top: y + 'px',
        transform: 'translate(-50%, -50%)',
        animation: 'rippleEffect 0.5s ease-out forwards',
        pointerEvents: 'none'
      });

      if (getComputedStyle(this).position === 'static') this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add ripple keyframe dynamically
  if (!document.getElementById('rippleKf')) {
    const s = document.createElement('style');
    s.id = 'rippleKf';
    s.textContent = '@keyframes rippleEffect{to{width:200px;height:200px;opacity:0}}@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(s);
  }


  /* ================================================================
     11. IMAGE LAZY LOADING (native fallback)
  ================================================================ */

  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (!img.complete && img.dataset.src) {
      img.src = img.dataset.src;
    }
  });


  /* ================================================================
     12. LOGO CAROUSEL (auto-scroll brands row)
  ================================================================ */

  function setupCarousel() {
    const track = document.querySelector('.carousel-track');
    if (!track) return;

    // Clone items for infinite scroll
    const items = track.querySelectorAll('.carousel-item');
    items.forEach(item => {
      const clone = item.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
  }
  setupCarousel();


  /* ================================================================
     13. LEGAL PAGE TOC ACTIVE LINK
  ================================================================ */

  function setupLegalTOC() {
    const sections = document.querySelectorAll('.legal-content h2[id]');
    const tocLinks = document.querySelectorAll('.legal-toc a');
    if (!sections.length || !tocLinks.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          tocLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  /* ================================================================
     14. QUICK APPOINTMENT WHATSAPP BOOKING MODAL
     Intercepts all WhatsApp booking triggers, prompts user info,
     and forwards details cleanly prefilled to clinic on WhatsApp.
  ================================================================ */

  let previousActiveElement = null;

  function openQuickBookingModal() {
    const modal = document.getElementById('quick-booking-modal');
    if (!modal) return;

    previousActiveElement = document.activeElement;

    // Prevent layout shift: calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      const navEl = document.getElementById('mainNav');
      if (navEl) navEl.style.paddingRight = `${scrollbarWidth}px`;
      const fabEl = document.getElementById('fabWa');
      if (fabEl) {
        const currentRight = window.innerWidth <= 480 ? 18 : 24;
        fabEl.style.right = `${currentRight + scrollbarWidth}px`;
      }
    }

    modal.style.display = 'flex';
    modal.getBoundingClientRect(); // Trigger layout reflow
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Auto focus first input
    const nameInput = document.getElementById('qbName');
    if (nameInput) {
      setTimeout(() => nameInput.focus(), 100);
    }

    // Add focus trap keydown listener
    document.addEventListener('keydown', trapFocus);
  }

  function closeQuickBookingModal() {
    const modal = document.getElementById('quick-booking-modal');
    if (!modal) return;

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');

    // Restore scroll and layout padding
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
    const navEl = document.getElementById('mainNav');
    if (navEl) navEl.style.paddingRight = '';
    const fabEl = document.getElementById('fabWa');
    if (fabEl) fabEl.style.right = '';

    // Restore focus
    if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
      previousActiveElement.focus();
    }

    // Remove focus trap keydown listener
    document.removeEventListener('keydown', trapFocus);

    setTimeout(() => {
      if (!modal.classList.contains('open')) {
        modal.style.display = 'none';
        
        // Reset success screen
        const successScreen = document.getElementById('booking-success-screen');
        const formEl = document.getElementById('quickBookingForm');
        if (successScreen) successScreen.style.display = 'none';
        if (formEl) formEl.style.display = 'block';

        // Clear validation classes
        modal.querySelectorAll('.floating-group').forEach(group => {
          group.classList.remove('is-valid', 'is-invalid', 'has-value');
        });
        
        // Date/Time fields should keep has-value
        document.getElementById('qbDateGroup')?.classList.add('has-value');
        document.getElementById('qbTimeGroup')?.classList.add('has-value');

        // Reset form
        formEl?.reset();
      }
    }, 400);
  }

  // Trap keyboard focus inside modal (Accessibility)
  function trapFocus(e) {
    if (e.key !== 'Tab') return;
    const modal = document.getElementById('quick-booking-modal');
    if (!modal || !modal.classList.contains('open')) return;

    const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(modal.querySelectorAll(focusableSelector)).filter(el => {
      return el.offsetParent !== null && !el.disabled;
    });

    if (focusables.length === 0) return;

    const firstEl = focusables[0];
    const lastEl = focusables[focusables.length - 1];

    if (e.shiftKey) { // Shift + Tab
      if (document.activeElement === firstEl) {
        lastEl.focus();
        e.preventDefault();
      }
    } else { // Tab
      if (document.activeElement === lastEl) {
        firstEl.focus();
        e.preventDefault();
      }
    }
  }

  // Intercept all booking triggers
  document.addEventListener('click', function (e) {
    const target = e.target.closest('a, button, .btn, .hero-book-btn, #fabWa');
    if (!target) return;

    // Skip inside modal itself
    if (target.closest('#quick-booking-modal')) return;

    const text = target.textContent.trim().toLowerCase();
    const href = target.getAttribute('href') || '';
    const id = target.id;

    const matchesText = text.includes('book now') ||
                        text.includes('book appointment') ||
                        text.includes('whatsapp booking') ||
                        text.includes('appointment');

    const matchesHref = href.includes('wa.me') || href.includes('whatsapp.com');
    const matchesClassOrId = target.classList.contains('btn-wa') ||
                             target.classList.contains('btn-whatsapp') ||
                             target.classList.contains('hero-book-btn') ||
                             id === 'fabWa';

    if (matchesText || matchesHref || matchesClassOrId) {
      e.preventDefault();
      openQuickBookingModal();
    }
  });

  // Handle Overlay Close click
  document.addEventListener('click', function (e) {
    if (
      e.target.id === 'closeBookingModal' ||
      e.target.closest('#closeBookingModal') ||
      (e.target.classList.contains('booking-modal-overlay') && e.target.id === 'quick-booking-modal')
    ) {
      closeQuickBookingModal();
    }
  });

  // Inline Validation helper functions
  function validateField(inputEl, isValid) {
    const group = inputEl.closest('.floating-group');
    if (!group) return isValid;
    if (isValid) {
      group.classList.add('is-valid');
      group.classList.remove('is-invalid');
    } else {
      group.classList.add('is-invalid');
      group.classList.remove('is-valid');
    }
    return isValid;
  }

  function validateName(input) {
    const val = input.value.trim();
    const isValid = val.length > 0 && !/^\d+$/.test(val);
    return validateField(input, isValid);
  }

  function validatePhone(input) {
    const val = input.value.trim();
    // Valid phone format: digits, optional plus, dashes, spaces, min 10 max 15 digits
    const isValid = /^\+?[0-9\s\-()]{10,15}$/.test(val);
    return validateField(input, isValid);
  }

  // Global validators needed by inline listeners
  window.validateName = validateName;
  window.validatePhone = validatePhone;
  window.validateService = function(select) {
    const isValid = select.value !== "";
    return validateField(select, isValid);
  };
  window.validateDate = function(input) {
    const val = input.value;
    let isValid = val !== "";
    if (isValid) {
      const selectedDate = new Date(val + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      isValid = selectedDate >= today;
    }
    return validateField(input, isValid);
  };
  window.validateTime = function(input) {
    const isValid = input.value !== "";
    return validateField(input, isValid);
  };

  // Setup validations
  function setupBookingValidation() {
    const form = document.getElementById('quickBookingForm');
    if (!form) return;

    const nameInput = document.getElementById('qbName');
    const phoneInput = document.getElementById('qbMobile');
    const serviceSelect = document.getElementById('qbService');
    const dateInput = document.getElementById('qbDate');
    const timeInput = document.getElementById('qbTime');

    if (nameInput) nameInput.addEventListener('input', () => window.validateName(nameInput));
    if (phoneInput) phoneInput.addEventListener('input', () => window.validatePhone(phoneInput));
    if (serviceSelect) {
      serviceSelect.addEventListener('change', () => {
        window.validateService(serviceSelect);
        const group = serviceSelect.closest('.floating-group');
        if (serviceSelect.value) {
          group.classList.add('has-value');
        } else {
          group.classList.remove('has-value');
        }
      });
    }
    if (dateInput) dateInput.addEventListener('change', () => window.validateDate(dateInput));
    if (timeInput) timeInput.addEventListener('change', () => window.validateTime(timeInput));
  }

  // Expose setup globally in case needed
  window.setupBookingValidation = setupBookingValidation;

  // Handle Form Submission with Custom Success Screen
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'quickBookingForm') {
      e.preventDefault();

      const form = e.target;
      const nameInput = document.getElementById('qbName');
      const phoneInput = document.getElementById('qbMobile');
      const serviceSelect = document.getElementById('qbService');
      const dateInput = document.getElementById('qbDate');
      const timeInput = document.getElementById('qbTime');

      const isNameVal = nameInput ? window.validateName(nameInput) : false;
      const isPhoneVal = phoneInput ? window.validatePhone(phoneInput) : false;
      const isServiceVal = serviceSelect ? window.validateService(serviceSelect) : false;
      const isDateVal = dateInput ? window.validateDate(dateInput) : false;
      const isTimeVal = timeInput ? window.validateTime(timeInput) : false;

      if (!isNameVal || !isPhoneVal || !isServiceVal || !isDateVal || !isTimeVal) {
        const firstInvalid = form.querySelector('.is-invalid input, .is-invalid select');
        firstInvalid?.focus();
        return;
      }

      const successScreen = document.getElementById('booking-success-screen');
      const submitBtn = document.getElementById('qbSubmitBtn');

      if (successScreen && submitBtn) {
        // Hide form fields and show success screen
        form.style.display = 'none';
        successScreen.style.display = 'flex';

        const name = nameInput.value.trim();
        const mobile = phoneInput.value.trim();
        const service = serviceSelect.value;
        const date = dateInput.value;
        const time = timeInput.value;

        // Message body matching specifications
        const textMessage = `Hello,

I would like to book an appointment.

Name: ${name}
Phone: ${mobile}
Service: ${service}
Preferred Date: ${date}
Preferred Time: ${time}

Please confirm my appointment.

Thank you.`;

        const whatsappUrl = `https://wa.me/923395192800?text=${encodeURIComponent(textMessage)}`;

        // Approximately 700ms timeout
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
          closeQuickBookingModal();
        }, 700);
      }
    }
  });

})();
