

(function (global, document) {
  'use strict';

  const DASH = '\u2014';
  const RANKING_LIMIT = 5;
  const ACTIVITY_LIMIT = 6;

  // Page elements (filled in by init). Missing ones are handled, not assumed.
  const el = {};

  // Original wording from the HTML, remembered so the page can switch between
  // "all sample", "sample + yours" and back again (for example after Back).
  const originals = {
    notice: null,        // child nodes of #demo-notice
    texts: []            // [{ element, text }]
  };
  const emptyOriginals = {};   // id -> { title, text }



  function logError(message, error) {
    if (global.console) {
      console.error('CivicFix impact: ' + message, error || '');
    }
  }

  function clearChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function setTextById(id, text) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = text;
    }
  }

  // 1234 -> "1,234" (Indian grouping). Not a finite number -> dash.
  function formatCount(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return DASH;
    }
    return value.toLocaleString('en-IN');
  }

  // Keeps a number between 0 and 100. Anything that is not a number becomes 0.
  function clampPercent(value) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      return 0;
    }
    return Math.min(100, Math.max(0, value));
  }

  function timeOf(value) {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  function idNumber(value) {
    return parseInt(value, 10) || 0;
  }

  function templateRoot(id) {
    const template = document.getElementById(id);
    if (!template || !template.content || !template.content.firstElementChild) {
      return null;
    }
    return template.content.firstElementChild.cloneNode(true);
  }

  // The text node that follows a <span> in the templates, e.g. " supporters".
  function textNodeAfter(span) {
    const next = span ? span.nextSibling : null;
    return next && next.nodeType === 3 ? next : null;
  }


  /* ------------------------------------------------------------------------
     1. Sample data or reports saved in this browser?
        Each issue has source: "sample" | "local". Returns counts, or null if
        the issues could not be read (then the HTML wording is left alone).
     ------------------------------------------------------------------------ */
  function readMix() {
    const data = global.CivicFixData;
    try {
      const issues = data.getIssues();
      if (!Array.isArray(issues)) {
        return null;
      }
      const sourceById = {};
      let local = 0;
      issues.forEach(function (issue) {
        sourceById[issue.id] = issue.source;
        if (issue.source === 'local') {
          local += 1;
        }
      });
      return { local: local, sample: issues.length - local, sourceById: sourceById };
    } catch (error) {
      logError('could not read the issues to tell sample data from saved reports.', error);
      return null;
    }
  }

  function plural(count, one, many) {
    return count === 1 ? one : many;
  }

  // Remembers the HTML wording the first time, so it can be put back later.
  function rememberOriginals() {
    if (originals.notice === null && el.notice) {
      originals.notice = Array.prototype.map.call(el.notice.childNodes, function (node) {
        return node.cloneNode(true);
      });
    }
    if (originals.texts.length === 0) {
      TEXT_TARGETS.forEach(function (target) {
        const element = document.querySelector(target.selector);
        if (element) {
          originals.texts.push({ element: element, text: element.textContent, mixed: target.mixed });
        }
      });
    }
  }

  // Wording used ONLY when reports saved in this browser are present.
  const TEXT_TARGETS = [
    { selector: '.page-header__description', mixed: 'A demonstration of how a civic platform could summarise activity across a city, built from the issues in this prototype: sample issues and any reports saved in this browser.' },
    { selector: '#impact-summary .section-heading__text', mixed: 'Overall figures for the issues in this prototype.' },
    { selector: '#impact-status .section-heading__text', mixed: 'How many issues are open, in progress or resolved.' },
    { selector: '#impact-categories .section-heading__text', mixed: 'Number of issues in each category.' },
    { selector: '#impact-severity .section-heading__text', mixed: 'How serious the issues were rated by their reporters.' },
    { selector: '#impact-most-supported .section-heading__text', mixed: 'Issues with the highest supporter counts.' },
    { selector: '#impact-stats-grid [data-stat="total"] .stat-card__label', mixed: 'Reports (sample + saved here)' },
    { selector: '#impact-stats-grid [data-stat="supports"] .stat-card__label', mixed: 'Total supporters' },
    { selector: '#impact-stats-grid [data-stat="resolution-rate"] .stat-card__label', mixed: 'Share marked resolved' },
    { selector: '#impact-stats-grid [data-stat="top-category"] .stat-card__label', mixed: 'Most-reported category' }
  ];

  function applyWording(mix) {
    rememberOriginals();

    const useMixed = Boolean(mix) && mix.local > 0;

    // The notice box (keeps its bold lead-in, built with DOM methods).
    if (el.notice && originals.notice) {
      clearChildren(el.notice);
      if (useMixed) {
        const strong = document.createElement('strong');
        strong.textContent = 'Prototype data only:';
        el.notice.appendChild(strong);

        const part = mix.sample > 0
          ? ' these figures combine ' + mix.sample + ' fictional sample ' + plural(mix.sample, 'report', 'reports') +
            ' with ' + mix.local + ' ' + plural(mix.local, 'report', 'reports') + ' saved in this browser.'
          : ' these figures are calculated from ' + mix.local + ' ' + plural(mix.local, 'report', 'reports') +
            ' saved in this browser.';
        el.notice.appendChild(document.createTextNode(part +
          ' Nothing is verified, no report has been sent to any authority, and none of it reflects real government action or real-world outcomes.'));
      } else {
        originals.notice.forEach(function (node) {
          el.notice.appendChild(node.cloneNode(true));
        });
      }
    }

    originals.texts.forEach(function (item) {
      item.element.textContent = useMixed ? item.mixed : item.text;
    });
  }


  /* ------------------------------------------------------------------------
     2. Empty and error messages for the six sections
        Each box already holds a "nothing yet" message. We remember it so we
        can switch to an error message and back again.
     ------------------------------------------------------------------------ */
  function showEmpty(list, box, kind, errorTitle, errorText) {
    if (list) {
      clearChildren(list);
      list.hidden = true;
    }
    if (!box) {
      return;
    }
    const title = box.querySelector('.empty-state__title');
    const text = box.querySelector('.empty-state__text');
    if (title && text) {
      if (!emptyOriginals[box.id]) {
        emptyOriginals[box.id] = { title: title.textContent, text: text.textContent };
      }
      if (kind === 'error') {
        title.textContent = errorTitle;
        text.textContent = errorText;
      } else {
        title.textContent = emptyOriginals[box.id].title;
        text.textContent = emptyOriginals[box.id].text;
      }
    }
    box.hidden = false;
  }

  function showList(list, box) {
    if (list) {
      list.hidden = false;
    }
    if (box) {
      box.hidden = true;
    }
  }

  function showSectionError(list, box, what) {
    showEmpty(list, box, 'error',
      what + ' could not be loaded',
      'Something went wrong while reading the saved issues, so this section cannot be shown. Please refresh the page and try again.');
  }


  /* ------------------------------------------------------------------------
     3. Summary cards and status counts
        If the data fails, the dashes from the HTML stay. That is honest:
        a failed load is never shown as 0.
     ------------------------------------------------------------------------ */
  function renderSummary(stats) {
    const counts = stats.statusCounts || {};

    setTextById('impact-stat-total', formatCount(stats.total));
    setTextById('impact-stat-supports', formatCount(stats.totalSupports));

    // resolutionRate is already 0 when there are no reports (no division by zero).
    setTextById('impact-stat-resolution-rate', Math.round(clampPercent(stats.resolutionRate)) + '%');

    setTextById('impact-stat-top-category',
      stats.topCategory && stats.topCategory.label ? stats.topCategory.label : 'None yet');

    setTextById('impact-count-open', formatCount(counts.open || 0));
    setTextById('impact-count-in-progress', formatCount(counts['in-progress'] || 0));
    setTextById('impact-count-resolved', formatCount(counts.resolved || 0));
  }

  function resetSummaryToDashes() {
    ['impact-stat-total', 'impact-stat-supports', 'impact-stat-resolution-rate',
      'impact-stat-top-category', 'impact-count-open', 'impact-count-in-progress',
      'impact-count-resolved'].forEach(function (id) {
      setTextById(id, DASH);
    });
  }


  
  function buildBreakdownRow(entry, maxCount) {
    const row = templateRoot('breakdown-item-template');
    if (!row) {
      return null;
    }
    const count = Number.isFinite(entry.count) && entry.count > 0 ? entry.count : 0;
    const percent = clampPercent(entry.percent);
    const barPercent = maxCount > 0 ? clampPercent((count / maxCount) * 100) : 0;

    row.setAttribute('data-key', entry.key);

    const label = row.querySelector('[data-field="label"]');
    if (label) { label.textContent = entry.label; }

    const countSpan = row.querySelector('[data-field="count"]');
    if (countSpan) {
      countSpan.textContent = formatCount(count);
      const after = textNodeAfter(countSpan);          // " issues ("
      if (after) {
        after.nodeValue = count === 1 ? ' issue (' : ' issues (';
      }
    }

    const percentSpan = row.querySelector('[data-field="percent"]');
    if (percentSpan) { percentSpan.textContent = Math.round(percent) + '%'; }

    const fill = row.querySelector('[data-field="fill"]');
    if (fill) {
      fill.style.setProperty('--fill', barPercent + '%');
      fill.style.width = barPercent + '%';
    }
    return row;
  }

  // entries: the array from getSummaryStats() (categoryBreakdown or severityBreakdown)
  function renderBreakdown(list, box, entries, total, sortByCount) {
    if (!list) {
      return;
    }
    if (!Array.isArray(entries)) {
      throw new Error('breakdown is not a list');
    }
    if (!(total > 0) || entries.length === 0) {
      showEmpty(list, box, 'empty');
      return;
    }

    let rows = entries.slice();                      // never reorder the API's array
    if (sortByCount) {
      // Biggest first. Ties keep the order of the category list (stable sort).
      rows = rows.map(function (entry, index) { return { entry: entry, index: index }; })
        .sort(function (a, b) { return (b.entry.count - a.entry.count) || (a.index - b.index); })
        .map(function (item) { return item.entry; });
    }

    const maxCount = rows.reduce(function (max, entry) {
      return Math.max(max, Number.isFinite(entry.count) ? entry.count : 0);
    }, 0);

    const fragment = document.createDocumentFragment();
    rows.forEach(function (entry) {
      const row = buildBreakdownRow(entry, maxCount);
      if (row) {
        fragment.appendChild(row);
      }
    });
    if (fragment.childNodes.length === 0) {
      throw new Error('#breakdown-item-template is missing');
    }

    clearChildren(list);                             // replace, never add on top
    list.appendChild(fragment);
    showList(list, box);
  }


  
  function renderMostSupported(total, mix) {
    const data = global.CivicFixData;
    const list = el.rankingList;
    if (!list) {
      return;
    }

    const found = data.getMostSupportedIssues(Math.max(total, RANKING_LIMIT));
    if (!Array.isArray(found)) {
      throw new Error('getMostSupportedIssues() did not return a list');
    }

    const top = found
      .filter(function (issue) { return issue && issue.supportCount > 0; })
      .sort(function (a, b) {
        return (b.supportCount - a.supportCount) ||
          (timeOf(b.createdAt) - timeOf(a.createdAt)) ||
          (idNumber(b.id) - idNumber(a.id));
      })
      .slice(0, RANKING_LIMIT);

    if (top.length === 0) {
      showEmpty(list, el.rankingEmpty, 'empty');
      return;
    }

    const fragment = document.createDocumentFragment();
    top.forEach(function (issue) {
      const item = templateRoot('ranking-item-template');
      if (!item) {
        return;
      }
      item.setAttribute('data-issue-id', issue.id);

      const link = item.querySelector('[data-field="link"]');
      if (link) {
        link.setAttribute('href', 'issue-details.html?id=' + encodeURIComponent(issue.id));
      }
      const title = item.querySelector('[data-field="title"]');
      if (title) { title.textContent = issue.title; }
      const location = item.querySelector('[data-field="location"]');
      if (location) { location.textContent = issue.location; }

      const countSpan = item.querySelector('[data-field="support-count"]');
      if (countSpan) {
        countSpan.textContent = formatCount(issue.supportCount);
        const after = textNodeAfter(countSpan);        // " supporters"
        if (after) {
          after.nodeValue = issue.supportCount === 1 ? ' supporter' : ' supporters';
        }
      }

      if (mix && mix.sourceById[issue.id] === 'local') {
        const meta = item.querySelector('.ranking-item__meta');
        if (meta) {
          meta.appendChild(document.createTextNode(' \u00B7 Saved in this browser'));
        }
      }
      fragment.appendChild(item);
    });

    if (fragment.childNodes.length === 0) {
      throw new Error('#ranking-item-template is missing');
    }
    clearChildren(list);
    list.appendChild(fragment);
    showList(list, el.rankingEmpty);
  }


  
  function renderActivity(mix) {
    const data = global.CivicFixData;
    const list = el.activityList;
    if (!list) {
      return;
    }

    const found = data.getRecentActivity(50);
    if (!Array.isArray(found)) {
      throw new Error('getRecentActivity() did not return a list');
    }

    const events = found
      .filter(function (event) { return event && event.issueId && event.text; })
      .sort(function (a, b) {
        return (timeOf(b.date) - timeOf(a.date)) ||
          (idNumber(b.issueId) - idNumber(a.issueId)) ||
          String(a.status).localeCompare(String(b.status));
      })
      .slice(0, ACTIVITY_LIMIT);

    if (events.length === 0) {
      showEmpty(list, el.activityEmpty, 'empty');
      return;
    }

    const fragment = document.createDocumentFragment();
    events.forEach(function (event) {
      const item = templateRoot('activity-item-template');
      if (!item) {
        return;
      }

      const time = item.querySelector('time[data-field="date"]');
      if (time) {
        time.textContent = data.formatDate(event.date);
        const attribute = data.toDateAttribute(event.date);
        if (attribute) {
          time.setAttribute('datetime', attribute);
        } else {
          time.removeAttribute('datetime');
        }
      }

      const text = item.querySelector('[data-field="text"]');
      if (text) {
        const isLocal = mix && mix.sourceById[event.issueId] === 'local';
        text.textContent = event.text + (isLocal ? ' (saved in this browser)' : '');
      }

      const link = item.querySelector('[data-field="link"]');
      if (link) {
        link.setAttribute('href', 'issue-details.html?id=' + encodeURIComponent(event.issueId));
      }
      const linkTitle = item.querySelector('[data-field="link-title"]');
      if (linkTitle) { linkTitle.textContent = event.title; }

      fragment.appendChild(item);
    });

    if (fragment.childNodes.length === 0) {
      throw new Error('#activity-item-template is missing');
    }
    clearChildren(list);
    list.appendChild(fragment);
    showList(list, el.activityEmpty);
  }


  
  function failEverything() {
    resetSummaryToDashes();
    showSectionError(el.categoryList, el.categoryEmpty, 'Category data');
    showSectionError(el.severityList, el.severityEmpty, 'Severity data');
    showSectionError(el.rankingList, el.rankingEmpty, 'The ranking');
    showSectionError(el.activityList, el.activityEmpty, 'Recent activity');
  }

  function render() {
    const data = global.CivicFixData;
    if (!data || typeof data.getSummaryStats !== 'function' ||
        typeof data.getMostSupportedIssues !== 'function' ||
        typeof data.getRecentActivity !== 'function' ||
        typeof data.getIssues !== 'function' ||
        typeof data.formatDate !== 'function') {
      logError('data.js did not load, so the dashboard cannot be calculated.');
      failEverything();
      return;
    }

    const mix = readMix();
    applyWording(mix);

    let stats = null;
    try {
      stats = data.getSummaryStats();
      if (!stats || typeof stats.total !== 'number') {
        throw new Error('getSummaryStats() returned an unexpected value');
      }
    } catch (error) {
      logError('could not calculate the statistics.', error);
      resetSummaryToDashes();
      showSectionError(el.categoryList, el.categoryEmpty, 'Category data');
      showSectionError(el.severityList, el.severityEmpty, 'Severity data');
    }

    if (stats) {
      try {
        renderSummary(stats);
      } catch (error) {
        logError('could not draw the summary.', error);
        resetSummaryToDashes();
      }
      try {
        renderBreakdown(el.categoryList, el.categoryEmpty, stats.categoryBreakdown, stats.total, true);
      } catch (error) {
        logError('could not draw the category breakdown.', error);
        showSectionError(el.categoryList, el.categoryEmpty, 'Category data');
      }
      try {
        renderBreakdown(el.severityList, el.severityEmpty, stats.severityBreakdown, stats.total, false);
      } catch (error) {
        logError('could not draw the severity breakdown.', error);
        showSectionError(el.severityList, el.severityEmpty, 'Severity data');
      }
    }

    try {
      renderMostSupported(stats ? stats.total : 0, mix);
    } catch (error) {
      logError('could not draw the most-supported list.', error);
      showSectionError(el.rankingList, el.rankingEmpty, 'The ranking');
    }

    try {
      renderActivity(mix);
    } catch (error) {
      logError('could not draw the recent activity.', error);
      showSectionError(el.activityList, el.activityEmpty, 'Recent activity');
    }

    if (typeof data.getStorageStatus === 'function' && global.console) {
      const status = data.getStorageStatus();
      if (status && status.message) {
        console.warn('CivicFix: ' + status.message);
      }
    }
  }

  function init() {
    el.notice = document.getElementById('demo-notice');
    el.categoryList = document.getElementById('category-breakdown');
    el.categoryEmpty = document.getElementById('category-breakdown-empty');
    el.severityList = document.getElementById('severity-breakdown');
    el.severityEmpty = document.getElementById('severity-breakdown-empty');
    el.rankingList = document.getElementById('most-supported-list');
    el.rankingEmpty = document.getElementById('most-supported-empty');
    el.activityList = document.getElementById('recent-activity-list');
    el.activityEmpty = document.getElementById('recent-activity-empty');

    // Not the impact page (none of its lists exist): nothing to do.
    if (!el.categoryList && !el.severityList && !el.rankingList && !el.activityList &&
        !document.getElementById('impact-stat-total')) {
      return;
    }

    try {
      render();
    } catch (error) {
      logError('the dashboard could not be drawn.', error);
      failEverything();
    }

    // Back/forward cache: the page may come back from memory with old numbers.
    global.addEventListener('pageshow', function (event) {
      if (event.persisted) {
        render();
      }
    });

    // Another tab of CivicFix saved a report or a support: refresh the numbers.
    global.addEventListener('storage', function (event) {
      if (event.key === null || String(event.key).indexOf('civicfix.') === 0) {
        render();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
