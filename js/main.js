/* ==========================================================================
   CNAB main.js
   - Mobile nav toggle (with backdrop)
   - Sticky header scroll effect
   - Active nav link highlighting (based on current filename)
   - Dynamic footer year
   - Smooth scroll for in-page anchors
   - IntersectionObserver reveal animations
   - Dropdown keyboard/accessibility support
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initMobileNav();
    initStickyHeader();
    initMoreNav();
    initActiveLink();
    initBackgroundImages();
    initFooterYear();
    initSmoothScroll();
    initRevealAnimations();
    initDropdowns();
  }

  /* ---------- Background images from HTML ---------- */
  function initBackgroundImages() {
    document.querySelectorAll('[data-bg-url]').forEach(function (element) {
      const imageUrl = element.getAttribute('data-bg-url');
      if (!imageUrl) return;
      element.style.setProperty('--banner-bg-image', `url('${imageUrl}')`);
    });
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.primary-nav');
    const backdrop = document.querySelector('.nav-backdrop');
    if (!toggle || !nav) return;

    function openNav() {
      toggle.setAttribute('aria-expanded', 'true');
      nav.classList.add('open');
      if (backdrop) backdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeNav() {
      toggle.setAttribute('aria-expanded', 'false');
      nav.classList.remove('open');
      if (backdrop) backdrop.classList.remove('open');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeNav() : openNav();
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeNav);
    }

    // Close nav when a link is clicked (mobile)
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 960) closeNav();
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) closeNav();
    });

    // Reset on resize
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 960) closeNav();
    });
  }

  /* ---------- Sticky header shadow ---------- */
  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    function onScroll() {
      if (window.scrollY > 8) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Compact desktop navigation ---------- */
  function initMoreNav() {
    const navList = document.querySelector('.nav-list');
    if (!navList) return;

    const items = Array.from(navList.querySelectorAll(':scope > .nav-item'));
    const visibleCount = 5;
    const existingMore = navList.querySelector('.more-nav');

    function resetNav() {
      if (existingMore) existingMore.remove();
      items.forEach(function (item) {
        if (item.classList.contains('more-nav')) return;
        item.style.display = '';
      });
    }

    if (window.innerWidth < 960 || items.length <= visibleCount) {
      resetNav();
      return;
    }

    const hiddenItems = items.slice(visibleCount);
    hiddenItems.forEach(function (item) {
      item.style.display = 'none';
    });

    if (existingMore) {
      const dropdown = existingMore.querySelector('.dropdown');
      if (dropdown) {
        dropdown.innerHTML = '';
        hiddenItems.forEach(function (item) {
          const clone = item.cloneNode(true);
          clone.style.display = '';
          dropdown.appendChild(clone);
        });
      }
      return;
    }

    const moreItem = document.createElement('li');
    moreItem.className = 'nav-item has-dropdown more-nav';
    moreItem.innerHTML = '<button class="nav-link" aria-haspopup="true" aria-expanded="false">More</button><ul class="dropdown" role="menu"></ul>';
    const dropdown = moreItem.querySelector('.dropdown');
    hiddenItems.forEach(function (item) {
      const clone = item.cloneNode(true);
      clone.style.display = '';
      dropdown.appendChild(clone);
    });

    const insertAfter = items[visibleCount - 1];
    if (insertAfter && insertAfter.parentNode === navList) {
      insertAfter.insertAdjacentElement('afterend', moreItem);
    } else {
      navList.appendChild(moreItem);
    }

    window.addEventListener('resize', function () {
      initMoreNav();
    });
  }

  /* ---------- Active nav link ---------- */
  function initActiveLink() {
    const path = window.location.pathname;
    const file = path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    const links = document.querySelectorAll('.nav-list a');
    links.forEach(function (link) {
      const href = link.getAttribute('href');
      if (!href) return;
      const linkFile = href.substring(href.lastIndexOf('/') + 1);
      if (linkFile === file) {
        link.classList.add('active');
        // Also mark parent dropdown trigger if any
        const parentItem = link.closest('.nav-item.has-dropdown');
        if (parentItem) {
          const trigger = parentItem.querySelector(':scope > .nav-link');
          if (trigger) trigger.classList.add('active');
        }
      }
    });
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Smooth scroll for #anchors ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const href = anchor.getAttribute('href');
        if (href.length <= 1) return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const headerOffset = 80;
        const y = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      });
    });
  }

  /* ---------- Reveal animations ---------- */
  function initRevealAnimations() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('visible'); });
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Dropdowns (desktop hover + mobile toggle + keyboard) ---------- */
  function initDropdowns() {
    const dropdowns = document.querySelectorAll('.nav-item.has-dropdown');
    dropdowns.forEach(function (item) {
      const trigger = item.querySelector(':scope > .nav-link');
      if (!trigger) return;

      // Mobile: toggle on click
      trigger.addEventListener('click', function (e) {
        if (window.innerWidth < 960) {
          e.preventDefault();
          const isOpen = item.classList.contains('open');
          // close others
          dropdowns.forEach(function (d) { d.classList.remove('open'); });
          if (!isOpen) item.classList.add('open');
        }
      });

      // Keyboard: Enter/Space to open, Escape to close
      trigger.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          if (window.innerWidth >= 960) {
            e.preventDefault();
            const firstLink = item.querySelector('.dropdown a');
            if (firstLink) firstLink.focus();
          }
        }
        if (e.key === 'Escape') {
          item.classList.remove('open');
          trigger.focus();
        }
      });
    });

    // Close dropdowns when clicking outside (desktop)
    document.addEventListener('click', function (e) {
      if (window.innerWidth >= 960) return;
      if (!e.target.closest('.nav-item.has-dropdown')) {
        dropdowns.forEach(function (d) { d.classList.remove('open'); });
      }
    });
  }
})();