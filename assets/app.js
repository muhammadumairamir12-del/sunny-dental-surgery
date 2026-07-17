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
      if (e.key === 'Escape') closeMobileDrawer();
    });
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

  function matchServiceText(text) {
    const t = text.toLowerCase();
    if (t.includes('general') || t.includes('preventive')) return 'General & Preventive';
    if (t.includes('cosmetic') || t.includes('whitening')) return 'Cosmetic Dentistry';
    if (t.includes('implant')) return 'Dental Implants';
    if (t.includes('ortho') || t.includes('brace') || t.includes('align')) return 'Orthodontics & Braces';
    if (t.includes('root') || t.includes('canal') || t.includes('endo')) return 'Root Canal Treatment';
    if (t.includes('emergency')) return 'Emergency Dentistry';
    if (t.includes('surgery') || t.includes('extraction')) return 'Oral Surgery';
    if (t.includes('paediatric') || t.includes('child') || t.includes('ayesha')) return 'Paediatric Dentistry';
    return '';
  }

  function openQuickBookingModal(serviceVal) {
    const modal = document.getElementById('quick-booking-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.getBoundingClientRect(); // Trigger layout reflow
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Pre-select service in dropdown if available
    const select = document.getElementById('qbService');
    if (select) {
      if (serviceVal) {
        select.value = serviceVal;
      } else {
        select.selectedIndex = 0; // "Select Treatment" default
      }
    }
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

    // Skip if it's inside the quick booking modal itself
    if (target.closest('#quick-booking-modal')) return;

    e.preventDefault();

    // UX: Detect context based on parent card
    let preselectedService = '';
    const serviceCard = target.closest('.service-full-card');
    if (serviceCard) {
      const h3Text = serviceCard.querySelector('h3')?.textContent.trim() || '';
      preselectedService = matchServiceText(h3Text);
    }
    const homeServiceCard = target.closest('.service-card');
    if (homeServiceCard) {
      const h3Text = homeServiceCard.querySelector('h3')?.textContent.trim() || '';
      preselectedService = matchServiceText(h3Text);
    }

    openQuickBookingModal(preselectedService);
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
      const mobile = document.getElementById('qbMobile')?.value.trim() || '';
      const service = document.getElementById('qbService')?.value || 'General Consultation';
      const date = document.getElementById('qbDate')?.value || '';
      const time = document.getElementById('qbTime')?.value.trim() || '';

      const textMessage = `Assalam-o-Alaikum Sunny Dental Surgery,

I would like to book a dental appointment. Here are my details:
- Name: ${name}
- Mobile: ${mobile}
- Treatment: ${service}
- Preferred Date: ${date}
- Preferred Time: ${time}

Please confirm my slot. Thank you!`;

      const whatsappUrl = `https://wa.me/923395192800?text=${encodeURIComponent(textMessage)}`;
      window.open(whatsappUrl, '_blank');
      
      closeQuickBookingModal();
      
      // Reset form
      e.target.reset();
    }
  });

})();
