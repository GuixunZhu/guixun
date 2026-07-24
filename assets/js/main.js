(() => {
  'use strict';

  const html = document.documentElement;
  const body = document.body;
  const config = window.GZ_SITE_CONFIG || {};

  const safeStorage = {
    get(key) {
      try { return localStorage.getItem(key); } catch (_) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (_) {}
    }
  };

  function setLanguage(language, persist = true) {
    const lang = language === 'en' ? 'en' : 'zh';
    html.dataset.lang = lang;
    html.lang = lang === 'zh' ? 'zh-CN' : 'en';

    const languageButton = document.querySelector('.language-toggle');
    if (languageButton) {
      languageButton.setAttribute('aria-pressed', String(lang === 'en'));
      languageButton.setAttribute(
        'aria-label',
        lang === 'zh' ? 'Switch to English' : '切换到中文'
      );
    }

    document.title = lang === 'zh'
      ? '朱贵勋 · Guixun Zhu | 计算海洋水动力学与海洋可再生能源'
      : 'Guixun Zhu · 朱贵勋 | Computational Marine Hydrodynamics & Renewable Energy';

    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.content = lang === 'zh'
        ? '朱贵勋（Guixun Zhu）的个人学术主页：计算流体力学、光滑粒子流体动力学、强非线性水波、波浪—结构相互作用、海洋可再生能源与物理智能。'
        : 'Academic homepage of Guixun Zhu: computational fluid dynamics, smoothed particle hydrodynamics, nonlinear water waves, wave–structure interaction, marine renewable energy and physics-informed AI.';
    }

    if (persist) safeStorage.set('gz-lang', lang);
  }

  function setTheme(theme, persist = true) {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    html.dataset.theme = nextTheme;
    const button = document.querySelector('.theme-toggle');
    if (button) {
      button.setAttribute('aria-pressed', String(nextTheme === 'dark'));
      button.setAttribute(
        'aria-label',
        nextTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) themeMeta.content = nextTheme === 'dark' ? '#071821' : '#073b57';
    if (persist) safeStorage.set('gz-theme', nextTheme);
  }

  setLanguage(html.dataset.lang || safeStorage.get('gz-lang') || 'zh', false);
  setTheme(html.dataset.theme || safeStorage.get('gz-theme') || 'light', false);

  document.querySelector('.language-toggle')?.addEventListener('click', () => {
    setLanguage(html.dataset.lang === 'zh' ? 'en' : 'zh');
  });

  document.querySelector('.theme-toggle')?.addEventListener('click', () => {
    setTheme(html.dataset.theme === 'dark' ? 'light' : 'dark');
  });

  const colourScheme = window.matchMedia?.('(prefers-color-scheme: dark)');
  colourScheme?.addEventListener?.('change', (event) => {
    if (!safeStorage.get('gz-theme')) setTheme(event.matches ? 'dark' : 'light', false);
  });

  document.querySelectorAll('[data-affiliation-zh]').forEach((element) => {
    if (config.affiliationZh) element.textContent = config.affiliationZh;
  });
  document.querySelectorAll('[data-affiliation-en]').forEach((element) => {
    if (config.affiliationEn) element.textContent = config.affiliationEn;
  });

  function revealContact(type, href, value) {
    if (!href) return;
    const element = document.querySelector(`[data-contact="${type}"]`);
    if (!element) return;
    element.href = href;
    const valueNode = element.querySelector('[data-contact-value]');
    if (valueNode && value) valueNode.textContent = value;
    element.hidden = false;
  }

  const email = String(config.email || '').trim();
  if (email) revealContact('email', `mailto:${email}`, email);

  let githubUsername = String(config.githubUsername || '').trim().replace(/^@/, '');
  if (!githubUsername && location.hostname.endsWith('.github.io')) {
    githubUsername = location.hostname.split('.')[0];
  }
  if (githubUsername && !/^your[_-]?username$/i.test(githubUsername)) {
    revealContact('github', `https://github.com/${encodeURIComponent(githubUsername)}`, `@${githubUsername}`);
  }

  const scholarUrl = String(config.googleScholarUrl || '').trim();
  if (scholarUrl) revealContact('scholar', scholarUrl);

  const orcidUrl = String(config.orcidUrl || '').trim();
  if (orcidUrl) {
    const orcidId = orcidUrl.match(/\d{4}-\d{4}-\d{4}-\d{3}[\dX]/i)?.[0] || 'ORCID';
    revealContact('orcid', orcidUrl, orcidId);
  }

  const researchGateUrl = String(config.researchGateUrl || '').trim();
  if (researchGateUrl) revealContact('researchgate', researchGateUrl);

  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');

  function closeNavigation() {
    body.classList.remove('nav-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  }

  navToggle?.addEventListener('click', () => {
    const open = !body.classList.contains('nav-open');
    body.classList.toggle('nav-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  });

  siteNav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeNavigation);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeNavigation();
  });

  document.addEventListener('click', (event) => {
    if (!body.classList.contains('nav-open')) return;
    if (siteNav?.contains(event.target) || navToggle?.contains(event.target)) return;
    closeNavigation();
  });

  const publicationToggle = document.getElementById('publications-toggle');
  const extraPublications = [...document.querySelectorAll('.publication-item.is-extra')];
  publicationToggle?.addEventListener('click', () => {
    const expanded = publicationToggle.getAttribute('aria-expanded') === 'true';
    publicationToggle.setAttribute('aria-expanded', String(!expanded));
    extraPublications.forEach((publication) => {
      publication.classList.toggle('is-visible', !expanded);
      if (!expanded) requestAnimationFrame(() => publication.classList.add('is-revealed'));
    });
    if (expanded) {
      document.getElementById('publications')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const revealElements = [...document.querySelectorAll('.reveal')];

  if (!reducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });

    revealElements.forEach((element) => {
      if (!element.classList.contains('is-extra')) revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => element.classList.add('is-revealed'));
  }

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];

  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        const active = link.getAttribute('href') === `#${visible.target.id}`;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0.05, 0.25, 0.5] });
    sections.forEach((section) => activeObserver.observe(section));
  }

  const header = document.querySelector('.site-header');
  const backToTop = document.querySelector('.back-to-top');

  function updateScrollState() {
    const scrolled = window.scrollY > 24;
    header?.classList.toggle('is-scrolled', scrolled);
    backToTop?.classList.toggle('is-visible', window.scrollY > 650);
  }

  updateScrollState();
  window.addEventListener('scroll', updateScrollState, { passive: true });

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  });

  const year = document.getElementById('current-year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
