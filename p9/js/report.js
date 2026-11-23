

(function (global, document) {
  'use strict';

  /* ------------------------------------------------------------------------
     Settings
     ------------------------------------------------------------------------ */
  const MAX_PHOTO_BYTES = 2 * 1024 * 1024;   // "up to 2 MB", as the form says

  // The only image types the data layer accepts (see IMAGE_DATA_URL in data.js).
  const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  // Field keys, in the order they appear on the page. The keys are the same
  // ones validateIssueInput() uses, plus "photo" (the data layer calls it "image").
  const FIELD_ORDER = ['title', 'description', 'category', 'location', 'landmark', 'severity', 'photo'];

  const FIELD_LABELS = {
    title: 'Issue title',
    description: 'Description',
    category: 'Category',
    location: 'Area or locality',
    landmark: 'Nearby landmark',
    severity: 'Severity',
    photo: 'Photo'
  };

  // Page elements, filled in by init().
  const el = {};

  // The error box that is currently shown: { key: "message" }.
  let currentErrors = {};
  // 'fields' = the box lists field problems; 'message' = one general message.
  let alertMode = 'fields';

  // True while a save is in progress (blocks a second submit).
  let submitting = false;
  let submitLabel = '';

  // True while OUR code empties the form (after a successful save), so the
  // "reset" listener does not treat it like a click on the Reset button.
  let resettingByScript = false;

  // The photo the person chose. dataUrl is '' when there is no valid photo.
  // "pending" is a Promise while the file is still being read and checked.
  const photo = { dataUrl: '', name: '', error: '', pending: null };
  let photoToken = 0;   // lets us ignore a slow read if a newer file was chosen


  /* ------------------------------------------------------------------------
     Small helpers
     ------------------------------------------------------------------------ */
  function logError(message, error) {
    if (global.console) {
      console.error('CivicFix report: ' + message, error || '');
    }
  }

  function clearChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function dataApiReady() {
    const data = global.CivicFixData;
    return Boolean(data) &&
      typeof data.validateIssueInput === 'function' &&
      typeof data.createIssue === 'function';
  }

  function formatMegabytes(bytes) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // The element(s) that carry aria-invalid for a field.
  // The severity field is a group of radio buttons.
  function getControls(key) {
    if (key === 'severity') {
      return Array.prototype.slice.call(el.form.querySelectorAll('input[name="severity"]'));
    }
    const control = el[key];
    return control ? [control] : [];
  }

  // The control that should receive keyboard focus for a field.
  function getFocusTarget(key) {
    const controls = getControls(key);
    if (key === 'severity') {
      return controls.filter(function (radio) { return radio.checked; })[0] || controls[0] || null;
    }
    return controls[0] || null;
  }


  /* ------------------------------------------------------------------------
     1. Reading the form
        The object has exactly the shape createIssue() expects:
        { title, description, category, location, landmark, severity, image }
     ------------------------------------------------------------------------ */
  function collectInput() {
    const checked = el.form.querySelector('input[name="severity"]:checked');
    return {
      title: el.title.value,
      description: el.description.value,
      category: el.category.value,
      location: el.location.value,
      landmark: el.landmark.value,
      severity: checked ? checked.value : '',
      image: photo.dataUrl
    };
  }

  // Runs the data layer's validation. The data layer calls the photo field
  // "image"; the page calls it "photo".
  function validate(input) {
    const raw = global.CivicFixData.validateIssueInput(input) || {};
    const errors = {};
    Object.keys(raw).forEach(function (key) {
      errors[key === 'image' ? 'photo' : key] = raw[key];
    });
    if (photo.error) {
      errors.photo = photo.error;
    }
    return errors;
  }


  /* ------------------------------------------------------------------------
     2. Showing and clearing errors
     ------------------------------------------------------------------------ */
  function setFieldError(key, message) {
    currentErrors[key] = message;
    const errorElement = document.getElementById('report-' + key + '-error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.hidden = false;
    }
    getControls(key).forEach(function (control) {
      control.setAttribute('aria-invalid', 'true');
    });
  }

  function clearFieldError(key) {
    delete currentErrors[key];
    const errorElement = document.getElementById('report-' + key + '-error');
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.hidden = true;
    }
    getControls(key).forEach(function (control) {
      control.removeAttribute('aria-invalid');
    });
  }

  function clearAllFieldErrors() {
    FIELD_ORDER.forEach(clearFieldError);
  }

  function hideAlert() {
    if (el.alert) {
      el.alert.hidden = true;
    }
    if (el.alertList) {
      clearChildren(el.alertList);
    }
    alertMode = 'fields';
  }

  // Rebuilds the summary box from currentErrors (it does not move focus).
  function renderSummary() {
    if (!el.alert || !el.alertList || !el.alertMessage) {
      return;
    }
    const keys = FIELD_ORDER.filter(function (key) { return currentErrors[key]; });

    if (keys.length === 0) {
      if (alertMode === 'fields') {
        hideAlert();
      }
      return;
    }

    alertMode = 'fields';
    el.alertMessage.textContent = keys.length === 1
      ? 'Please fix 1 problem and try again.'
      : 'Please fix ' + keys.length + ' problems and try again.';

    clearChildren(el.alertList);
    keys.forEach(function (key) {
      const target = getFocusTarget(key);
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.setAttribute('href', '#' + (target ? target.id : 'report-form'));
      link.setAttribute('data-error-key', key);
      link.textContent = FIELD_LABELS[key] + ': ' + currentErrors[key];
      item.appendChild(link);
      el.alertList.appendChild(item);
    });
    el.alertList.hidden = false;
    el.alert.hidden = false;
  }

  // Field problems: mark each field, show the summary, move focus to the summary.
  function showFieldErrors(errors) {
    clearAllFieldErrors();
    FIELD_ORDER.forEach(function (key) {
      if (errors[key]) {
        setFieldError(key, errors[key]);
      }
    });
    renderSummary();
    if (el.alert && !el.alert.hidden) {
      el.alert.focus();
    }
  }

  // A general problem that is not about one field (storage, missing script...).
  function showFormMessage(message, options) {
    const settings = options || {};
    clearAllFieldErrors();
    if (!el.alert || !el.alertMessage || !el.alertList) {
      return;
    }
    alertMode = 'message';
    el.alertMessage.textContent = message;
    clearChildren(el.alertList);
    el.alertList.hidden = true;
    el.alert.hidden = false;
    if (settings.focus !== false) {
      el.alert.focus();
    }
  }

  // After the first failed attempt, fix errors as the person corrects them.
  // Only fields that currently show an error are touched.
  function onFieldEdited(key) {
    if (!currentErrors[key] || !dataApiReady()) {
      return;
    }
    const errors = validate(collectInput());
    if (errors[key]) {
      setFieldError(key, errors[key]);
    } else {
      clearFieldError(key);
    }
    renderSummary();
  }


  /* ------------------------------------------------------------------------
     3. Description counter  ("0 / 500 characters")
     ------------------------------------------------------------------------ */
  function updateCounter() {
    if (!el.counter || !el.description) {
      return;
    }
    const max = parseInt(el.counter.getAttribute('data-max'), 10) ||
      el.description.maxLength || 500;
    el.counter.textContent = el.description.value.length + ' / ' + max + ' characters';
  }


  /* ------------------------------------------------------------------------
     4. Photo: check, read, preview
     ------------------------------------------------------------------------ */

  // Returns a problem sentence, or '' if the file looks acceptable so far.
  function checkPhotoFile(file) {
    if (PHOTO_TYPES.indexOf(file.type) === -1) {
      return 'Only JPG, PNG or WebP photos can be used. Please choose a different file.';
    }
    if (file.size === 0) {
      return 'The selected file is empty. Please choose a different photo.';
    }
    if (file.size > MAX_PHOTO_BYTES) {
      return 'This photo is ' + formatMegabytes(file.size) +
        '. Please choose a photo up to 2 MB.';
    }
    return '';
  }

  // Reads the first bytes and returns the real image type, or '' if unknown.
  // This stops a renamed non-image file from slipping through.
  function sniffImageType(bytes) {
    if (bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
      return 'image/jpeg';
    }
    if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E &&
        bytes[3] === 0x47 && bytes[4] === 0x0D && bytes[5] === 0x0A && bytes[6] === 0x1A &&
        bytes[7] === 0x0A) {
      return 'image/png';
    }
    if (bytes.length >= 12 &&
        bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
        bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
      return 'image/webp';
    }
    return '';
  }

  function readFile(blob, method) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(reader.error || new Error('read failed')); };
      reader.onabort = function () { reject(new Error('read aborted')); };
      reader[method](blob);
    });
  }

  // Loads the data URL as an image to be sure the browser can really show it.
  function canDisplay(dataUrl) {
    return new Promise(function (resolve) {
      const probe = new Image();
      probe.onload = function () { resolve(true); };
      probe.onerror = function () { resolve(false); };
      probe.src = dataUrl;
    });
  }

  // Resolves { ok: true, dataUrl } or { ok: false, message }. Never rejects.
  function processPhoto(file) {
    return readFile(file.slice(0, 12), 'readAsArrayBuffer')
      .then(function (buffer) {
        const type = sniffImageType(new Uint8Array(buffer));
        if (!type) {
          return { ok: false, message: 'This file is not a valid JPG, PNG or WebP image. Please choose a different photo.' };
        }
        return readFile(file, 'readAsDataURL').then(function (result) {
          const comma = typeof result === 'string' ? result.indexOf(',') : -1;
          if (comma === -1) {
            return { ok: false, message: 'The photo could not be read. Please try again or choose a different photo.' };
          }
          // Use the REAL type (from the file's bytes), not the one the browser guessed.
          const dataUrl = 'data:' + type + ';base64,' + result.slice(comma + 1);
          return canDisplay(dataUrl).then(function (displayable) {
            return displayable
              ? { ok: true, dataUrl: dataUrl }
              : { ok: false, message: 'This image could not be opened. It may be damaged. Please choose a different photo.' };
          });
        });
      })
      .catch(function () {
        return { ok: false, message: 'The photo could not be read. Please try again or choose a different photo.' };
      });
  }

  function showPhotoPreview(dataUrl, name, size) {
    if (el.photoImage) { el.photoImage.setAttribute('src', dataUrl); }
    if (el.photoName) { el.photoName.textContent = name + ' (' + formatMegabytes(size) + ')'; }
    if (el.photoFigure) { el.photoFigure.hidden = false; }
    if (el.photoEmpty) { el.photoEmpty.hidden = true; }
    if (el.photoRemove) { el.photoRemove.hidden = false; }
  }

  function hidePhotoPreview() {
    if (el.photoFigure) { el.photoFigure.hidden = true; }
    if (el.photoEmpty) { el.photoEmpty.hidden = false; }
    if (el.photoRemove) { el.photoRemove.hidden = true; }
    if (el.photoImage) {
      // Back to the placeholder so a large photo is not kept in memory.
      el.photoImage.setAttribute('src', el.photoImage.getAttribute('data-fallback-src') || '');
    }
    if (el.photoName) { el.photoName.textContent = 'Selected photo'; }
  }

  // Forgets the photo (state, preview and any photo error). Does not touch the input.
  function resetPhotoState() {
    photoToken += 1;           // any read still running is now out of date
    photo.dataUrl = '';
    photo.name = '';
    photo.error = '';
    photo.pending = null;
    hidePhotoPreview();
    clearFieldError('photo');
    renderSummary();
  }

  function rejectPhoto(message) {
    photo.dataUrl = '';
    photo.error = message;
    photo.pending = null;
    hidePhotoPreview();
    if (el.photo) { el.photo.value = ''; }   // do not keep the bad file selected
    setFieldError('photo', message);
    renderSummary();
  }

  function onPhotoChange() {
    resetPhotoState();
    const file = el.photo.files && el.photo.files[0];
    if (!file) {
      return;   // the person cancelled the file picker: no photo, no error
    }

    const problem = checkPhotoFile(file);
    if (problem) {
      rejectPhoto(problem);
      return;
    }

    const token = photoToken;
    photo.pending = processPhoto(file).then(function (result) {
      if (token !== photoToken) {
        return;   // a newer choice replaced this one
      }
      photo.pending = null;
      if (result.ok) {
        photo.dataUrl = result.dataUrl;
        photo.name = file.name;
        showPhotoPreview(result.dataUrl, file.name, file.size);
      } else {
        rejectPhoto(result.message);
      }
    });
  }

  function onPhotoRemove() {
    resetPhotoState();
    if (el.photo) {
      el.photo.value = '';
      el.photo.focus();
    }
  }


  /* ------------------------------------------------------------------------
     5. Busy state (prevents double submits)
        aria-disabled is used instead of disabled so keyboard focus is not lost.
     ------------------------------------------------------------------------ */
  function setBusy(busy) {
    if (el.submit) {
      if (busy) {
        submitLabel = el.submit.textContent;
        el.submit.setAttribute('aria-disabled', 'true');
        el.submit.textContent = 'Saving\u2026';
      } else {
        el.submit.removeAttribute('aria-disabled');
        el.submit.textContent = submitLabel || el.submit.textContent;
      }
    }
    if (busy) {
      el.form.setAttribute('aria-busy', 'true');
    } else {
      el.form.removeAttribute('aria-busy');
    }
  }

  function pause(milliseconds) {
    return new Promise(function (resolve) { setTimeout(resolve, milliseconds); });
  }


  /* ------------------------------------------------------------------------
     6. Results of saving
        createIssue() returns one of:
          { ok: true, issue, persisted }
          { ok: false, errors: { field: message } }
          { ok: false, error: 'storage-full' | 'storage-error' | 'storage-unreadable' }
     ------------------------------------------------------------------------ */
  function failureMessage(code, hadPhoto) {
    switch (code) {
      case 'storage-full':
        return 'Your report was NOT saved because this browser\u2019s storage is full. Everything you typed is still in the form.' +
          (hadPhoto
            ? ' A photo takes a lot of space: remove it or choose a smaller one, then try again.'
            : ' Free up some browser storage, then try again.');
      case 'storage-error':
        return 'Your report was NOT saved because the browser refused to store it. Everything you typed is still in the form. ' +
          'Check that your browser allows site data (private windows often do not), then try again.';
      case 'storage-unreadable':
        return 'Your report was NOT saved. CivicFix could not safely read the reports already saved in this browser, ' +
          'so saving is switched off to avoid overwriting them. Everything you typed is still in the form. ' +
          'Try reloading the page, then try again.';
      default:
        return 'Something went wrong and your report was NOT saved. Everything you typed is still in the form. Please try again.';
    }
  }

  // Shows the success box. "persisted" false means memory only.
  function showSuccess(result) {
    const data = global.CivicFixData;
    const issue = result.issue;
    const persisted = result.persisted === true;
    const reference = (typeof data.getReferenceId === 'function' && data.getReferenceId(issue)) ||
      (issue && issue.id ? 'CF-' + issue.id : '');
    const hasPhoto = Boolean(issue && issue.image);

    const title = el.success.querySelector('.form-success__title');
    if (title) {
      title.textContent = persisted ? 'Report saved in this browser' : 'Report created, but only in memory';
    }

    let text;
    if (persisted) {
      text = (reference ? 'Your sample report (' + reference + ') ' : 'Your sample report ') +
        'has been saved in this browser\u2019s storage' +
        (hasPhoto ? ', together with your photo' : '') +
        '. It has not been sent to any authority, and nobody else can see it.';
    } else {
      text = (reference ? 'Your sample report (' + reference + ') ' : 'Your sample report ') +
        'exists only in this tab\u2019s memory, because the browser would not let CivicFix use its storage. ' +
        'It will be lost when you refresh or close this page, and it will not appear on other pages. ' +
        'It has not been sent to any authority.';
    }
    if (el.successMessage) {
      el.successMessage.textContent = text;
    }

    if (el.successLink) {
      if (persisted && issue && issue.id) {
        el.successLink.setAttribute('href', 'issue-details.html?id=' + encodeURIComponent(issue.id));
        el.successLink.hidden = false;
      } else {
        // In memory-only mode another page could not find the report.
        el.successLink.hidden = true;
      }
    }

    hideAlert();
    clearAllFieldErrors();
    el.form.hidden = true;
    el.success.hidden = false;
    el.success.focus();
  }

  function resetFormFields() {
    resettingByScript = true;
    el.form.reset();           // also restores the severity radios and the select
    resettingByScript = false;
    resetPhotoState();
    if (el.photo) { el.photo.value = ''; }
    updateCounter();
  }

  function handleResult(result, input) {
    if (result && result.ok === true && result.issue) {
      showSuccess(result);
      resetFormFields();       // the data is safe: empty the form so it cannot be sent twice
      return;
    }
    if (result && result.errors && typeof result.errors === 'object') {
      const errors = {};
      Object.keys(result.errors).forEach(function (key) {
        errors[key === 'image' ? 'photo' : key] = result.errors[key];
      });
      showFieldErrors(errors);
      return;
    }
    showFormMessage(failureMessage(result && result.error, Boolean(input.image)));
  }


  /* ------------------------------------------------------------------------
     7. Submit
     ------------------------------------------------------------------------ */
  async function onSubmit(event) {
    // Always: the form says method="get", and a real submit would put the
    // typed text in the address bar and reload the page.
    event.preventDefault();

    if (submitting) {
      return;                  // a save is already running
    }
    submitting = true;
    setBusy(true);

    try {
      if (!dataApiReady()) {
        logError('data.js did not load, so the report cannot be saved.');
        showFormMessage('The report could not be saved because a required script did not load. Everything you typed is still in the form. Please reload the page and try again.');
        return;
      }

      // If a photo is still being checked, wait for it.
      if (photo.pending) {
        await photo.pending;
      }

      const input = collectInput();
      const errors = validate(input);
      if (Object.keys(errors).length > 0) {
        showFieldErrors(errors);
        return;
      }

      // Let the browser paint "Saving..." before the (synchronous) save.
      await pause(30);

      let result;
      try {
        result = global.CivicFixData.createIssue(input);
      } catch (error) {
        logError('createIssue() threw an error.', error);
        result = { ok: false, error: 'unknown' };
      }
      handleResult(result, input);
    } catch (error) {
      logError('unexpected problem while saving.', error);
      showFormMessage(failureMessage('unknown', false));
    } finally {
      submitting = false;
      setBusy(false);
    }
  }


  /* ------------------------------------------------------------------------
     8. Other buttons
     ------------------------------------------------------------------------ */
  function onReset(event) {
    if (resettingByScript) {
      return;                  // our own reset: resetFormFields() does the tidy-up
    }
    if (submitting) {
      event.preventDefault();  // do not wipe the form in the middle of a save
      return;
    }
    // The browser empties the fields AFTER this event, so tidy up right after.
    setTimeout(function () {
      clearAllFieldErrors();
      hideAlert();
      resetPhotoState();
      if (el.photo) { el.photo.value = ''; }
      updateCounter();
    }, 0);
  }

  function onReportAnother() {
    const title = el.success.querySelector('.form-success__title');
    if (title) { title.textContent = 'Report saved in this browser'; }
    el.success.hidden = true;
    el.form.hidden = false;
    hideAlert();
    if (el.title) { el.title.focus(); }
  }

  // A link in the error summary moves focus to its field.
  function onSummaryClick(event) {
    const link = event.target.closest ? event.target.closest('a[data-error-key]') : null;
    if (!link) {
      return;
    }
    event.preventDefault();
    const target = getFocusTarget(link.getAttribute('data-error-key'));
    if (target) {
      target.focus();
    }
  }


  /* ------------------------------------------------------------------------
     Start-up
     ------------------------------------------------------------------------ */

  // Tells the person BEFORE they type if saving will not really work.
  function showStorageNotice() {
    const data = global.CivicFixData;
    if (!data || typeof data.getStorageStatus !== 'function') {
      return;
    }
    const status = data.getStorageStatus();
    if (!status || !status.message || (!status.memoryOnly && status.writable !== false)) {
      return;
    }
    const notice = document.createElement('p');
    notice.className = 'notice notice--warning';
    notice.id = 'report-storage-notice';
    notice.setAttribute('role', 'note');
    notice.textContent = status.message;
    el.form.parentNode.insertBefore(notice, el.alert || el.form);
  }

  function bindEvents() {
    el.form.addEventListener('submit', onSubmit);
    el.form.addEventListener('reset', onReset);

    // Correct errors as the person fixes them (only fields that show an error).
    ['title', 'description', 'location', 'landmark'].forEach(function (key) {
      el[key].addEventListener('input', function () { onFieldEdited(key); });
    });
    el.category.addEventListener('change', function () { onFieldEdited('category'); });
    getControls('severity').forEach(function (radio) {
      radio.addEventListener('change', function () { onFieldEdited('severity'); });
    });

    el.description.addEventListener('input', updateCounter);

    el.photo.addEventListener('change', onPhotoChange);
    if (el.photoRemove) { el.photoRemove.addEventListener('click', onPhotoRemove); }

    if (el.alertList) { el.alertList.addEventListener('click', onSummaryClick); }
    if (el.another) { el.another.addEventListener('click', onReportAnother); }
  }

  function init() {
    el.form = document.getElementById('report-form');
    if (!el.form) {
      return;                  // not the report page
    }

    el.title = document.getElementById('report-title-input');
    el.description = document.getElementById('report-description-input');
    el.category = document.getElementById('report-category-select');
    el.location = document.getElementById('report-location-input');
    el.landmark = document.getElementById('report-landmark-input');
    el.photo = document.getElementById('report-photo-input');
    el.submit = document.getElementById('report-submit-button');
    el.counter = document.getElementById('report-description-count');
    el.alert = document.getElementById('report-form-error');
    el.alertMessage = document.getElementById('report-form-error-message');
    el.alertList = document.getElementById('report-error-list');
    el.success = document.getElementById('report-success');
    el.successMessage = document.getElementById('report-success-message');
    el.successLink = document.getElementById('report-success-link');
    el.another = document.getElementById('report-another-button');
    el.photoImage = document.getElementById('report-photo-preview-image');
    el.photoName = document.getElementById('report-photo-name');
    el.photoFigure = document.getElementById('report-photo-figure');
    el.photoEmpty = document.getElementById('report-photo-empty');
    el.photoRemove = document.getElementById('report-photo-remove-button');

    // Every part of the form must exist, or we leave the plain HTML alone.
    const required = ['title', 'description', 'category', 'location', 'landmark', 'photo', 'submit', 'success'];
    const missing = required.filter(function (name) { return !el[name]; });
    if (missing.length > 0) {
      logError('the form is missing expected elements: ' + missing.join(', '));
      return;
    }

    bindEvents();

    // Browsers can restore old values after Back / reload: start from reality.
    if (el.photo.value) { el.photo.value = ''; }
    updateCounter();
    hidePhotoPreview();

    if (!dataApiReady()) {
      logError('data.js did not load, so reports cannot be saved.');
      showFormMessage('Reports cannot be saved right now because a required script did not load. Please reload the page.', { focus: false });
    } else {
      showStorageNotice();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
