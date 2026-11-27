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

  const localFile = location.protocol === 'file:';
  if (localFile) {
    for (const link of document.querySelectorAll('a[href]')) {
      const href = link.getAttribute('href');
      const [path, fragment] = href.split('#');
      if (path.endsWith('/') && new URL(href, location.href).protocol === 'file:') {
        link.setAttribute('href', path + 'index.html' + (fragment ? '#' + fragment : ''));
      }
    }
  }

  const view = document.body.dataset.view;
  const links = [...navigation.querySelectorAll('a')];
  const header = document.querySelector('.site-header');
  const contact = document.getElementById('contact');
  const homeSections = [
    ['what-i-do', 1], ['work', 2], ['about-preview', 3],
  ].map(([id, index]) => [document.getElementById(id), index]);

  let activeIndex = -1;
  function markActive() {
    let index = view === 'about-me' ? 3 : view === 'projects' || view.startsWith('project-') ? 2 : 0;
    const threshold = Math.max(header.getBoundingClientRect().bottom + 32, window.innerHeight / 3);
    if (view === 'home') {
      for (const [section, item] of homeSections) {
        if (section && section.getBoundingClientRect().top <= threshold) index = item;
      }
    }
    const contactTop = contact.getBoundingClientRect().top;
    const atBottom = window.scrollY > 0 && window.scrollY + window.innerHeight >= document.scrollingElement.scrollHeight - 4;
    if (contactTop <= threshold || (atBottom && contactTop < window.innerHeight)) index = 4;

    if (index === activeIndex) return;
    activeIndex = index;
    links.forEach((link, item) => {
      if (item === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  window.addEventListener('scroll', markActive, {passive: true});
  window.addEventListener('resize', markActive);
  window.addEventListener('hashchange', markActive);
  window.addEventListener('load', markActive);
  markActive();

  const legacyRoutes = {"#about-me": "about/", "#project-aas": "projects/academic-advising-system/", "#project-uniquestion": "projects/uniquestion/", "#project-vocabflow": "projects/vocabflow/", "#project-journal": "projects/journal-indexing-web-app/", "#project-cafe": "projects/cafe-bun-alarab/", "#project-pizza": "projects/pizza-lab/", "#project-bella": "projects/bella-pasta/", "#project-skyora": "projects/skyora/"};
  function redirectLegacyRoute() {
    if (view !== 'home') return;
    const route = legacyRoutes[location.hash];
    if (route) location.replace(localFile ? route + 'index.html' : route);
  }
  window.addEventListener('hashchange', redirectLegacyRoute);
  redirectLegacyRoute();
})();

(() => {
  'use strict';
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!('IntersectionObserver' in window)) return;
  const targets = Array.from(document.querySelectorAll([
    '.hero-copy > :not(.hero-media)', '.page-heading > *', '.section-heading h2',
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
        const siblings = Array.from(element.parentElement.children).filter(sibling => !sibling.classList.contains('hero-media'));
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

(() => {
  'use strict';
  const source = document.querySelector('[data-profile-content]');
  const profile = window.portfolioProfile;
  if (!source || !profile) return;

  const siteRoot = new URL('.', source.src);
  const language = document.documentElement.lang === 'ar' ? 'ar' : 'en';

  function resolveLink(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim(), siteRoot);
      if (url.href.startsWith(siteRoot.href) || ['http:', 'https:'].includes(url.protocol)) return url;
    } catch (_) {
      return null;
    }
    return null;
  }

  const cv = resolveLink(profile.cvPdf);
  if (cv && /\.pdf$/i.test(cv.pathname)) {
    for (const link of document.querySelectorAll('[data-cv-download]')) {
      link.href = cv.href;
      link.hidden = false;
    }
  }

  if (!Array.isArray(profile.certificates)) return;
  const svgNamespace = 'http://www.w3.org/2000/svg';
  const localized = value => value?.[language] || value?.en || value?.ar;

  for (const section of document.querySelectorAll('[data-credential-group]')) {
    const group = section.dataset.credentialGroup;
    const certificates = profile.certificates.filter(certificate =>
      (certificate?.group || 'certificate') === group &&
      typeof localized(certificate?.title) === 'string' && localized(certificate.title).trim()
    );
    if (!certificates.length) continue;

    const isLearning = group === 'learning';
    const issuers = new Set(certificates.map(certificate => certificate.issuer));
    const sharedIssuer = !isLearning && issuers.size === 1 ? certificates[0].issuer : '';
    if (!isLearning) {
      if (sharedIssuer) {
        const heading = section.querySelector('[data-credential-issuer]');
        heading.textContent = sharedIssuer;
        heading.hidden = false;
      }
      if (sharedIssuer !== 'Cisco Networking Academy') {
        section.querySelector('h2').textContent = language === 'ar' ? 'الشهادات' : 'Certificates';
      }
    }

    const list = section.querySelector('[data-certificate-list]');
    for (const certificate of certificates) {
      const item = document.createElement('li');
      if (!isLearning) {
        const icon = document.createElementNS(svgNamespace, 'svg');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.setAttribute('aria-hidden', 'true');
        const shape = document.createElementNS(svgNamespace, 'use');
        shape.setAttribute('href', certificate.icon === 'network' ? '#icon-network' : '#icon-shield');
        icon.append(shape);
        item.append(icon);
      }

      const copy = document.createElement('div');
      const name = document.createElement('bdi');
      name.className = 'certificate-name';
      name.textContent = localized(certificate.title);
      copy.append(name);

      const description = localized(certificate.description) || (!sharedIssuer ? certificate.issuer : '');
      if (description) {
        const note = document.createElement('p');
        note.className = 'muted credential-description';
        note.textContent = description;
        copy.append(note);
      }

      const destination = resolveLink(certificate.url);
      if (destination) {
        const link = document.createElement('a');
        link.className = 'profile-certificate-link';
        link.href = destination.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = language === 'ar' ? 'التحقّق من الشهادة' : 'Verify certificate';
        copy.append(link);
      }
      item.append(copy);
      list.append(item);
    }
    section.hidden = false;
  }
})();
