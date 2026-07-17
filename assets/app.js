/**
 * SUNNY DENTAL SURGERY — app.js
 * Core Application Logic: Navigation, Transitions, Animations, Interactions
 * 
 * MOBILE NAVIGATION IMPROVEMENTS:
 * - Smooth drawer animation with proper UX
 * - Auto-close menu after navigation
 * - Proper history state management
 * - Active link highlighting
 * - Background scroll lock when menu is open
 */

(function () {
  'use strict';

  /* ================================================================
     1. PAGE TRANSITION ENGINE
     Real multi-page routing with smooth transitions.
     Browser back/forward buttons work natively (actual URL changes).
  ================================================================ */

  const overlay = document.getElementById('page-overlay');

  /* ── HISTORY STATE FOR MOBILE BACK BUTTON ── */
  (function setupHistoryRouting() {
    const isHome = document.body.dataset.page === 'home';
    const isFreshSession = !document.referrer || !document.referrer.includes(window.location.host);

    if (!isHome && isFreshSession) {
      try {
        const currentUrl = window.location.href;
        window.history.replaceState({ page: 'home' }, '', 'index.html');
        window.history.pushState({ page: 'sub' }, '', currentUrl);

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
    if (e.persisted && overlay) {
      overlay.classList.remove('active');
    }
    document.body.classList.add('page-enter');
  });

  // Remove overlay when page is visible
  if (overlay) {
    window.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(() => {
        overlay.style.opacity = '0';
        overlay.style.pointerEvents = 'none';
      });
    });
  }


  /* ================================================================
     2. NAVIGATION - MOBILE DRAWER WITH PROFESSIONAL UX
  ================================================================ */

  const nav = document.getElementById('mainNav');
  const hamburger = document.getElementById('hamburger');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = mobileDrawer?.querySelector('.drawer-backdrop');
  const drawerClose = document.getElementById('drawerClose');
  const drawerPanel = mobileDrawer?.querySelector('.drawer-panel');

  // Mobile drawer state
  let isDrawerOpen = false;

  // ── HAMBURGER + MOBILE DRAWER FUNCTIONS ──
  function openMobileDrawer() {
    if (isDrawerOpen) return;
    
    isDrawerOpen = true;
    mobileDrawer?.classList.add('open');
    hamburger?.classList.add('open');
    hamburger?.setAttribute('aria-expanded', 'true');
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    
    // Trigger animation
    requestAnimationFrame(() => {
      drawerPanel?.classList.add('visible');
    });
  }

  function closeMobileDrawer() {
    if (!isDrawerOpen) return;
    
    isDrawerOpen = false;
    mobileDrawer?.classList.remove('open');
    hamburger?.classList.remove('open');
    hamburger?.setAttribute('aria-expanded', 'false');
    drawerPanel?.classList.remove('visible');
    
    // Restore body scroll after animation
    setTimeout(() => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }, 350);
  }

  // Hamburger toggle
  hamburger?.addEventListener('click', (e) => {
    e.stopPropagation();
    isDrawerOpen ? closeMobileDrawer() : openMobileDrawer();
  });

  // Close on backdrop click
  drawerBackdrop?.addEventListener('click', closeMobileDrawer);

  // Close on close button click
  drawerClose?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeMobileDrawer();
  });

  // Close drawer on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isDrawerOpen) {
      closeMobileDrawer();
    }
  });

  // Close drawer when clicking outside (on drawer panel area shouldn't close)
  document.addEventListener('click', (e) => {
    if (isDrawerOpen && !drawerPanel?.contains(e.target) && !hamburger?.contains(e.target)) {
      closeMobileDrawer();
    }
  });

  // ── SCROLL BEHAVIOUR ──
  let lastScroll = 0;
  const NAV_THRESHOLD = 20;

  function updateNav() {
    if (!nav) return;
    const scrollY = window.scrollY;

    // Add/remove solid class based on scroll position
    const isTop = scrollY < NAV_THRESHOLD;

    if (nav.dataset.style === 'transparent') {
      // Hero pages: transparent at top, solid on scroll
      nav.classList.toggle('transparent', isTop);
      nav.classList.toggle('solid', !isTop);
      nav.classList.remove('white');
    } else {
      // White nav for inner pages
      nav.classList.add('white');
      nav.classList.remove('transparent', 'solid');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav(); // Initial call

  // ── ACTIVE LINK HIGHLIGHTING ──
  function setActiveNavLinks() {
    const currentPath = location.pathname;
    const currentFile = currentPath.split('/').pop() || 'index.html';

    document.querySelectorAll('[data-nav-link]').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkFile = href.split('/').pop() || 'index.html';
      const isActive = linkFile === currentFile ||
        (currentFile === '' && linkFile === 'index.html') ||
        (currentFile === 'index.html' && href === './') ||
        (currentFile === 'index.html' && href === 'index.html');

      link.classList.toggle('active', isActive);
    });
  }
  
  // Call on page load
  setActiveNavLinks();
  
  // Update active links on page show (for history navigation)
  window.addEventListener('pageshow', () => {
    setTimeout(setActiveNavLinks, 50);
  });


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
        items.forEach(i => i.classList.remove('open'));
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
  ================================================================ */

  function openQuickBookingModal() {
    const modal = document.getElementById('quick-booking-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.getBoundingClientRect();
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeQuickBookingModal() {
    const modal = document.getElementById('quick-booking-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (!modal.classList.contains('open')) {
        modal.style.display = 'none';
      }
    }, 300);
  }

  // Intercept WhatsApp links & buttons
  document.addEventListener('click', function (e) {
    const target = e.target.closest('a[href*="wa.me"], a[href*="whatsapp.com"], .btn-wa, .btn-whatsapp, .hero-book-btn, #fabWa');
    if (!target) return;

    if (target.closest('#quick-booking-modal')) return;

    e.preventDefault();
    openQuickBookingModal();
  });

  // Handle Close Trigger
  document.addEventListener('click', function (e) {
    if (
      e.target.id === 'closeBookingModal' || 
      e.target.closest('#closeBookingModal') || 
      (e.target.classList.contains('booking-modal-overlay') && e.target.id === 'quick-booking-modal')
    ) {
      closeQuickBookingModal();
    }
  });

  // Handle Form Submission
  document.addEventListener('submit', function (e) {
    if (e.target.id === 'quickBookingForm') {
      e.preventDefault();
      
      const name = document.getElementById('qbName')?.value.trim() || '';
      const surname = document.getElementById('qbSurname')?.value.trim() || '';
      const mobile = document.getElementById('qbMobile')?.value.trim() || '';
      const email = document.getElementById('qbEmail')?.value.trim() || 'Not provided';
      const service = document.getElementById('qbService')?.value || 'General Consultation';
      const time = document.getElementById('qbTime')?.value.trim() || '';

      const textMessage = `Assalam-o-Alaikum Sunny Dental Surgery,

I would like to book a dental appointment. Here are my details:
- Name: ${name} ${surname}
- Mobile: ${mobile}
- Email: ${email}
- Treatment: ${service}
- Preferred Time: ${time}

Please confirm my slot. Thank you!`;

      const whatsappUrl = `https://wa.me/923395192800?text=${encodeURIComponent(textMessage)}`;
      window.open(whatsappUrl, '_blank');
      
      closeQuickBookingModal();
      e.target.reset();
    }
  });

})();
