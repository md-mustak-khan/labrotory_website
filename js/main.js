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
    document.querySelectorAll('[data-bg-url],[data-bg-urls]').forEach(function (element) {
      const multi = element.getAttribute('data-bg-urls');
      const single = element.getAttribute('data-bg-url');
      if (multi) {
        const urls = multi.split(',').map(function (value) {
          return value.trim();
        }).filter(Boolean);
        if (!urls.length) return;

        element.classList.add('hero-slider');
        const wrapper = document.createElement('div');
        wrapper.className = 'hero-slider-bg-wrapper';

        const currentBg = document.createElement('div');
        currentBg.className = 'hero-slider-bg hero-slider-bg-current';
        currentBg.style.backgroundImage = "url('" + urls[0] + "')";

        const nextBg = document.createElement('div');
        nextBg.className = 'hero-slider-bg hero-slider-bg-next';
        nextBg.style.backgroundImage = "url('" + urls[0] + "')";

        wrapper.appendChild(currentBg);
        wrapper.appendChild(nextBg);
        element.insertBefore(wrapper, element.firstChild);

        let currentIndex = 0;
        setInterval(function () {
          const nextIndex = (currentIndex + 1) % urls.length;
          nextBg.style.backgroundImage = "url('" + urls[nextIndex] + "')";
          nextBg.classList.add('visible');

          window.setTimeout(function () {
            currentBg.style.backgroundImage = nextBg.style.backgroundImage;
            nextBg.classList.remove('visible');
            currentIndex = nextIndex;
          }, 900);
        }, 6000);

        return;
      }
      if (!single) return;
      element.style.setProperty('--banner-bg-image', "url('" + single + "')");
    });
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.primary-nav');
    const backdrop = document.querySelector('.nav-backdrop');
    if (!toggle || !nav) return;

    // Debug: expose a small nav state logger if console available
    function logNavState(prefix) {
      try {
        const vw = window.innerWidth;
        const items = Array.from(nav.querySelectorAll('.nav-list > .nav-item'));
        const visible = items.filter(i => (i.style.display !== 'none'));
        console.debug('[nav-debug]', prefix, { vw: vw, navScroll: nav.scrollTop, itemsTotal: items.length, itemsVisible: visible.length, moreExists: !!nav.querySelector('.more-nav') });
      } catch (e) { /* ignore */ }
    }

    function setNavState(isOpen) {
      // update aria and open class, let CSS handle positioning and transitions
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      nav.classList.toggle('open', isOpen);
      if (backdrop) backdrop.classList.toggle('open', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
      // ensure mobile close button is visible when open
      const navClose = nav.querySelector('.nav-close');
      if (navClose) navClose.style.display = isOpen ? 'flex' : 'none';
      logNavState(isOpen ? 'open-after-class' : 'closed-after-class');
    }

    function openNav() {
      logNavState('open-before');
      setNavState(true);
      // keep the menu anchored at the top so the full page list can be scrolled smoothly on mobile
      function doTopAndFocus() {
        try {
          try { if (document.activeElement && typeof document.activeElement.blur === 'function') document.activeElement.blur(); } catch (e) {}
          try {
            const inner = nav.querySelector('.nav-list');
            if (inner && 'scrollTop' in inner) {
              inner.style.scrollBehavior = 'auto';
              inner.scrollTop = 0;
              inner.style.scrollBehavior = '';
            }
            if ('scrollTop' in nav) {
              nav.style.scrollBehavior = 'auto';
              nav.scrollTop = 0;
              nav.style.scrollBehavior = '';
            }
          } catch (err) { /* ignore */ }
        } catch (e) { /* ignore */ }
      }

      // fallback timer in case transitionend doesn't fire
      const fallback = setTimeout(doTopAndFocus, 140);
      function onTransition(e) {
        // only run when the nav's position changed (left)
        if (e.propertyName && e.propertyName.indexOf('left') === -1 && e.propertyName.indexOf('transform') === -1) return;
        clearTimeout(fallback);
        doTopAndFocus();
      }
      nav.addEventListener('transitionend', function (e) { onTransition(e); logNavState('open-after-transition'); }, { once: true });
    }
    function closeNav() {
      setNavState(false);
    }

    // ensure a mobile-only nav close button exists; add/remove on resize
    (function ensureNavClose() {
      function createClose() {
        if (nav.querySelector('.nav-close')) return;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'nav-close';
        btn.setAttribute('aria-label', 'Close navigation');
        btn.innerHTML = '&times;';
        btn.style.display = 'none';
        btn.addEventListener('click', closeNav);
        nav.insertBefore(btn, nav.firstChild);
      }
      function removeClose() {
        const existing = nav.querySelector('.nav-close');
        if (existing) existing.remove();
      }

      function update() {
        if (window.innerWidth < 960) createClose(); else removeClose();
      }
      update();
      window.addEventListener('resize', update);
    })();

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
      if (window.innerWidth >= 960) {
        closeNav();
      } else {
        setNavState(nav.classList.contains('open'));
      }
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
    // Use matchMedia for reliable breakpoint checks and don't collapse on mobile
    const isDesktop = window.matchMedia('(min-width: 960px)').matches;
    const visibleCount = isDesktop ? 5 : 999;
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

    // add a single resize listener to recompute nav behaviour
    if (!initMoreNav._listening) {
      window.addEventListener('resize', initMoreNav);
      initMoreNav._listening = true;
    }
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

  /* ---------- Custom pointer (desktop only) ---------- */
  function initCustomCursor() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    try {
      document.body.classList.add('custom-cursor-enabled');
      const cursor = document.createElement('div');
      cursor.className = 'custom-cursor';
      cursor.style.pointerEvents = 'none';
      cursor.style.opacity = '0';

      const ring = document.createElement('div');
      ring.className = 'ring';
      const dot = document.createElement('div');
      dot.className = 'dot';

      cursor.appendChild(ring);
      cursor.appendChild(dot);
      document.body.appendChild(cursor);

      let mouseX = window.innerWidth / 2;
      let mouseY = window.innerHeight / 2;
      let posX = mouseX;
      let posY = mouseY;

      function update() {
        posX += (mouseX - posX) * 0.18;
        posY += (mouseY - posY) * 0.18;
        cursor.style.left = posX + 'px';
        cursor.style.top = posY + 'px';
        requestAnimationFrame(update);
      }
      requestAnimationFrame(update);

      document.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursor.style.opacity = '1';
      }, { passive: true });

      document.addEventListener('mouseleave', function () { cursor.classList.add('hidden'); });
      document.addEventListener('mouseenter', function () { cursor.classList.remove('hidden'); cursor.style.opacity = ''; });

      const interactiveSelector = 'a, button, input, textarea, select, .btn, .gallery-item';
      document.addEventListener('mouseover', function (e) {
        if (e.target.closest(interactiveSelector)) cursor.classList.add('interact');
      });
      document.addEventListener('mouseout', function (e) {
        if (e.target.closest(interactiveSelector)) cursor.classList.remove('interact');
      });
    } catch (err) {
      console.error('Custom cursor init failed', err);
    }
  }

  // initialize cursor after other inits
  if (typeof initCustomCursor === 'function') initCustomCursor();
})();