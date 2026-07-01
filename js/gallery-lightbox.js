/* ==========================================================================
   Gallery lightbox
   - Click a .gallery-item to open
   - Close: X button, backdrop click, Esc key
   - Navigate: prev / next buttons, arrow keys
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const gallery = document.querySelector('.gallery-grid');
    const lightbox = document.getElementById('lightbox');
    if (!gallery || !lightbox) return;

    const mediaEl = lightbox.querySelector('.lightbox-media');
    const titleEl = lightbox.querySelector('.lightbox-title');
    const descEl = lightbox.querySelector('.lightbox-desc');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');

    const items = Array.from(gallery.querySelectorAll('.gallery-item'));
    let currentIndex = 0;
    let lastFocused = null;

    function openLightbox(index) {
      currentIndex = index;
      render();
      lightbox.classList.add('open');
      lastFocused = document.activeElement;
      document.body.style.overflow = 'hidden';
      if (closeBtn) closeBtn.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    function render() {
      const item = items[currentIndex];
      if (!item) return;
      const img = item.querySelector('img');
      const src = item.dataset.src || (img ? img.src : '');
      const alt = item.dataset.alt || (img ? img.alt : '');
      const title = item.dataset.title || alt || '';
      const desc = item.dataset.desc || '';
      const caption = item.dataset.caption || '';

      if (mediaEl) {
        mediaEl.innerHTML = '';
        if (src) {
          const fullImg = document.createElement('img');
          fullImg.src = src;
          fullImg.alt = alt;
          mediaEl.appendChild(fullImg);
        } else {
          mediaEl.textContent = caption || title || 'Image placeholder';
        }
      }
      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;
    }

    function next() {
      currentIndex = (currentIndex + 1) % items.length;
      render();
    }
    function prev() {
      currentIndex = (currentIndex - 1 + items.length) % items.length;
      render();
    }

    // Bind clicks on gallery items
    items.forEach(function (item, i) {
      item.setAttribute('tabindex', '0');
      item.setAttribute('role', 'button');
      item.setAttribute('aria-label', 'View image: ' + (item.dataset.title || ''));
      item.addEventListener('click', function () { openLightbox(i); });
      item.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(i);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // Backdrop click
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });
  });
})();