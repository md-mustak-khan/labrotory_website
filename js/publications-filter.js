/* ==========================================================================
   Publications filter
   - Live search (title / authors / journal)
   - Filter by lab (all / lab1 / lab2)
   - Filter by year
   ========================================================================== */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    const searchInput = document.getElementById('pub-search');
    const labFilter = document.getElementById('pub-lab-filter');
    const yearFilter = document.getElementById('pub-year-filter');
    const list = document.getElementById('pub-list');
    const countEl = document.getElementById('pub-count');
    const emptyEl = document.getElementById('pub-empty');

    if (!list) return;

    const items = Array.from(list.querySelectorAll('.pub-item'));

    function applyFilters() {
      const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
      const lab = labFilter ? labFilter.value : 'all';
      const year = yearFilter ? yearFilter.value : 'all';

      let visible = 0;
      items.forEach(function (item) {
        const itemLab = item.dataset.lab || '';
        const itemYear = item.dataset.year || '';
        const text = (item.dataset.search || '').toLowerCase();

        const matchesLab = lab === 'all' || itemLab === lab;
        const matchesYear = year === 'all' || itemYear === year;
        const matchesQuery = !query || text.indexOf(query) !== -1;

        const show = matchesLab && matchesYear && matchesQuery;
        item.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      if (countEl) countEl.textContent = visible;
      if (emptyEl) emptyEl.style.display = visible === 0 ? 'block' : 'none';
    }

    [searchInput, labFilter, yearFilter].forEach(function (el) {
      if (!el) return;
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    });

    // Initial
    applyFilters();
  });
})();