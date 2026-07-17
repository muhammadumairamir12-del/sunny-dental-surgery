/**
 * SUNNY DENTAL — nav-footer.js
 * Injects shared navigation and footer HTML into every page.
 * Must be loaded as a <script> in <head> with defer, before body renders.
 */

(function () {
  const WA_NUMBER = '923395192800';
  const WA_MSG    = encodeURIComponent('Assalam-o-Alaikum, I would like to book a dental appointment.');
  const WA_LINK   = `https://wa.me/${WA_NUMBER}?text=${WA_MSG}`;

  // SVG tooth icon
  const TOOTH_SVG = `<svg class="brand-tooth" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 3C13.0 3 9 6.8 9 11.5c0 3 1 5 1.6 9.5.5 3.3 1.4 6 3.2 6 1.4 0 2-2.2 2.4-4.4.2-1.5 1.1-2.1 1.8-2.1s1.6.6 1.8 2.1c.4 2.2 1 4.4 2.4 4.4 1.8 0 2.7-2.7 3.2-6 .6-4.5 1.6-6.5 1.6-9.5C27 6.8 23 3 18 3Z" fill="url(#tg)"/>
    <defs><linearGradient id="tg" x1="9" y1="3" x2="27" y2="29" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F2A73B"/>
      <stop offset="100%" stop-color="#1C7A68"/>
    </linearGradient></defs>
  </svg>`;

  const NAV_LINKS = [
    { href: 'index.html',    label: 'Home',       icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>' },
    { href: 'about.html',    label: 'About Us',   icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>' },
    { href: 'services.html', label: 'Services',   icon: '<path d="M12 3c-3 0-5 2-5 5 0 3 1 4 1.3 7.4.2 2 .9 3.6 1.9 3.6s1.3-1.7 1.5-3.1c.1-.9.6-1.4 1.3-1.4s1.2.5 1.3 1.4c.2 1.4.5 3.1 1.5 3.1s1.7-1.6 1.9-3.6C17 12 18 11 18 8c0-3-2-5-5-5z"/>' },
    { href: 'gallery.html',  label: 'Gallery',    icon: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>' },
    { href: 'brands.html',   label: 'Brands',     icon: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>' },
    { href: 'blog.html',     label: 'Blog',       icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>' },
    { href: 'faqs.html',     label: 'FAQs',       icon: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>' },
    { href: 'contact.html',  label: 'Contact',    icon: '<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 1.25h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 8.9a16 16 0 006.08 6.08l.99-.99a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>' },
  ];

  function buildDesktopLinks() {
    return NAV_LINKS.map(l =>
      `<a href="${l.href}" class="nav-link" data-nav-link>${l.label}</a>`
    ).join('');
  }

  function buildDrawerLinks() {
    return NAV_LINKS.map(l =>
      `<a href="${l.href}" class="drawer-link" data-nav-link>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${l.icon}</svg>
        ${l.label}
      </a>`
    ).join('');
  }

  const NAV_HTML = `
  <div id="page-overlay"></div>

  <!-- NAVIGATION -->
  <nav class="nav transparent" id="mainNav" data-style="transparent">
    <div class="nav-inner">
      <!-- Brand -->
      <a href="index.html" class="nav-brand">
        ${TOOTH_SVG}
        <span>Sunny</span> <strong>Dental</strong>
      </a>

      <!-- Desktop Links -->
      <div class="nav-menu">${buildDesktopLinks()}</div>

      <!-- Desktop CTA -->
      <div class="nav-cta">
        <a href="${WA_LINK}" class="nav-wa-btn" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.9 9.9 0 004.62 1.14h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2z"/></svg>
          Book Now
        </a>
      </div>

      <!-- Mobile Hamburger -->
      <button class="hamburger" id="hamburger" aria-label="Open menu" aria-expanded="false">
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
        <span class="hamburger-bar"></span>
      </button>
    </div>
  </nav>

  <!-- MOBILE DRAWER -->
  <div class="mobile-drawer" id="mobileDrawer" role="dialog" aria-label="Navigation menu">
    <div class="drawer-backdrop"></div>
    <div class="drawer-panel">
      <div class="drawer-header">
        <a href="index.html" class="nav-brand" style="color:#fff;">
          ${TOOTH_SVG}
          <span style="color:rgba(255,255,255,.6)">Sunny</span>
          <strong style="color:#F2A73B">Dental</strong>
        </a>
        <button class="drawer-close" id="drawerClose" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <nav class="drawer-nav">${buildDrawerLinks()}</nav>
      <div class="drawer-footer">
        <a href="${WA_LINK}" class="btn btn-wa" target="_blank" rel="noopener" style="width:100%;justify-content:center;">
          <svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.9 9.9 0 004.62 1.14h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2z"/></svg>
          Book Appointment on WhatsApp
        </a>
        <p style="text-align:center;font-size:0.75rem;color:rgba(255,255,255,.4);margin-top:8px;">Open 24/7 · +92 339 5192800</p>
      </div>
    </div>
  </div>`;

  const FOOTER_HTML = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <!-- Brand -->
        <div class="footer-brand-col">
          <a href="index.html" class="footer-brand">
            ${TOOTH_SVG}
            <span>Sunny <strong>Dental</strong></span>
          </a>
          <p>Lahore's most trusted dental & medical complex. Open 24/7, caring for families with professional expertise and gentle care.</p>
          <div class="footer-rating">
            <span class="footer-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <span><strong>4.7</strong> / 5 from 91 Google Reviews</span>
          </div>
        </div>

        <!-- Services -->
        <div class="footer-col">
          <h4>Services</h4>
          <ul class="footer-links">
            <li><a href="services.html">General Dentistry</a></li>
            <li><a href="services.html">Cosmetic Dentistry</a></li>
            <li><a href="services.html">Dental Implants</a></li>
            <li><a href="services.html">Orthodontics &amp; Braces</a></li>
            <li><a href="services.html">Root Canal Treatment</a></li>
            <li><a href="services.html">Emergency Dental Care</a></li>
            <li><a href="services.html">Paediatric Dentistry</a></li>
          </ul>
        </div>

        <!-- Quick Links -->
        <div class="footer-col">
          <h4>Quick Links</h4>
          <ul class="footer-links">
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About Us</a></li>
            <li><a href="gallery.html">Gallery</a></li>
            <li><a href="brands.html">Brands</a></li>
            <li><a href="blog.html">Blog &amp; News</a></li>
            <li><a href="faqs.html">FAQs</a></li>
            <li><a href="contact.html">Contact Us</a></li>
          </ul>
        </div>

        <!-- Contact -->
        <div class="footer-col">
          <h4>Contact Us</h4>
          <div class="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>28-A, Block A Naz Town, near Valencia Town, Lahore</span>
          </div>
          <div class="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.9 9.9 0 004.62 1.14h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2z"/></svg>
            <span>+92 339 5192800</span>
          </div>
          <div class="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Open 24 Hours · 7 Days a Week</span>
          </div>
          <div class="footer-contact-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 12"/></svg>
            <span><a href="tel:+923395192800">Call: +92 339 5192800</a></span>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} Sunny Dental Surgery. All rights reserved.</p>
        <div class="footer-legal">
          <a href="privacy.html">Privacy Policy</a>
          <a href="terms.html">Terms &amp; Conditions</a>
        </div>
      </div>
    </div>
  </footer>
  <!-- Floating WhatsApp -->
  <a href="${WA_LINK}" class="fab-wa" target="_blank" rel="noopener" title="Chat on WhatsApp" id="fabWa">
    <div class="fab-pulse"></div>
    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.9 9.9 0 004.62 1.14h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.12-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.68-.17 1.35z"/></svg>
  </a>

  <!-- Back to Top -->
  <button class="back-top" id="backTop" aria-label="Back to top">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
  </button>`;

  const BOOKING_MODAL_HTML = `
  <!-- QUICK APPOINTMENT MODAL -->
  <div id="quick-booking-modal" class="booking-modal-overlay" aria-hidden="true" role="dialog">
    <div class="booking-modal">
      <div class="booking-modal-header">
        <h3>Contact via WhatsApp</h3>
        <button class="booking-modal-close" id="closeBookingModal" aria-label="Close booking modal">&times;</button>
      </div>
      <div class="booking-modal-body">
        <p class="modal-subtitle">Fill in your details and we'll send a pre-filled message to WhatsApp</p>
        <form id="quickBookingForm">
          <div class="form-row">
            <div class="form-group">
              <label for="qbName">FULL NAME <span>*</span></label>
              <input type="text" id="qbName" class="form-input" placeholder="Your full name" required>
            </div>
            <div class="form-group">
              <label for="qbMobile">PHONE <span>*</span></label>
              <input type="tel" id="qbMobile" class="form-input" placeholder="0300-0000000" required>
            </div>
          </div>
          <div class="form-group">
            <label for="qbService">SELECT SERVICE <span>*</span></label>
            <select id="qbService" class="form-select" required>
              <option value="" disabled selected>Select Treatment</option>
              <option value="General & Preventive">General & Preventive</option>
              <option value="Cosmetic Dentistry">Cosmetic Dentistry</option>
              <option value="Dental Implants">Dental Implants</option>
              <option value="Orthodontics & Braces">Orthodontics & Braces</option>
              <option value="Root Canal Treatment">Root Canal Treatment</option>
              <option value="Emergency Dentistry">Emergency Dentistry</option>
              <option value="Paediatric Dentistry">Paediatric Dentistry</option>
              <option value="Other">Other Concern</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="qbDate">PREFERRED DATE <span>*</span></label>
              <input type="date" id="qbDate" class="form-input" required>
            </div>
            <div class="form-group">
              <label for="qbTime">TIME (10 AM - 12 PM) <span>*</span></label>
              <input type="time" id="qbTime" class="form-input" required>
            </div>
          </div>
          <button type="submit" class="btn btn-pink w-full">
            <svg viewBox="0 0 24 24" fill="currentColor" style="width:18px;height:18px;margin-right:8px;"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.9 9.9 0 004.62 1.14h.01c5.46 0 9.9-4.45 9.9-9.91C21.96 6.45 17.5 2 12.04 2zm5.8 14.03c-.24.68-1.4 1.32-1.93 1.4-.5.08-1.12.11-1.8-.12-.42-.13-.95-.31-1.64-.6-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.17-1.56-1.17-2.98 0-1.42.74-2.11 1-2.4.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.94 1.23 2.22 1.37.28.14.44.12.6-.07.17-.19.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.66.78 1.94.92.28.14.47.21.54.33.07.12.07.68-.17 1.35z"/></svg>
            Send via WhatsApp
          </button>
        </form>
      </div>
    </div>
  </div>`;

  // Inject on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    const body = document.body;
    const firstChild = body.firstChild;
    
    // Inject NAV
    const navDiv = document.createElement('div');
    navDiv.innerHTML = NAV_HTML;
    body.insertBefore(navDiv, firstChild);

    // Inject FOOTER + MODAL
    const footerDiv = document.createElement('div');
    footerDiv.innerHTML = FOOTER_HTML + BOOKING_MODAL_HTML;
    body.appendChild(footerDiv);

    // Set nav style based on page meta
    const navEl = document.getElementById('mainNav');
    const isInnerPage = body.dataset.page !== 'home';
    if (isInnerPage && navEl) {
      navEl.dataset.style = 'white';
      navEl.classList.remove('transparent');
      navEl.classList.add('white');
    }
  });
})();
