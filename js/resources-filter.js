document.addEventListener('DOMContentLoaded', function() {
  const categoryButtons = Array.from(document.querySelectorAll('.category-btn'));
  const resourceItems = Array.from(document.querySelectorAll('.resource-group'));

  function getActiveCategory(){
    const active = categoryButtons.find(b=>b.classList.contains('active'));
    return active ? active.getAttribute('data-category') : 'all';
  }

  function filterResources(){
    const activeCategory = getActiveCategory();
    resourceItems.forEach(item => {
      const matchesCategory = (activeCategory === 'all') || item.classList.contains(activeCategory);
      item.style.display = matchesCategory ? '' : 'none';
    });
  }

  // Wire category buttons
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryButtons.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      filterResources();
    });
  });

  // initial filter
  filterResources();
});
