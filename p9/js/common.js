

(function (global, document) {
  'use strict';

  // Must match the CSS: the menu button is shown below 52em (832px).
  const DESKTOP_QUERY = '(min-width: 52em)';


  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const panel = document.getElementById('site-nav-panel');
    const header = document.getElementById('site-header');

    if (!toggle || !panel) {
      return; // This page has no menu. Nothing to do.
    }

    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function closeMenu(returnFocus) {
      if (!isOpen()) {
        return;
      }
      setOpen(false);
      if (returnFocus) {
        toggle.focus();
      }
    }

    // Button click (a <button> also handles Enter and Space by itself).
    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    // Escape closes the menu. If focus was inside it, send focus back to the button.
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape' || !isOpen()) {
        return;
      }
      const focusWasInside = header && header.contains(document.activeElement);
      closeMenu(focusWasInside);
    });

    // Clicking a link inside the menu closes it (useful if the link stays on the same page).
    panel.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        closeMenu(false);
      }
    });

    // Clicking anywhere outside the header closes the menu.
    document.addEventListener('click', function (event) {
      if (isOpen() && header && !header.contains(event.target)) {
        closeMenu(false);
      }
    });

    // Tabbing out of the header closes the menu so it does not stay open behind the page.
    if (header) {
      header.addEventListener('focusout', function (event) {
        const next = event.relatedTarget;
        if (isOpen() && next && !header.contains(next)) {
          closeMenu(false);
        }
      });
    }

    // If the window grows to desktop width, reset the button state.
    if (global.matchMedia) {
      const desktop = global.matchMedia(DESKTOP_QUERY);
      const onChange = function (event) {
        if (event.matches) {
          setOpen(false);
        }
      };
      if (desktop.addEventListener) {
        desktop.addEventListener('change', onChange);
      } else if (desktop.addListener) {
        desktop.addListener(onChange); // very old browsers
      }
    }
  }


 
  const PAGE_TO_NAV = {
    'home': 'home',
    'issues': 'issues',
    'issue-details': 'issues',
    'report': 'report',
    'impact': 'impact'
  };

  function getCurrentPageName() {
    const fromBody = document.body ? document.body.getAttribute('data-page') : '';
    if (fromBody) {
      return fromBody;
    }
    // Fallback: work it out from the file name in the address bar.
    const file = (global.location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (file === '' || file === 'index.html') { return 'home'; }
    return file.replace('.html', '');
  }

  function markActiveNavLink() {
    const page = getCurrentPageName();
    const activeKey = PAGE_TO_NAV[page];
    if (!activeKey) {
      return;
    }

    document.querySelectorAll('#site-nav [data-nav]').forEach(function (link) {
      if (link.getAttribute('data-nav') === activeKey) {
        link.setAttribute('aria-current', page === activeKey ? 'page' : 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }


  /* ------------------------------------------------------------------------
     3. Image fallbacks
        Images carry data-fallback-src="...". If the main image fails, we swap
        it once. The "error" event does not bubble, so we listen in the capture
        phase on the document - this also covers cards created later.
     ------------------------------------------------------------------------ */
  function useFallbackImage(image) {
    const fallback = image.getAttribute('data-fallback-src');
    if (!fallback || image.getAttribute('data-fallback-used') === 'true') {
      return; // no fallback defined, or we already tried it (prevents a loop)
    }
    image.setAttribute('data-fallback-used', 'true');
    if (image.getAttribute('src') !== fallback) {
      image.setAttribute('src', fallback);
    }
  }

  // Fix images that already failed before this script ran.
  function applyImageFallbacks(root) {
    const scope = root || document;
    scope.querySelectorAll('img[data-fallback-src]').forEach(function (image) {
      if (image.complete && image.naturalWidth === 0 && image.getAttribute('src')) {
        useFallbackImage(image);
      }
    });
  }

  function initImageFallbacks() {
    document.addEventListener('error', function (event) {
      const target = event.target;
      if (target && target.tagName === 'IMG') {
        useFallbackImage(target);
      }
    }, true);
    applyImageFallbacks(document);
  }


  /* ------------------------------------------------------------------------
     4. Skip link
        Some browsers scroll to #main-content but do not move keyboard focus.
        <main> has tabindex="-1", so we can focus it ourselves.
     ------------------------------------------------------------------------ */
  function initSkipLink() {
    const link = document.querySelector('.skip-link');
    const main = document.getElementById('main-content');
    if (!link || !main) {
      return;
    }
    link.addEventListener('click', function () {
      main.focus();
    });
  }


  /* ------------------------------------------------------------------------
     5. Helpers for the page scripts
     ------------------------------------------------------------------------ */

  // Reads ?name=value from the address bar. Returns "" when missing.
  function getQueryParam(name) {
    try {
      return new URLSearchParams(global.location.search).get(name) || '';
    } catch (error) {
      return '';
    }
  }

  // Swaps the colour class and the text on a badge element.
  //   type  = "severity" or "status"       value = e.g. "high" or "in-progress"
  function setBadge(element, type, value) {
    const data = global.CivicFixData;
    if (!element || !data) {
      return;
    }
    const allValues = (type === 'severity' ? data.SEVERITIES : data.STATUSES);
    allValues.forEach(function (item) {
      element.classList.remove('badge--' + item.value);
    });

    if (type === 'severity') {
      element.classList.add(data.getSeverityBadgeClass(value));
      element.textContent = data.getSeverityLabel(value);
    } else {
      element.classList.add(data.getStatusBadgeClass(value));
      element.textContent = data.getStatusLabel(value);
    }
  }

  // Each category has its own illustration in assets/images/. Unknown categories
  // get the generic placeholder, so a card never points at a missing file.
  const PLACEHOLDER_IMAGE = 'assets/images/issue-placeholder.svg';

  function getCategoryImage(category) {
    const data = global.CivicFixData;
    const known = data && Array.isArray(data.CATEGORIES) &&
      data.CATEGORIES.some(function (item) { return item.value === category; });
    return known ? 'assets/images/issue-' + category + '.svg' : PLACEHOLDER_IMAGE;
  }

  function setField(root, name, text) {
    const element = root.querySelector('[data-field="' + name + '"]');
    if (element) {
      element.textContent = text;
    }
    return element;
  }

 
  function createIssueCard(issue) {
    const data = global.CivicFixData;
    const template = document.getElementById('issue-card-template');
    if (!issue || !data || !template || !template.content.firstElementChild) {
      return null;
    }

    const item = template.content.firstElementChild.cloneNode(true);

    const card = item.querySelector('[data-issue-card]');
    if (card) {
      card.setAttribute('data-issue-id', issue.id);
      card.setAttribute('data-category', issue.category);
      card.setAttribute('data-severity', issue.severity);
      card.setAttribute('data-status', issue.status);
    }

    setField(item, 'category', data.getCategoryLabel(issue.category));
    setField(item, 'title', issue.title);
    setField(item, 'description', issue.description);
    setField(item, 'location', issue.location);
    setField(item, 'support-count', String(issue.supportCount));
    setField(item, 'details-link-title', issue.title);

    setBadge(item.querySelector('[data-field="severity"]'), 'severity', issue.severity);
    setBadge(item.querySelector('[data-field="status"]'), 'status', issue.status);

    const time = item.querySelector('time[data-field="date"]');
    if (time) {
      time.textContent = data.formatDate(issue.createdAt);
      time.setAttribute('datetime', data.toDateAttribute(issue.createdAt));
    }

    const image = item.querySelector('img[data-field="image"]');
    if (image) {
      if (issue.image) {
        image.setAttribute('src', issue.image);
        image.setAttribute('alt', 'Photo added by the reporter: ' + issue.title);
      } else {
        image.setAttribute('src', getCategoryImage(issue.category));
        image.setAttribute('alt', 'Illustration for ' +
           data.getCategoryLabel(issue.category) + ': ' + issue.title);
      }
    }

    const link = item.querySelector('[data-field="details-link"]');
    if (link) {
      link.setAttribute('href', 'issue-details.html?id=' + encodeURIComponent(issue.id));
    }

    return item;
  }


  
  const REVEAL_SELECTOR = [
    '.section-heading', '.stats-grid', '.category-list', '.steps-list', '.impact-points',
    '.issue-list--featured', '.issue-list--similar', '.cta-banner__inner',
    '.breakdown-list', '.ranking-list', '.activity-list', '.report-layout__aside',
    '.issue-detail__section'
  ].join(',');

  function initReveal() {
    if (!global.IntersectionObserver || !global.matchMedia ||
        global.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const targets = document.querySelectorAll(REVEAL_SELECTOR);
    if (targets.length === 0) {
      return;
    }
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    targets.forEach(function (element) {
      element.classList.add('reveal');
      observer.observe(element);
    });
    // Safety net: never leave content hidden if the observer is slow.
    global.setTimeout(function () {
      document.querySelectorAll('.reveal:not(.is-visible)').forEach(function (element) {
        const box = element.getBoundingClientRect();
        if (box.top < global.innerHeight) { element.classList.add('is-visible'); }
      });
    }, 1500);
  }


  /* ------------------------------------------------------------------------
     Start-up
     The "no-js" class is removed LAST, and only if nothing above failed.
     If something breaks, no-js stays, and the CSS keeps showing the plain
     navigation links instead of a menu button that does not work.
     ------------------------------------------------------------------------ */
  function init() {
    try {
      initMobileNav();
      markActiveNavLink();
      initImageFallbacks();
      initSkipLink();
      initReveal();
      document.documentElement.classList.remove('no-js');
      document.documentElement.classList.add('js');
    } catch (error) {
      if (global.console) {
        console.error('CivicFix: shared script failed to start.', error);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.CivicFixCommon = Object.freeze({
    getQueryParam: getQueryParam,
    createIssueCard: createIssueCard,
    setBadge: setBadge,
    applyImageFallbacks: applyImageFallbacks,
    getCategoryImage: getCategoryImage
  });
})(window, document);
