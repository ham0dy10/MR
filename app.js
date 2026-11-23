(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');
  const navigation = document.querySelector('.navigation');
  const toggle = document.querySelector('.menu-toggle');
  const arabic = document.documentElement.lang === 'ar';
  const labels = arabic ? ['فتح القائمة', 'إغلاق القائمة'] : ['Open navigation', 'Close navigation'];

  function setMenu(open) {
    navigation.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', labels[Number(open)]);
  }

  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });

  const view = document.body.dataset.view;
  const links = [...navigation.querySelectorAll('a')];
  function markActive() {
    let index = view === 'about-me' ? 3 : view.startsWith('project-') ? 2 : 0;
    if (view === 'home') {
      for (const [id, item] of [['what-i-do', 1], ['work', 2], ['about-preview', 3]]) {
        if (document.getElementById(id).getBoundingClientRect().top <= 200) index = item;
      }
    }
    if (document.getElementById('contact').getBoundingClientRect().top <= 200) index = 4;
    links.forEach((link, item) => {
      if (item === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', markActive, {passive: true});
  window.addEventListener('resize', markActive);
  markActive();

  const legacyRoutes = {"#about-me": "about/", "#project-aas": "projects/academic-advising-system/", "#project-uniquestion": "projects/uniquestion/", "#project-vocabflow": "projects/vocabflow/", "#project-journal": "projects/journal-indexing-web-app/", "#project-cafe": "projects/cafe-bun-alarab/", "#project-pizza": "projects/pizza-lab/", "#project-bella": "projects/bella-pasta/", "#project-skyora": "projects/skyora/"};
  function redirectLegacyRoute() {
    if (view !== 'home') return;
    const route = legacyRoutes[location.hash];
    if (route) location.replace(route + 'index.html');
  }
  window.addEventListener('hashchange', redirectLegacyRoute);
  redirectLegacyRoute();
})();

(() => {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window)) return;
  const targets = Array.from(document.querySelectorAll([
    '.hero-copy > *', '.page-heading > *', '.section-heading h2',
    '.service', '.process > h2', '.process-grid article',
    '.project-visual', '.project-copy > *', '.work-note',
    '.about-photo', '.about-copy > *', '.profile-photo', '.profile-copy > *',
    '.about-facts > section', '.case-visual', '.case-section',
    '.case-aside > section', '.case-next', '.contact-intro', '.contact-socials',
    '.footer-bottom'
  ].join(',')));
  let observer;
  const reveal = element => {
    element.classList.remove('motion-pending');
    element.classList.add('motion-visible');
    if (observer) observer.unobserve(element);
  };
  const showAll = () => {
    if (observer) observer.disconnect();
    targets.forEach(element => element.classList.remove('motion-pending', 'motion-visible'));
  };
  function start() {
    showAll();
    if (preference.matches) return;
    try {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
      }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
      targets.forEach(element => {
        const siblings = Array.from(element.parentElement.children);
        const index = siblings.indexOf(element);
        element.style.setProperty('--motion-delay', `${Math.min(index % 4, 3) * 55}ms`);
        element.classList.add('motion-pending');
        observer.observe(element);
      });
    } catch (_) { showAll(); }
  }
  // Keyboard navigation must never leave the focused content invisible.
  document.addEventListener('focusin', event => {
    let element = event.target;
    while (element && element !== document.body) {
      if (element.classList.contains('motion-pending')) reveal(element);
      element = element.parentElement;
    }
  });
  // Hash routes can reveal content that was originally in a hidden view.
  window.addEventListener('portfolio:route', () => {
    requestAnimationFrame(() => {
      if (preference.matches) return;
      targets.forEach(element => {
        if (!element.classList.contains('motion-pending') || !element.getClientRects().length) return;
        const rect = element.getBoundingClientRect();
        if (rect.bottom >= 0 && rect.top < window.innerHeight - 24) reveal(element);
      });
    });
  });
  preference.addEventListener('change', start);
  window.addEventListener('beforeprint', showAll);
  // Content stays visible in print, including on browsers without beforeprint.
  window.addEventListener('pageshow', event => { if (event.persisted) showAll(); });
  start();
})();
