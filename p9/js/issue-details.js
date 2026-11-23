

(function (global, document) {
  'use strict';

  // Page elements (filled in by init). Missing ones are handled, not assumed.
  const el = {};

  // The issue currently shown, so the support button knows which one to change.
  let currentIssueId = '';

  // True while a support change is being processed (stops double clicks).
  let supportBusy = false;

  // Original wording of the "not found" box, so it can switch to the
  // "could not load" wording and back again.
  let missingOriginal = null;

  
  function logError(message, error) {
    if (global.console) {
      console.error('CivicFix issue details: ' + message, error || '');
    }
  }

  function clearChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function setText(element, text) {
    if (element) {
      element.textContent = text;
    }
  }

  // Fills a <time> element with a readable date and a machine-readable datetime.
  function setTime(element, isoDate) {
    const data = global.CivicFixData;
    if (!element) {
      return;
    }
    element.textContent = data.formatDate(isoDate);
    const attribute = data.toDateAttribute(isoDate);
    if (attribute) {
      element.setAttribute('datetime', attribute);
    } else {
      element.removeAttribute('datetime');
    }
  }

  function pluralSupporters(count) {
    return count === 1 ? 'supporter' : 'supporters';
  }


  
  function showProblem(kind) {
    currentIssueId = '';

    if (el.detail) { el.detail.hidden = true; }
    if (el.similarSection) { el.similarSection.hidden = true; }

    if (el.title) {
      el.title.textContent = kind === 'error' ? 'Issue could not be loaded' : 'Issue not found';
    }
    setText(el.breadcrumbCurrent, kind === 'error' ? 'Issue could not be loaded' : 'Issue not found');
    document.title = (kind === 'error' ? 'Issue could not be loaded' : 'Issue not found') + ' | CivicFix';

    // The demo notice talks about "this issue", which makes no sense here.
    if (el.demoNotice) { el.demoNotice.hidden = true; }

    if (!el.missing) {
      return;
    }
    const heading = el.missing.querySelector('.empty-state__title');
    const text = el.missing.querySelector('.empty-state__text');
    if (missingOriginal === null && heading && text) {
      missingOriginal = { title: heading.textContent, text: text.textContent };
    }
    if (heading && text && missingOriginal) {
      if (kind === 'error') {
        heading.textContent = 'Issue could not be loaded';
        text.textContent = 'Something went wrong while loading this issue, so we cannot tell whether it exists. Please refresh the page and try again.';
      } else {
        heading.textContent = missingOriginal.title;
        text.textContent = missingOriginal.text;
        // If the browser is keeping data in memory only, a report made on
        // another page may simply not be visible here. Say so honestly.
        const data = global.CivicFixData;
        const status = data && typeof data.getStorageStatus === 'function' ? data.getStorageStatus() : null;
        if (status && status.memoryOnly) {
          text.textContent += ' Your browser is not saving CivicFix data, so a report you just made may not be available on this page.';
        }
      }
    }
    el.missing.hidden = false;
  }

  function hideProblem() {
    if (el.missing) { el.missing.hidden = true; }
    if (el.detail) { el.detail.hidden = false; }
    if (el.similarSection) { el.similarSection.hidden = false; }
  }


  /* ------------------------------------------------------------------------
     2. Filling the page
     ------------------------------------------------------------------------ */
  function renderBasics(issue) {
    const data = global.CivicFixData;
    const common = global.CivicFixCommon;
    const isSample = issue.source === 'sample';

    currentIssueId = issue.id;
    if (el.detail) {
      el.detail.setAttribute('data-issue-id', issue.id);
    }

    document.title = issue.title + ' | CivicFix';
    setText(el.title, issue.title);
    setText(el.breadcrumbCurrent, issue.title);
    setText(el.description, issue.description);
    setText(el.category, data.getCategoryLabel(issue.category));
    setText(el.location, issue.location);
    setText(el.landmark, issue.landmark || 'Not provided');
    setTime(el.date, issue.createdAt);
    setTime(el.updated, issue.updatedAt);

    common.setBadge(el.severity, 'severity', issue.severity);
    common.setBadge(el.status, 'status', issue.status);

    // Quick-facts strip in the page header (same data as the details list).
    setText(document.getElementById('qf-category'), data.getCategoryLabel(issue.category));
    setText(document.getElementById('qf-location'), issue.location);
    setText(document.getElementById('qf-support'), String(issue.supportCount));
    common.setBadge(document.getElementById('qf-severity'), 'severity', issue.severity);
    common.setBadge(document.getElementById('qf-status'), 'status', issue.status);

    setText(el.referenceId, data.getReferenceId(issue) || '\u2014');
    setText(el.source, isSample ? 'Sample data (fictional)' : 'Saved in this browser by you');

    // The notice in the HTML says "fictional sample content". That is only
    // true for sample issues, so a report made in this browser gets its own text.
    if (el.demoNotice) {
      if (isSample) {
        if (el.demoNoticeOriginal !== null) {
          el.demoNotice.textContent = el.demoNoticeOriginal;
        }
      } else {
        el.demoNotice.textContent = 'This report was created in this browser. It is saved only on this device, ' +
          'has not been sent to any authority, and nobody else can see it.';
      }
      el.demoNotice.hidden = false;
    }

    // Photo: the reporter's photo if there is one, otherwise the placeholder.
    if (el.image) {
      if (issue.image) {
        el.image.setAttribute('src', issue.image);
        el.image.setAttribute('alt', 'Photo added by the reporter: ' + issue.title);
        setText(el.caption, 'Photo added by the reporter.');
      } else {
        // No photo: show the illustration for this category (the generic
        // placeholder is only the fallback if that file cannot load).
        const common = global.CivicFixCommon;
        const illustration = common && common.getCategoryImage
          ? common.getCategoryImage(issue.category)
          : (el.image.getAttribute('data-fallback-src') || 'assets/images/issue-placeholder.svg');
        el.image.setAttribute('src', illustration);
        el.image.setAttribute('alt', 'Illustration for ' + (data && data.getCategoryLabel ? data.getCategoryLabel(issue.category) : 'this category') + ': ' + issue.title);
        setText(el.caption, 'Illustration for this category. No photo was added.');
      }
    }
  }


  
  function buildTimelineItem(entry) {
    const data = global.CivicFixData;
    const common = global.CivicFixCommon;
    const item = el.timelineTemplate.content.firstElementChild.cloneNode(true);

    item.setAttribute('data-status', entry.status);

    const badge = item.querySelector('[data-field="status"]');
    common.setBadge(badge, 'status', entry.status);

    setTime(item.querySelector('time[data-field="date"]'), entry.date);

    const note = item.querySelector('[data-field="note"]');
    if (note) {
      if (entry.note) {
        note.textContent = entry.note;
      } else {
        note.hidden = true;      // no note saved: show nothing rather than made-up text
      }
    }
    return item;
  }

  function renderTimeline(issue) {
    if (!el.timeline) {
      return;
    }
    clearChildren(el.timeline);

    if (!el.timelineTemplate || !el.timelineTemplate.content.firstElementChild) {
      logError('#timeline-item-template is missing.');
      if (el.timelineEmpty) { el.timelineEmpty.hidden = false; }
      return;
    }

    let events = Array.isArray(issue.timeline) ? issue.timeline.filter(function (entry) {
      return entry && entry.status && entry.date;
    }) : [];

    // Honest fallback: no saved history, so show only what we really know -
    // the current status, and the date the report was made.
    if (events.length === 0) {
      events = [{
        status: issue.status,
        date: issue.createdAt,
        note: 'No detailed status history is saved for this issue. This is its current status.'
      }];
    }

    const fragment = document.createDocumentFragment();
    events.forEach(function (entry) {
      fragment.appendChild(buildTimelineItem(entry));
    });
    el.timeline.appendChild(fragment);
    if (el.timelineEmpty) { el.timelineEmpty.hidden = true; }
  }


  /* ------------------------------------------------------------------------
     4. Support button
     ------------------------------------------------------------------------ */
  function setSupportMessage(text, isError) {
    if (!el.upvoteMessage) {
      return;
    }
    el.upvoteMessage.textContent = text;
    // The message normally uses the green "success" colour from the CSS.
    el.upvoteMessage.style.color = isError ? 'var(--color-error)' : '';
  }

  // Shows the count and the button for the given state.
  function showSupportState(count, supported) {
    if (el.upvoteCount) {
      el.upvoteCount.textContent = String(count);
    }
    setText(document.getElementById('qf-support'), String(count));
    // Keep the wording after the number in step ("supporter" / "supporters").
    if (el.supportText && el.supportText.lastChild && el.supportText.lastChild.nodeType === 3) {
      const isSample = el.detail && el.detail.getAttribute('data-source') === 'sample';
      el.supportText.lastChild.nodeValue = ' ' + (isSample ? 'sample ' : '') + pluralSupporters(count);
    }
    if (el.upvoteButton) {
      el.upvoteButton.setAttribute('aria-pressed', supported ? 'true' : 'false');
      el.upvoteButton.textContent = supported ? 'Remove my support' : 'Support this issue';
    }
  }

  function renderSupport(issue) {
    const data = global.CivicFixData;
    if (el.detail) {
      el.detail.setAttribute('data-source', issue.source);
    }
    supportBusy = false;
    if (el.upvoteButton) {
      el.upvoteButton.disabled = false;
      el.upvoteButton.removeAttribute('aria-busy');
    }
    setSupportMessage('', false);
    showSupportState(issue.supportCount, data.hasSupported(issue.id));
  }

  // After a failed change, read the real values again so the page never
  // shows a number or button state that is not what is stored.
  function resyncSupport() {
    const data = global.CivicFixData;
    try {
      const fresh = data.getIssueById(currentIssueId);
      if (fresh) {
        showSupportState(fresh.supportCount, data.hasSupported(fresh.id));
      }
    } catch (error) {
      logError('could not re-read the support state.', error);
    }
  }

  function supportErrorText(code) {
    switch (code) {
      case 'storage-full':
        return 'Your browser storage is full, so your support was not saved. Nothing was changed.';
      case 'storage-error':
        return 'The browser would not save your support. Nothing was changed.';
      case 'storage-unreadable':
        return 'CivicFix could not safely read its saved data just now, so your support was not saved.';
      case 'storage-inconsistent':
        return 'Your support could not be saved cleanly. The supporter count may be off by one in this browser. Please refresh the page.';
      case 'not-found':
        return 'This issue could not be found, so your support was not saved.';
      case 'already-supported':
        return 'This browser has already supported this issue.';
      case 'not-supported':
        return 'This browser had not supported this issue, so there was nothing to remove.';
      default:
        return 'Your support could not be saved. Please try again.';
    }
  }

  function handleSupportClick() {
    const data = global.CivicFixData;

    // Ignore clicks while a change is already being processed.
    if (supportBusy || !currentIssueId) {
      return;
    }
    if (!data || typeof data.toggleSupport !== 'function') {
      setSupportMessage('Support is not available right now. Please refresh the page.', true);
      return;
    }

    supportBusy = true;
    if (el.upvoteButton) {
      el.upvoteButton.disabled = true;
      el.upvoteButton.setAttribute('aria-busy', 'true');
    }
    setSupportMessage('Saving\u2026', false);

    let result = null;
    try {
      result = data.toggleSupport(currentIssueId);
    } catch (error) {
      logError('toggleSupport threw an error.', error);
      result = { ok: false, error: 'unknown' };
    }

    if (result && result.ok && result.issue) {
      showSupportState(result.issue.supportCount, result.supported === true);
      if (result.persisted === false) {
        setSupportMessage((result.supported ? 'Support added' : 'Support removed') +
          ', but only in this tab\u2019s memory. It will be lost when you refresh.', true);
      } else {
        setSupportMessage(result.supported
          ? 'Thanks! Your support is saved in this browser.'
          : 'Your support has been removed.', false);
      }
    } else {
      // Failure: say so, then show the values that are really stored.
      const code = result && result.error ? result.error : 'unknown';
      setSupportMessage(supportErrorText(code), true);
      resyncSupport();
    }

    supportBusy = false;
    if (el.upvoteButton) {
      el.upvoteButton.disabled = false;
      el.upvoteButton.removeAttribute('aria-busy');
    }
  }


  /* ------------------------------------------------------------------------
     5. Similar issues
     ------------------------------------------------------------------------ */
  function renderSimilar(issue) {
    const data = global.CivicFixData;
    const common = global.CivicFixCommon;
    if (!el.similarList) {
      return;
    }
    clearChildren(el.similarList);

    let similar = [];
    try {
      similar = data.getSimilarIssues(issue.id, 3);
    } catch (error) {
      logError('could not load similar issues.', error);
    }

    const fragment = document.createDocumentFragment();
    similar.forEach(function (other) {
      const card = common.createIssueCard(other);
      if (card) {
        fragment.appendChild(card);
      }
    });

    const drawn = fragment.childNodes.length;
    el.similarList.appendChild(fragment);
    el.similarList.hidden = (drawn === 0);
    if (el.similarEmpty) {
      el.similarEmpty.hidden = (drawn !== 0);
    }
  }


  /* ------------------------------------------------------------------------
     Start-up
     ------------------------------------------------------------------------ */
  function render() {
    const data = global.CivicFixData;
    const common = global.CivicFixCommon;

    if (!data || typeof data.getIssueById !== 'function' ||
        !common || typeof common.getQueryParam !== 'function' ||
        typeof common.setBadge !== 'function') {
      logError('data.js or common.js did not load.');
      showProblem('error');
      return;
    }

    const id = common.getQueryParam('id').trim();
    if (id === '') {
      showProblem('not-found');
      return;
    }

    let issue;
    try {
      issue = data.getIssueById(id);
    } catch (error) {
      logError('could not read the issue.', error);
      showProblem('error');
      return;
    }
    if (!issue) {
      showProblem('not-found');
      return;
    }

    try {
      hideProblem();
      renderBasics(issue);
      renderTimeline(issue);
      renderSupport(issue);
      renderSimilar(issue);
    } catch (error) {
      logError('could not draw the issue.', error);
      showProblem('error');
    }

    if (typeof data.getStorageStatus === 'function' && global.console) {
      const status = data.getStorageStatus();
      if (status && status.message) {
        console.warn('CivicFix: ' + status.message);
      }
    }
  }

  function init() {
    el.detail = document.getElementById('issue-detail');
    el.missing = document.getElementById('issue-missing-state');
    el.similarSection = document.getElementById('similar-issues-section');
    el.similarList = document.getElementById('similar-issues');
    el.similarEmpty = document.getElementById('similar-issues-empty');
    el.title = document.getElementById('issue-title');
    el.breadcrumbCurrent = document.getElementById('breadcrumb-current');
    el.demoNotice = document.getElementById('demo-notice');
    el.demoNoticeOriginal = el.demoNotice ? el.demoNotice.textContent : null;
    el.image = document.getElementById('issue-image');
    el.caption = el.image && el.image.closest('figure')
      ? el.image.closest('figure').querySelector('figcaption') : null;
    el.description = document.getElementById('issue-description');
    el.category = document.getElementById('issue-category');
    el.severity = document.getElementById('issue-severity');
    el.status = document.getElementById('issue-status');
    el.location = document.getElementById('issue-location');
    el.landmark = document.getElementById('issue-landmark');
    el.date = document.getElementById('issue-date');
    el.updated = document.getElementById('issue-updated');
    el.referenceId = document.getElementById('issue-reference-id');
    el.source = document.getElementById('issue-source');
    el.upvoteCount = document.getElementById('upvote-count');
    el.supportText = el.upvoteCount ? el.upvoteCount.parentNode : null;
    el.upvoteButton = document.getElementById('upvote-button');
    el.upvoteMessage = document.getElementById('upvote-message');
    el.timeline = document.getElementById('status-timeline');
    el.timelineEmpty = document.getElementById('status-timeline-empty');
    el.timelineTemplate = document.getElementById('timeline-item-template');

    if (!el.detail) {
      return;   // Not the issue details page: nothing to do.
    }

    // The button listener is added ONCE here, never inside render().
    if (el.upvoteButton) {
      el.upvoteButton.addEventListener('click', handleSupportClick);
    }

    render();

    // Back/forward cache: the page may return from memory showing old numbers
    // (for example after supporting this issue in another tab). Draw it again
    // from the saved data. render() empties lists first, so nothing doubles.
    global.addEventListener('pageshow', function (event) {
      if (event.persisted) {
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
