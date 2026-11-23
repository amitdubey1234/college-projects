

(function (global, document) {
  'use strict';


  const FEATURED_COUNT = 3;

  // Shown in a stat box when a number cannot be worked out.
  const DASH = '\u2014';

  /* ------------------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------------------ */

  function logError(message, error) {
    if (global.console) {
      console.error('CivicFix home: ' + message, error || '');
    }
  }

  // 1234 -> "1,234" (Indian grouping). Anything that is not a number -> dash.
  function formatCount(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return DASH;
    }
    return value.toLocaleString('en-IN');
  }

  // Puts text into the element with this id. Silently skips a missing element.
  function setTextById(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  function clearChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }


  /* ------------------------------------------------------------------------
     1. Statistics
        Uses these existing elements (they start with a dash):
          #home-stat-total  #home-stat-open  #home-stat-resolved  #home-stat-supports
        If the data layer fails, the dashes stay, which is honest: we do not
        show a made-up zero.
     ------------------------------------------------------------------------ */
  function renderStats() {
    const data = global.CivicFixData;
    if (!data || typeof data.getSummaryStats !== 'function') {
      logError('data.js did not load, so the statistics were not filled in.');
      return;
    }

    const stats = data.getSummaryStats();
    const counts = stats.statusCounts || {};

    setTextById('home-stat-total', formatCount(stats.total));
    setTextById('home-stat-open', formatCount(counts.open || 0));
    setTextById('home-stat-resolved', formatCount(stats.resolvedCount));
    setTextById('home-stat-supports', formatCount(stats.totalSupports));
  }




  // The empty-state box already contains a "could not be loaded" message.
  // We remember it so we can switch between that and a "nothing yet" message.
  let emptyStateOriginal = null;

  function setEmptyMessage(box, kind) {
    const title = box.querySelector('.empty-state__title');
    const text = box.querySelector('.empty-state__text');
    if (!title || !text) {
      return;
    }
    if (emptyStateOriginal === null) {
      emptyStateOriginal = { title: title.textContent, text: text.textContent };
    }
    if (kind === 'no-issues') {
      title.textContent = 'No issues to show yet';
      text.textContent = 'There are no reports to feature right now. You can add one with the report form.';
    } else {
      title.textContent = emptyStateOriginal.title;
      text.textContent = emptyStateOriginal.text;
    }
  }

  // Shows the empty box and hides the list. kind: 'error' or 'no-issues'.
  function showFeaturedEmpty(list, box, kind) {
    clearChildren(list);
    list.hidden = true;
    if (box) {
      setEmptyMessage(box, kind);
      box.hidden = false;
    }
  }

  // Newest first. If two issues share a date, the higher id number goes first.
  function pickFeaturedIssues(issues) {
    return issues
      .slice()
      .sort(function (a, b) {
        const byDate = new Date(b.createdAt) - new Date(a.createdAt);
        return byDate || (parseInt(b.id, 10) || 0) - (parseInt(a.id, 10) || 0);
      })
      .slice(0, FEATURED_COUNT);
  }

  function renderFeatured() {
    const list = document.getElementById('featured-issues');
    const emptyBox = document.getElementById('featured-issues-empty');
    if (!list) {
      return; // This page has no featured list, nothing to do.
    }

    const data = global.CivicFixData;
    const common = global.CivicFixCommon;
    if (!data || !common || typeof common.createIssueCard !== 'function') {
      logError('a shared script did not load, so featured issues were not drawn.');
      showFeaturedEmpty(list, emptyBox, 'error');
      return;
    }

    const issues = data.getIssues();
    if (!Array.isArray(issues) || issues.length === 0) {
      showFeaturedEmpty(list, emptyBox, 'no-issues');
      return;
    }

    // Build all cards first, then swap them in once. Running this function
    // again (for example when the page is restored with the Back button)
    // therefore replaces the cards instead of adding duplicates.
    const fragment = document.createDocumentFragment();
    let drawn = 0;
    pickFeaturedIssues(issues).forEach(function (issue) {
      const card = common.createIssueCard(issue);
      if (card) {
        fragment.appendChild(card);
        drawn += 1;
      }
    });

    if (drawn === 0) {
      showFeaturedEmpty(list, emptyBox, 'error');
      return;
    }

    clearChildren(list);
    list.appendChild(fragment);
    list.hidden = false;
    if (emptyBox) {
      emptyBox.hidden = true;
    }
  }


  function initHeroImage() {
    const image = document.getElementById('hero-image');
    if (!image) {
      return;
    }
    const figure = image.closest('.hero__media');
    const inner = image.closest('.hero__inner');

    function hideHero() {
      if (figure) {
        figure.hidden = true;
      }
      if (inner) {
        inner.classList.add('hero__inner--text-only');
      }
    }

    // The error may already have happened before this script ran...
    if (image.complete && image.naturalWidth === 0) {
      hideHero();
      return;
    }
    // ...or it may still be on its way.
    image.addEventListener('error', hideHero, { once: true });
  }



  const wordingTargets = [
    { selector: '#home-stats .section-heading__text', mixed: 'These figures combine sample data bundled with this prototype and reports saved in this browser. They are not real-world results.' },
    { selector: '#home-stats-grid [data-stat="total"] .stat-card__label', mixed: 'Reports (sample + saved here)' },
    { selector: '#home-stats-grid [data-stat="open"] .stat-card__label', mixed: 'Open issues' },
    { selector: '#home-stats-grid [data-stat="resolved"] .stat-card__label', mixed: 'Resolved issues' },
    { selector: '#home-stats-grid [data-stat="supports"] .stat-card__label', mixed: 'Total supporters' },
    { selector: '#demo-notice', mixed: 'Demo content: the sample reports, locations, dates, statuses and counts on CivicFix are fictional. Reports you create are saved only in this browser and are not sent to any authority.' }
  ];
  let wordingOriginals = null;

  function updateWording() {
    const data = global.CivicFixData;
    if (!data || typeof data.getIssues !== 'function') {
      return;
    }
    if (wordingOriginals === null) {
      wordingOriginals = wordingTargets.map(function (target) {
        const element = document.querySelector(target.selector);
        return { element: element, text: element ? element.textContent : '', mixed: target.mixed };
      });
    }
    const hasLocal = data.getIssues().some(function (issue) { return issue.source === 'local'; });
    wordingOriginals.forEach(function (item) {
      if (item.element) {
        item.element.textContent = hasLocal ? item.mixed : item.text;
      }
    });
  }

  function refresh() {
    try {
      updateWording();
    } catch (error) {
      logError('could not update the demo wording.', error);
    }
    try {
      renderStats();
    } catch (error) {
      logError('could not draw the statistics.', error);
    }
    try {
      renderFeatured();
    } catch (error) {
      logError('could not draw the featured issues.', error);
      const list = document.getElementById('featured-issues');
      if (list) {
        showFeaturedEmpty(list, document.getElementById('featured-issues-empty'), 'error');
      }
    }
  }

  function warnIfStorageIsLimited() {
    const data = global.CivicFixData;
    if (data && typeof data.getStorageStatus === 'function') {
      const status = data.getStorageStatus();
      if (status && status.message) {
        console.warn('CivicFix: ' + status.message);
      }
    }
  }

  function init() {
    try {
      initHeroImage();
    } catch (error) {
      logError('could not set up the hero image.', error);
    }
    refresh();
    warnIfStorageIsLimited();

    // When the person comes back with the browser's Back button, the page can be
    // restored from memory with old numbers. Refresh so the counts are current.
    global.addEventListener('pageshow', function (event) {
      if (event.persisted) {
        refresh();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
