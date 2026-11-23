

(function (global, document) {
  'use strict';

  const DEFAULT_SORT = 'newest';

  // The form fields that can be set from, and written back to, the address bar.
  // key = parameter name (also the form field name), id = the control's id.
  const FIELDS = [
    { key: 'q', id: 'issue-search-input' },
    { key: 'category', id: 'issue-category-filter' },
    { key: 'severity', id: 'issue-severity-filter' },
    { key: 'status', id: 'issue-status-filter' },
    { key: 'sort', id: 'issue-sort-select' }
  ];

  // Page elements (filled in by init). Missing ones are handled, not assumed.
  const el = {};

  // Original wording of the empty-state box, so we can switch between the
  // "no matches" text and the "could not load" text and come back again.
  let emptyOriginal = null;


  function logError(message, error) {
    if (global.console) {
      console.error('CivicFix issues: ' + message, error || '');
    }
  }

  function clearChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  // Lower-case, collapse runs of spaces, trim. Used for search text and fields.
  function normalizeText(value) {
    return String(value === null || value === undefined ? '' : value)
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Milliseconds for a date string; 0 if the date is missing or invalid, so a
  // bad date can never make the sort comparison return NaN.
  function timeOf(value) {
    const time = new Date(value).getTime();
    return Number.isNaN(time) ? 0 : time;
  }

  // "101" -> 101. Used only to break ties between identical dates/numbers.
  function idNumber(issue) {
    return parseInt(issue && issue.id, 10) || 0;
  }

  // The values a <select> really offers, e.g. ['', 'road-damage', 'garbage', ...].
  function optionValues(select) {
    return Array.prototype.map.call(select.options, function (option) {
      return option.value;
    });
  }

  function pluralIssues(count) {
    return count === 1 ? '1 issue' : count + ' issues';
  }


  

  // A select's value, but only if it is one of its real options.
  function readSelect(select, fallback) {
    if (!select) {
      return fallback;
    }
    return optionValues(select).indexOf(select.value) !== -1 ? select.value : fallback;
  }

  function readState() {
    return {
      query: el.search ? normalizeText(el.search.value) : '',
      category: readSelect(el.category, ''),
      severity: readSelect(el.severity, ''),
      status: readSelect(el.status, ''),
      sort: readSelect(el.sort, DEFAULT_SORT)
    };
  }

  function hasActiveFilters(state) {
    return state.query !== '' || state.category !== '' ||
      state.severity !== '' || state.status !== '';
  }


 

  // Puts one parameter into its control, but ONLY when the value is a real
  // option. Unknown values (e.g. ?category=banana) are ignored, never crash.
  function applyParam(control, key, rawValue) {
    if (!control || rawValue === null || rawValue === undefined) {
      return;
    }
    if (key === 'q') {
      // Respect the input's own maxlength (100) so very long links stay tidy.
      const max = control.maxLength > 0 ? control.maxLength : 100;
      control.value = String(rawValue).replace(/\s+/g, ' ').trim().slice(0, max);
      return;
    }
    if (optionValues(control).indexOf(rawValue) !== -1) {
      control.value = rawValue;
    }
  }

  function readUrlParams() {
    let params;
    try {
      params = new URLSearchParams(global.location.search);
    } catch (error) {
      return; // Very old browser: just start with the defaults.
    }
    FIELDS.forEach(function (field) {
      applyParam(el[field.id], field.key, params.get(field.key));
    });
  }

  // Mirrors the current view into the address bar (no reload, no new history
  // entry). Only non-default values are written. Wrapped in try/catch because
  // some environments (for example a few file:// setups) refuse replaceState.
  function syncUrl(state) {
    if (!global.history || typeof global.history.replaceState !== 'function') {
      return;
    }
    try {
      const params = new URLSearchParams();
      // The original (not lower-cased) text is nicer in the link.
      const rawQuery = el.search ? el.search.value.replace(/\s+/g, ' ').trim() : '';
      if (rawQuery) { params.set('q', rawQuery); }
      if (state.category) { params.set('category', state.category); }
      if (state.severity) { params.set('severity', state.severity); }
      if (state.status) { params.set('status', state.status); }
      if (state.sort && state.sort !== DEFAULT_SORT) { params.set('sort', state.sort); }

      const search = params.toString();
      const url = global.location.pathname + (search ? '?' + search : '') + global.location.hash;
      global.history.replaceState(null, '', url);
    } catch (error) {
      // Not important: the page still works, the link just is not updated.
    }
  }




  // Every word typed must appear somewhere in title + description + location.
  // "market pothole" therefore finds issues containing both words.
  function matchesSearch(issue, terms) {
    if (terms.length === 0) {
      return true;
    }
    const haystack = normalizeText(
      [issue.title, issue.description, issue.location].join(' ')
    );
    return terms.every(function (term) {
      return haystack.indexOf(term) !== -1;
    });
  }

  function filterIssues(issues, state) {
    const terms = state.query ? state.query.split(' ') : [];
    return issues.filter(function (issue) {
      return matchesSearch(issue, terms) &&
        (state.category === '' || issue.category === state.category) &&
        (state.severity === '' || issue.severity === state.severity) &&
        (state.status === '' || issue.status === state.status);
    });
  }

  function severityRank(value) {
    const data = global.CivicFixData;
    if (data && typeof data.getSeverityRank === 'function') {
      return data.getSeverityRank(value);
    }
    return { high: 3, medium: 2, low: 1 }[value] || 0;
  }

  // Newest first; identical dates fall back to the higher id (reported later).
  function byNewest(a, b) {
    return (timeOf(b.createdAt) - timeOf(a.createdAt)) || (idNumber(b) - idNumber(a));
  }

  function byOldest(a, b) {
    return (timeOf(a.createdAt) - timeOf(b.createdAt)) || (idNumber(a) - idNumber(b));
  }

  function sortIssues(issues, sort) {
    const sorted = issues.slice(); // never sort the caller's array
    switch (sort) {
      case 'oldest':
        return sorted.sort(byOldest);
      case 'most-supported':
        // Most supporters first; ties -> newest first.
        return sorted.sort(function (a, b) {
          return ((b.supportCount || 0) - (a.supportCount || 0)) || byNewest(a, b);
        });
      case 'highest-severity':
        // High -> medium -> low; ties -> newest first.
        return sorted.sort(function (a, b) {
          return (severityRank(b.severity) - severityRank(a.severity)) || byNewest(a, b);
        });
      case 'newest':
      default:
        return sorted.sort(byNewest);
    }
  }


  /* ------------------------------------------------------------------------
     4. Showing results, the empty state and the error state
     ------------------------------------------------------------------------ */

  function setCountText(text) {
    if (el.count) {
      el.count.textContent = text;
    }
  }

  // kind: 'no-match' (filters matched nothing), 'no-issues' (no issues exist at
  // all) or 'error' (the data could not be loaded). Hides the list so the
  // count, the cards and the message always agree with each other.
  function showEmptyState(kind) {
    if (el.list) {
      clearChildren(el.list);
      el.list.hidden = true;
    }
    if (!el.empty) {
      return;
    }

    const title = el.empty.querySelector('.empty-state__title');
    const text = el.empty.querySelector('.empty-state__text');
    if (emptyOriginal === null && title && text) {
      emptyOriginal = { title: title.textContent, text: text.textContent };
    }

    if (title && text && emptyOriginal) {
      if (kind === 'error') {
        title.textContent = 'Issues could not be loaded';
        text.textContent = 'Something went wrong while loading the sample issues. Please refresh the page and try again.';
      } else if (kind === 'no-issues') {
        title.textContent = 'There are no issues yet';
        text.textContent = 'No reports are available right now. You can add one with the report form.';
      } else {
        title.textContent = emptyOriginal.title;
        text.textContent = emptyOriginal.text;
      }
    }

    // "Clear filters" makes no sense when the problem is not the filters.
    if (el.clearEmpty) {
      el.clearEmpty.hidden = (kind !== 'no-match');
    }
    el.empty.hidden = false;
  }

  function showError() {
    setCountText('Issues could not be loaded, so no results can be shown.');
    showEmptyState('error');
  }

  // Draws the given issues. Returns true if they were drawn.
  // All cards are built first and swapped in once, so running this again
  // (filters changing, Back-button restore) replaces cards, never duplicates.
  function renderIssues(visible, total, state) {
    const common = global.CivicFixCommon;
    const fragment = document.createDocumentFragment();
    let drawn = 0;

    visible.forEach(function (issue) {
      const card = common.createIssueCard(issue);
      if (card) {
        fragment.appendChild(card);
        drawn += 1;
      }
    });

    // Issues exist but not one card could be built: the template is missing or
    // broken. That is an error, not "zero results".
    if (visible.length > 0 && drawn === 0) {
      logError('no issue card could be created (is #issue-card-template present?).');
      showError();
      return false;
    }

    clearChildren(el.list);
    if (drawn === 0) {
      setCountText(hasActiveFilters(state)
        ? 'No issues match your filters (0 of ' + pluralIssues(total) + ').'
        : 'There are no issues to show.');
      showEmptyState(total === 0 ? 'no-issues' : 'no-match');
      return true;
    }

    el.list.appendChild(fragment);
    el.list.hidden = false;
    if (el.empty) {
      el.empty.hidden = true;
    }
    // The count always equals the number of cards actually drawn.
    setCountText(drawn === total
      ? 'Showing all ' + pluralIssues(total) + '.'
      : 'Showing ' + drawn + ' of ' + pluralIssues(total) + '.');
    return true;
  }


  let noticeOriginal = null;

  function updateNotice(all) {
    const notice = document.getElementById('demo-notice');
    if (!notice) {
      return;
    }
    if (noticeOriginal === null) {
      noticeOriginal = notice.textContent;
    }
    const local = all.filter(function (issue) { return issue.source === 'local'; }).length;
    const sample = all.length - local;

    if (local === 0) {
      notice.textContent = noticeOriginal;
    } else if (sample > 0) {
      notice.textContent = 'Demo data: this list combines ' + sample + ' fictional sample ' +
        (sample === 1 ? 'issue' : 'issues') + ' with ' + local + ' ' + (local === 1 ? 'report' : 'reports') +
        ' saved in this browser. Sample locations, dates, statuses and support counts are for demonstration only.';
    } else {
      notice.textContent = 'This list shows ' + local + ' ' + (local === 1 ? 'report' : 'reports') +
        ' saved in this browser. Nothing here has been sent to any authority or verified.';
    }
  }

  // Reads the controls, loads the data, filters, sorts and draws.
  function update(options) {
    const settings = options || {};
    if (!el.list) {
      return;
    }

    const data = global.CivicFixData;
    const common = global.CivicFixCommon;
    if (!data || typeof data.getIssues !== 'function' ||
        !common || typeof common.createIssueCard !== 'function') {
      logError('data.js or common.js did not load.');
      showError();
      return;
    }

    let all;
    try {
      all = data.getIssues();
    } catch (error) {
      logError('could not read the issues.', error);
      showError();
      return;
    }
    if (!Array.isArray(all)) {
      logError('getIssues() did not return a list.');
      showError();
      return;
    }

    updateNotice(all);
    const state = readState();
    const shown = sortIssues(filterIssues(all, state), state.sort);
    const ok = renderIssues(shown, all.length, state);

    if (ok && settings.syncUrl !== false) {
      syncUrl(state);
    }
  }


  /* ------------------------------------------------------------------------
     5. Clearing the filters
     ------------------------------------------------------------------------ */
  function clearFilters(focusSearch) {
    if (el.search) { el.search.value = ''; }
    if (el.category) { el.category.value = ''; }
    if (el.severity) { el.severity.value = ''; }
    if (el.status) { el.status.value = ''; }
    if (el.sort) { el.sort.value = DEFAULT_SORT; }

    update(); // redraws everything and writes the clean address to the URL

    // The empty-state button disappears after this click, so keyboard focus
    // would be lost. Send it to the search box instead.
    if (focusSearch && el.search) {
      el.search.focus();
    }
  }


  /* ------------------------------------------------------------------------
     Start-up
     ------------------------------------------------------------------------ */
  function warnIfStorageIsLimited() {
    const data = global.CivicFixData;
    if (data && typeof data.getStorageStatus === 'function') {
      const status = data.getStorageStatus();
      if (status && status.message && global.console) {
        console.warn('CivicFix: ' + status.message);
      }
    }
  }

  function bindEvents() {
    if (el.form) {
      // Enter in the search box or the "Apply filters" button.
      // preventDefault stops the real form submit (the page would reload).
      el.form.addEventListener('submit', function (event) {
        event.preventDefault();
        update();
      });
    }

    // Changing a dropdown applies straight away (the Apply button still works).
    [el.category, el.severity, el.status, el.sort].forEach(function (select) {
      if (select) {
        select.addEventListener('change', function () { update(); });
      }
    });

    // The small "x" in a search box fires "search" with an empty value.
    if (el.search) {
      el.search.addEventListener('search', function () { update(); });
    }

    if (el.clear) {
      el.clear.addEventListener('click', function () { clearFilters(false); });
    }
    if (el.clearEmpty) {
      el.clearEmpty.addEventListener('click', function () { clearFilters(true); });
    }

    // Back/forward cache: the page may come back from memory with old cards
    // and form values. Redraw from the CURRENT controls so nothing is stale
    // or duplicated.
    global.addEventListener('pageshow', function (event) {
      if (event.persisted) {
        update({ syncUrl: false });
      }
    });
  }

  function init() {
    el.form = document.getElementById('issue-filter-form');
    el.search = document.getElementById('issue-search-input');
    el.category = document.getElementById('issue-category-filter');
    el.severity = document.getElementById('issue-severity-filter');
    el.status = document.getElementById('issue-status-filter');
    el.sort = document.getElementById('issue-sort-select');
    el.clear = document.getElementById('clear-filters-button');
    el.clearEmpty = document.getElementById('clear-filters-empty-button');
    el.count = document.getElementById('results-count');
    el.list = document.getElementById('issue-list');
    el.empty = document.getElementById('issue-empty-state');

    // Lookup table used by readUrlParams (control by its id).
    el['issue-search-input'] = el.search;
    el['issue-category-filter'] = el.category;
    el['issue-severity-filter'] = el.severity;
    el['issue-status-filter'] = el.status;
    el['issue-sort-select'] = el.sort;

    if (!el.list) {
      return; // Not the issues page: nothing to do.
    }

    try {
      readUrlParams();
    } catch (error) {
      logError('could not read the address-bar parameters.', error);
    }

    bindEvents();

    try {
      update();
    } catch (error) {
      logError('could not draw the issues.', error);
      showError();
    }
    warnIfStorageIsLimited();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
