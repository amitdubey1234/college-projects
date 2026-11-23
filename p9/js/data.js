

(function (global) {
  'use strict';

  
  const CATEGORIES = Object.freeze([
    { value: 'road-damage', label: 'Potholes & road damage' },
    { value: 'garbage', label: 'Garbage accumulation' },
    { value: 'streetlight', label: 'Broken streetlights' },
    { value: 'waterlogging', label: 'Waterlogging' },
    { value: 'drainage', label: 'Drainage problems' },
    { value: 'footpath', label: 'Damaged footpaths' }
  ]);

  // "rank" lets other scripts sort by severity (higher number = more serious).
  const SEVERITIES = Object.freeze([
    { value: 'high', label: 'High', rank: 3 },
    { value: 'medium', label: 'Medium', rank: 2 },
    { value: 'low', label: 'Low', rank: 1 }
  ]);

  const STATUSES = Object.freeze([
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In progress' },
    { value: 'resolved', label: 'Resolved' }
  ]);

  // Same limits as the HTML form attributes (minlength / maxlength).
  const LIMITS = Object.freeze({
    title: { min: 8, max: 100 },
    description: { min: 20, max: 500 },
    location: { min: 3, max: 80 },
    landmark: { max: 80 }
  });

  const STORAGE_KEYS = Object.freeze({
    issues: 'civicfix.issues.v1',
    supports: 'civicfix.supports.v1',
    backupPrefix: 'civicfix.issues.backup.'
  });

  // Photos are saved as data URLs; only these image types are accepted.
  const IMAGE_DATA_URL = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;


 
  const memoryStore = {};
  let storageChecked = false;
  let storageReadable = false;
  let forcedMemory = false;      // true after the first sample-data save failed

  const storageStatus = {
    seededSampleData: false,    
    seedWriteFailed: false,      
    recoveredFromCorruption: false,
    backupKey: null,            
    lastWriteError: null,       
    lastReadFailed: false,       
    unresolvedDataProblem: false,  
    supportsListReset: false,    
    supportStateMayBeInconsistent: false   
  };

  // Reads only (no test write), so a nearly-full storage is never mistaken for "no storage".
  function detectStorage() {
    if (storageChecked) {
      return storageReadable;
    }
    storageChecked = true;
    try {
      global.localStorage.getItem('__civicfix_probe__');
      storageReadable = true;
    } catch (error) {
      storageReadable = false;
    }
    return storageReadable;
  }

  function usingMemory() {
    return forcedMemory || !detectStorage();
  }

  function isQuotaError(error) {
    return Boolean(error) && (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error.code === 22 ||
      error.code === 1014
    );
  }

  
  function readRaw(key) {
    if (usingMemory()) {
      return { ok: true, value: Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null };
    }
    try {
      const value = global.localStorage.getItem(key);
      storageStatus.lastReadFailed = false;
      return { ok: true, value: value };
    } catch (error) {
      storageStatus.lastReadFailed = true;
      return { ok: false };
    }
  }

  
  function writeRaw(key, value) {
    if (usingMemory()) {
      memoryStore[key] = value;
      return { ok: true, persisted: false, memoryOnly: true };
    }
    try {
      global.localStorage.setItem(key, value);
      storageStatus.lastWriteError = null;
      return { ok: true, persisted: true };
    } catch (error) {
      const code = isQuotaError(error) ? 'storage-full' : 'storage-error';
      storageStatus.lastWriteError = code;
      return { ok: false, error: code };
    }
  }

  // JSON.parse can throw on broken text, so we wrap it.
  function parseJson(text) {
    try {
      return { ok: true, value: JSON.parse(text) };
    } catch (error) {
      return { ok: false, value: null };
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }


 
  function findByValue(list, value) {
    return list.find(function (item) { return item.value === value; }) || null;
  }

  function isValidCategory(value) { return findByValue(CATEGORIES, value) !== null; }
  function isValidSeverity(value) { return findByValue(SEVERITIES, value) !== null; }
  function isValidStatus(value) { return findByValue(STATUSES, value) !== null; }

  function getCategoryLabel(value) {
    const found = findByValue(CATEGORIES, value);
    return found ? found.label : 'Other';
  }

  function getSeverityLabel(value) {
    const found = findByValue(SEVERITIES, value);
    return found ? found.label : 'Unknown';
  }

  function getStatusLabel(value) {
    const found = findByValue(STATUSES, value);
    return found ? found.label : 'Unknown';
  }

  // CSS class names used by the badges in the HTML, e.g. "badge--high".
  function getSeverityBadgeClass(value) {
    return isValidSeverity(value) ? 'badge--' + value : 'badge--medium';
  }

  function getStatusBadgeClass(value) {
    return isValidStatus(value) ? 'badge--' + value : 'badge--open';
  }

  function getSeverityRank(value) {
    const found = findByValue(SEVERITIES, value);
    return found ? found.rank : 0;
  }


  /* ------------------------------------------------------------------------
     4. Date helpers
        Dates are stored as ISO strings (e.g. "2026-09-02T09:30:00+05:30").
     ------------------------------------------------------------------------ */
  function isValidDate(value) {
    return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
  }

  // "2 Sept 2026" style, using Indian English.
  function formatDate(value) {
    if (!isValidDate(value)) {
      return 'Date unknown';
    }
    return new Date(value).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // "2026-09-02" - the value that belongs in <time datetime="...">.
  function toDateAttribute(value) {
    if (!isValidDate(value)) {
      return '';
    }
    const date = new Date(value);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return date.getFullYear() + '-' + month + '-' + day;
  }


 
  function sample(id, title, description, category, location, landmark, severity,
                  status, createdAt, supportCount, timeline) {
    const events = timeline.map(function (entry) {
      return { status: entry[0], date: entry[1], note: entry[2] };
    });
    return {
      id: id,
      title: title,
      description: description,
      category: category,
      location: location,
      landmark: landmark,
      severity: severity,
      status: status,
      createdAt: createdAt,
      updatedAt: events[events.length - 1].date,
      supportCount: supportCount,
      reporter: { name: 'Sample reporter', type: 'sample' },
      source: 'sample',
      image: '',
      timeline: events
    };
  }

  function buildSampleIssues() {
    return [
      sample('101', 'Deep pothole near Market Junction',
        'A deep pothole has formed at the main junction beside the vegetable market. Two-wheelers swerve to avoid it and water collects in it after rain, so it is hard to see at night.',
        'road-damage', 'Market Junction, Ward 5', 'Opposite the vegetable market', 'high', 'in-progress',
        '2026-09-02T09:30:00+05:30', 46, [
          ['open', '2026-09-02T09:30:00+05:30', 'Sample report submitted by a resident.'],
          ['in-progress', '2026-09-09T11:00:00+05:30', 'Sample update: marked for repair in the demo work queue.']
        ]),
      sample('102', 'Overflowing bins behind the vegetable market',
        'The community bins behind the market have been overflowing for a week. Waste spills onto the lane and the smell is affecting nearby shops and homes.',
        'garbage', 'Market Back Lane, Ward 5', 'Behind the vegetable market', 'medium', 'open',
        '2026-09-20T08:15:00+05:30', 31, [
          ['open', '2026-09-20T08:15:00+05:30', 'Sample report submitted by a resident.']
        ]),
      sample('103', 'Three streetlights not working on Park Road',
        'Three lamp posts in a row have been dark for over two weeks. The stretch is used by evening walkers and school children, and feels unsafe after sunset.',
        'streetlight', 'Park Road, Ward 9', 'Near the community park gate', 'high', 'in-progress',
        '2026-09-12T19:40:00+05:30', 38, [
          ['open', '2026-09-12T19:40:00+05:30', 'Sample report submitted by a resident.'],
          ['in-progress', '2026-09-18T10:30:00+05:30', 'Sample update: inspection scheduled in the demo data.']
        ]),
      sample('104', 'Water stands for days under the railway underpass',
        'After even light rain, the underpass fills with knee-deep water that takes days to drain. Auto-rickshaws stall and pedestrians have to take a long detour.',
        'waterlogging', 'Railway Underpass, Ward 2', 'Next to the old ticket office', 'high', 'open',
        '2026-10-01T07:50:00+05:30', 52, [
          ['open', '2026-10-01T07:50:00+05:30', 'Sample report submitted by a resident.']
        ]),
      sample('105', 'Blocked drain overflowing into the lane',
        'A drain in the residential lane was choked with plastic and silt, and dirty water was spilling onto the road in front of several houses.',
        'drainage', 'Lakeview Colony, Ward 9', 'Beside the temple wall', 'medium', 'resolved',
        '2026-08-25T10:00:00+05:30', 19, [
          ['open', '2026-08-25T10:00:00+05:30', 'Sample report submitted by a resident.'],
          ['in-progress', '2026-08-29T09:00:00+05:30', 'Sample update: cleaning work started in the demo data.'],
          ['resolved', '2026-09-05T16:20:00+05:30', 'Sample update: drain cleared and marked resolved in the demo data.']
        ]),
      sample('106', 'Broken footpath slabs outside the school',
        'Several footpath slabs outside the school gate are cracked and tilted. Children and parents walk on the road to avoid tripping, close to morning traffic.',
        'footpath', 'College Road, Ward 3', 'Outside the primary school gate', 'medium', 'open',
        '2026-10-05T12:10:00+05:30', 24, [
          ['open', '2026-10-05T12:10:00+05:30', 'Sample report submitted by a resident.']
        ]),
      sample('107', 'Uneven road patch after pipeline digging',
        'The road was dug up for a pipeline and patched with loose gravel. The patch has sunk below the road level and is rough to ride over.',
        'road-damage', 'Gandhi Chowk Lane, Ward 7', 'Near the post office', 'low', 'resolved',
        '2026-08-28T15:45:00+05:30', 8, [
          ['open', '2026-08-28T15:45:00+05:30', 'Sample report submitted by a resident.'],
          ['resolved', '2026-09-14T13:00:00+05:30', 'Sample update: patch levelled and marked resolved in the demo data.']
        ]),
      sample('108', 'Uncollected waste at the colony corner',
        'Household waste has piled up at the corner of the colony because the collection vehicle has skipped this street for several days.',
        'garbage', 'Green Park Colony, Ward 11', 'Near the water tank', 'low', 'in-progress',
        '2026-10-08T09:05:00+05:30', 12, [
          ['open', '2026-10-08T09:05:00+05:30', 'Sample report submitted by a resident.'],
          ['in-progress', '2026-10-12T10:00:00+05:30', 'Sample update: extra collection round planned in the demo data.']
        ]),
      sample('109', 'Flickering lamp near the bus stop',
        'The streetlight beside the bus shelter flickers on and off all evening, which makes the waiting area dim and uncomfortable for commuters.',
        'streetlight', 'Old Bus Stand Road, Ward 4', 'At the bus shelter', 'low', 'resolved',
        '2026-09-01T18:30:00+05:30', 6, [
          ['open', '2026-09-01T18:30:00+05:30', 'Sample report submitted by a resident.'],
          ['resolved', '2026-09-06T11:15:00+05:30', 'Sample update: lamp replaced and marked resolved in the demo data.']
        ]),
      sample('110', 'Puddle at the low junction after light rain',
        'The dip at the junction collects water after even a short shower. Vehicles slow down suddenly and splash pedestrians on the narrow footpath.',
        'waterlogging', 'Hospital Road Junction, Ward 3', 'Opposite the pharmacy', 'medium', 'open',
        '2026-10-12T14:25:00+05:30', 14, [
          ['open', '2026-10-12T14:25:00+05:30', 'Sample report submitted by a resident.']
        ]),
      sample('111', 'Open drain without a cover near the playground',
        'A stretch of drain next to the children\'s playground has no cover slab. A child or an animal could easily fall in, especially after dark.',
        'drainage', 'Nehru Park Lane, Ward 6', 'Beside the children\'s playground', 'high', 'open',
        '2026-10-15T17:00:00+05:30', 41, [
          ['open', '2026-10-15T17:00:00+05:30', 'Sample report submitted by a resident.']
        ]),
      sample('112', 'Footpath blocked by a broken pole base',
        'The concrete base of an old pole has broken and sticks out of the footpath, forcing walkers onto the road at a busy bend.',
        'footpath', 'Temple Street, Ward 7', 'Near the sweet shop', 'low', 'open',
        '2026-10-18T10:40:00+05:30', 5, [
          ['open', '2026-10-18T10:40:00+05:30', 'Sample report submitted by a resident.']
        ])
    ];
  }


  
  function cleanText(value, maxLength) {
    if (typeof value !== 'string') {
      return '';
    }
    // Remove control characters, trim spaces, and cut to the maximum length.
    return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
  }

  function normalizeTimeline(list, issue) {
    const events = [];
    if (Array.isArray(list)) {
      list.forEach(function (entry) {
        if (entry && isValidStatus(entry.status) && isValidDate(entry.date)) {
          events.push({
            status: entry.status,
            date: entry.date,
            note: cleanText(entry.note, 300)
          });
        }
      });
    }
    if (events.length === 0) {
      events.push({ status: issue.status, date: issue.createdAt, note: '' });
    }
    return events;
  }

  function normalizeIssue(raw) {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    const id = (typeof raw.id === 'string' || typeof raw.id === 'number') ? String(raw.id).trim() : '';
    const title = cleanText(raw.title, 200);
    const description = cleanText(raw.description, 1000);
    const location = cleanText(raw.location, 200);

    const required = id && title && description && location &&
      isValidCategory(raw.category) && isValidSeverity(raw.severity) &&
      isValidStatus(raw.status) && isValidDate(raw.createdAt);
    if (!required) {
      return null;
    }

    const supportCount = Number.isFinite(raw.supportCount) && raw.supportCount > 0
      ? Math.floor(raw.supportCount)
      : 0;

    const issue = {
      id: id,
      title: title,
      description: description,
      category: raw.category,
      location: location,
      landmark: cleanText(raw.landmark, 200),
      severity: raw.severity,
      status: raw.status,
      createdAt: raw.createdAt,
      updatedAt: isValidDate(raw.updatedAt) ? raw.updatedAt : raw.createdAt,
      supportCount: supportCount,
      reporter: {
        name: cleanText(raw.reporter && raw.reporter.name, 80) || 'Anonymous',
        type: raw.reporter && raw.reporter.type === 'sample' ? 'sample' : 'local'
      },
      source: raw.source === 'sample' ? 'sample' : 'local',
      image: (typeof raw.image === 'string' && IMAGE_DATA_URL.test(raw.image)) ? raw.image : '',
      timeline: []
    };
    issue.timeline = normalizeTimeline(raw.timeline, issue);
    return issue;
  }



  let lastGoodRaw = null;        // last clean copy we read; used if a later read fails
  let handledDamage = { raw: null, state: null };   // so a bad copy is backed up only once

  function writeIssues(list) {
    return writeRaw(STORAGE_KEYS.issues, JSON.stringify(list));
  }

  // Copy unreadable data to a backup key BEFORE we replace anything,
  // so nothing is destroyed silently. Returns the backup key, or null if it failed.
  function backupBrokenData(rawText) {
    const key = STORAGE_KEYS.backupPrefix + Date.now();
    const result = writeRaw(key, rawText);
    storageStatus.recoveredFromCorruption = true;
    storageStatus.backupKey = result.ok ? key : null;
    return result.ok ? key : null;
  }

  // Nothing is saved yet: store the sample issues. If even this write fails,
  // nothing of the user's exists to protect, so we continue in memory (and say so).
  function seedState() {
    const samples = buildSampleIssues();
    const text = JSON.stringify(samples);
    const result = writeRaw(STORAGE_KEYS.issues, text);
    if (!result.ok) {
      storageStatus.seedWriteFailed = true;
      forcedMemory = true;
      writeRaw(STORAGE_KEYS.issues, text);     // now goes to memory
    }
    storageStatus.seededSampleData = true;
    return { issues: samples, writable: true, raw: text, problem: null };
  }

  // Saved data exists but cannot be read at the moment. Show the last good copy
  // (or the samples) but switch saving OFF so nothing is overwritten.
  function unreadableState() {
    let issues = null;
    if (lastGoodRaw !== null) {
      const parsed = parseJson(lastGoodRaw);
      issues = parsed.ok && Array.isArray(parsed.value) ? parsed.value : null;
    }
    return { issues: issues || buildSampleIssues(), writable: false, raw: null, problem: 'unreadable' };
  }

  // Saved data is broken (bad JSON) or partly unusable. "validIssues" holds whatever
  // could be repaired (empty for bad JSON). We keep a backup first. If the backup
  // fails, the original is left exactly as it is and saving is switched off.
  function handleDamagedData(raw, validIssues) {
    if (handledDamage.raw === raw && handledDamage.state) {
      return clone(handledDamage.state);
    }
    let state;
    if (backupBrokenData(raw) === null) {
      storageStatus.unresolvedDataProblem = true;
      state = {
        issues: validIssues.length > 0 ? validIssues : buildSampleIssues(),
        writable: false,
        raw: raw,
        problem: 'damaged-no-backup'
      };
    } else if (validIssues.length === 0) {
      state = seedState();                    // the damaged copy is safe in the backup
    } else {
      const text = JSON.stringify(validIssues);
      const result = writeRaw(STORAGE_KEYS.issues, text);   // save the repaired list
      state = { issues: validIssues, writable: true, raw: result.ok ? text : raw, problem: 'repaired' };
    }
    handledDamage = { raw: raw, state: clone(state) };
    return state;
  }

  function computeIssuesState() {
    const read = readRaw(STORAGE_KEYS.issues);
    if (!read.ok) {
      return unreadableState();                // a read ERROR is not the same as "empty"
    }

    const raw = read.value;
    if (raw === null) {
      return seedState();                      // first visit: nothing saved yet
    }

    const parsed = parseJson(raw);
    if (!parsed.ok || !Array.isArray(parsed.value)) {
      return handleDamagedData(raw, []);       // broken JSON
    }

    if (parsed.value.length === 0) {
      return seedState();                      // an empty list is treated as "no data"
    }

    const valid = [];
    parsed.value.forEach(function (item) {
      const issue = normalizeIssue(item);
      if (issue) {
        valid.push(issue);
      }
    });

    if (valid.length !== parsed.value.length) {
      return handleDamagedData(raw, valid);    // some entries were unusable
    }
    return { issues: valid, writable: true, raw: raw, problem: null };
  }

  function loadIssuesState() {
    const state = computeIssuesState();
    if (state.problem === null) {
      lastGoodRaw = state.raw;
    }
    return state;
  }

  // Reads every issue. Seeds the samples ONLY when nothing is saved.
  function loadIssues() {
    return loadIssuesState().issues;
  }

  // Public: all issues, as copies (changing them does not change saved data).
  function getIssues() {
    return clone(loadIssues());
  }

  // Public: one issue, or null when the id is missing or unknown.
  function getIssueById(id) {
    if (id === null || id === undefined || id === '') {
      return null;
    }
    const wanted = String(id).trim();
    const found = loadIssues().find(function (issue) { return issue.id === wanted; });
    return found ? clone(found) : null;
  }

  // Public: other issues in the same category, newest first.
  function getSimilarIssues(id, limit) {
    const current = getIssueById(id);
    if (!current) {
      return [];
    }
    const max = Number.isInteger(limit) && limit > 0 ? limit : 3;
    return getIssues()
      .filter(function (issue) {
        return issue.id !== current.id && issue.category === current.category;
      })
      .sort(function (a, b) { return new Date(b.createdAt) - new Date(a.createdAt); })
      .slice(0, max);
  }



  function generateIssueId(existingIssues) {
    let highest = 100;
    existingIssues.forEach(function (issue) {
      if (/^\d+$/.test(issue.id)) {
        highest = Math.max(highest, parseInt(issue.id, 10));
      }
    });
    return String(highest + 1);
  }

  // Public: a friendly reference such as "CF-101".
  function getReferenceId(issue) {
    return issue && issue.id ? 'CF-' + issue.id : '';
  }


  /* ------------------------------------------------------------------------
     9. Creating issues
     ------------------------------------------------------------------------ */

  // Public: checks form-like input. Returns an object of messages keyed by
  // field name, e.g. { title: "..." }. An empty object means "all good".
  function validateIssueInput(input) {
    const data = input || {};
    const errors = {};

    const title = cleanText(data.title, 1000);
    const description = cleanText(data.description, 5000);
    const location = cleanText(data.location, 1000);
    const landmark = cleanText(data.landmark, 1000);

    if (title.length < LIMITS.title.min || title.length > LIMITS.title.max) {
      errors.title = 'Enter a title between ' + LIMITS.title.min + ' and ' + LIMITS.title.max + ' characters.';
    }
    if (description.length < LIMITS.description.min || description.length > LIMITS.description.max) {
      errors.description = 'Enter a description between ' + LIMITS.description.min + ' and ' + LIMITS.description.max + ' characters.';
    }
    if (!isValidCategory(data.category)) {
      errors.category = 'Choose a category.';
    }
    if (location.length < LIMITS.location.min || location.length > LIMITS.location.max) {
      errors.location = 'Enter an area or locality between ' + LIMITS.location.min + ' and ' + LIMITS.location.max + ' characters.';
    }
    if (landmark.length > LIMITS.landmark.max) {
      errors.landmark = 'Keep the landmark under ' + LIMITS.landmark.max + ' characters.';
    }
    if (!isValidSeverity(data.severity)) {
      errors.severity = 'Choose how serious the problem is.';
    }
    if (data.image && !IMAGE_DATA_URL.test(String(data.image))) {
      errors.image = 'The photo must be a JPG, PNG or WebP image.';
    }
    return errors;
  }

  
  function createIssue(input) {
    const errors = validateIssueInput(input);
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors: errors };
    }

    const state = loadIssuesState();
    if (!state.writable) {
      return { ok: false, error: 'storage-unreadable' };
    }
    const issues = state.issues;
    const now = new Date().toISOString();

    const issue = {
      id: generateIssueId(issues),
      title: cleanText(input.title, LIMITS.title.max),
      description: cleanText(input.description, LIMITS.description.max),
      category: input.category,
      location: cleanText(input.location, LIMITS.location.max),
      landmark: cleanText(input.landmark, LIMITS.landmark.max),
      severity: input.severity,
      status: 'open',
      createdAt: now,
      updatedAt: now,
      supportCount: 0,
      reporter: { name: 'You (this browser)', type: 'local' },
      source: 'local',
      image: input.image ? String(input.image) : '',
      timeline: [{
        status: 'open',
        date: now,
        note: 'Report saved in this browser. It has not been sent to any authority.'
      }]
    };

    issues.push(issue);
    const result = writeIssues(issues);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true, issue: clone(issue), persisted: result.persisted === true };
  }

  /* Public: changes an issue's status and adds a timeline entry.
     Returns { ok, issue, changed, persisted } or { ok: false, error: 'not-found' | 'invalid-status' | 'storage-...' } */
  function updateIssueStatus(id, newStatus, note) {
    if (!isValidStatus(newStatus)) {
      return { ok: false, error: 'invalid-status' };
    }
    const state = loadIssuesState();
    const issue = state.issues.find(function (item) { return item.id === String(id); });
    if (!issue) {
      return { ok: false, error: 'not-found' };
    }
    if (issue.status === newStatus) {
      return { ok: true, changed: false, issue: clone(issue) };
    }
    if (!state.writable) {
      return { ok: false, error: 'storage-unreadable' };
    }

    const now = new Date().toISOString();
    issue.status = newStatus;
    issue.updatedAt = now;
    issue.timeline.push({ status: newStatus, date: now, note: cleanText(note, 300) });

    const result = writeIssues(state.issues);
    if (!result.ok) {
      return { ok: false, error: result.error };
    }
    return { ok: true, changed: true, issue: clone(issue), persisted: result.persisted === true };
  }




  // Returns { ok: true, ids: [...] } or { ok: false } when the browser throws on read.
  function readSupports() {
    const read = readRaw(STORAGE_KEYS.supports);
    if (!read.ok) {
      return { ok: false, ids: [] };
    }
    if (read.value === null) {
      return { ok: true, ids: [] };
    }
    const parsed = parseJson(read.value);
    if (!parsed.ok || !Array.isArray(parsed.value)) {
      storageStatus.supportsListReset = true;      // unreadable list: start empty, but say so
      return { ok: true, ids: [] };
    }
    return {
      ok: true,
      ids: parsed.value.filter(function (value) { return typeof value === 'string'; })
    };
  }

  function hasSupported(id) {
    return readSupports().ids.indexOf(String(id)) !== -1;
  }

  // Step 2 of a support change failed: put the issues key back exactly as it was.
  function undoCountChange(state, originalError) {
    const undo = writeRaw(STORAGE_KEYS.issues, state.raw);
    if (undo.ok) {
      return { ok: false, error: originalError };
    }
    storageStatus.supportStateMayBeInconsistent = true;
    return { ok: false, error: 'storage-inconsistent', inconsistent: true, cause: originalError };
  }

  /* Shared by addSupport() and removeSupport().
     wantSupported: true = add this browser's support, false = take it back. */
  function changeSupport(id, wantSupported) {
    const issueId = String(id);
    const state = loadIssuesState();
    const issue = state.issues.find(function (item) { return item.id === issueId; });
    if (!issue) {
      return { ok: false, error: 'not-found' };
    }
    if (!state.writable) {
      return { ok: false, error: 'storage-unreadable' };
    }

    const supports = readSupports();
    if (!supports.ok) {
      return { ok: false, error: 'storage-unreadable' };
    }
    const alreadySupported = supports.ids.indexOf(issueId) !== -1;
    if (wantSupported && alreadySupported) {
      return { ok: false, error: 'already-supported', issue: clone(issue) };
    }
    if (!wantSupported && !alreadySupported) {
      return { ok: false, error: 'not-supported', issue: clone(issue) };
    }

    // Step 1: the issue's count.
    issue.supportCount = wantSupported ? issue.supportCount + 1 : Math.max(0, issue.supportCount - 1);
    const issuesResult = writeIssues(state.issues);
    if (!issuesResult.ok) {
      return { ok: false, error: issuesResult.error };       // nothing was changed
    }

    // Step 2: the list of supported ids.
    const newIds = wantSupported
      ? supports.ids.concat(issueId)
      : supports.ids.filter(function (value) { return value !== issueId; });
    const supportsResult = writeRaw(STORAGE_KEYS.supports, JSON.stringify(newIds));
    if (!supportsResult.ok) {
      return undoCountChange(state, supportsResult.error);   // keep both keys in step
    }

    return { ok: true, issue: clone(issue), persisted: supportsResult.persisted === true };
  }

  /* Public: adds this browser's support to an issue (once only).
     Returns { ok: true, issue, persisted }
          or { ok: false, error: 'not-found' | 'already-supported' | 'storage-full' |
               'storage-error' | 'storage-unreadable' | 'storage-inconsistent' } */
  function addSupport(id) {
    return changeSupport(id, true);
  }

  /* Public: takes this browser's support back.
     Returns { ok: true, issue, persisted }
          or { ok: false, error: 'not-found' | 'not-supported' | 'storage-full' |
               'storage-error' | 'storage-unreadable' | 'storage-inconsistent' } */
  function removeSupport(id) {
    return changeSupport(id, false);
  }

  /* Public: for a "Support this issue" toggle button.
     Returns { ok: true, supported: true | false, issue, persisted } or { ok: false, error } */
  function toggleSupport(id) {
    if (hasSupported(id)) {
      const removed = removeSupport(id);
      return removed.ok
        ? { ok: true, supported: false, issue: removed.issue, persisted: removed.persisted }
        : removed;
    }
    const added = addSupport(id);
    return added.ok
      ? { ok: true, supported: true, issue: added.issue, persisted: added.persisted }
      : added;
  }


  /* ------------------------------------------------------------------------
     11. Statistics (used by the home and impact pages)
     ------------------------------------------------------------------------ */
  function percentOf(part, total) {
    return total > 0 ? Math.round((part / total) * 100) : 0;
  }

  // Counts issues per value of "key" (category / severity / status),
  // in the same order as the definitions list.
  function breakdownBy(issues, key, definitions) {
    return definitions.map(function (definition) {
      const count = issues.filter(function (issue) { return issue[key] === definition.value; }).length;
      return {
        key: definition.value,
        label: definition.label,
        count: count,
        percent: percentOf(count, issues.length)
      };
    });
  }

  /* Public: one object with every number the home and impact pages need.
     {
       total, totalSupports, resolvedCount, resolutionRate (whole %),
       statusCounts: { open, 'in-progress', resolved },
       statusBreakdown, categoryBreakdown, severityBreakdown: [{ key, label, count, percent }],
       topCategory: { key, label, count } | null
     } */
  function getSummaryStats() {
    const issues = loadIssues();
    const total = issues.length;

    const statusBreakdown = breakdownBy(issues, 'status', STATUSES);
    const categoryBreakdown = breakdownBy(issues, 'category', CATEGORIES);
    const severityBreakdown = breakdownBy(issues, 'severity', SEVERITIES);

    const statusCounts = {};
    statusBreakdown.forEach(function (item) { statusCounts[item.key] = item.count; });

    const totalSupports = issues.reduce(function (sum, issue) { return sum + issue.supportCount; }, 0);

    // Most-reported category (first one wins a tie).
    let topCategory = null;
    categoryBreakdown.forEach(function (item) {
      if (item.count > 0 && (topCategory === null || item.count > topCategory.count)) {
        topCategory = { key: item.key, label: item.label, count: item.count };
      }
    });

    return {
      total: total,
      totalSupports: totalSupports,
      resolvedCount: statusCounts.resolved || 0,
      resolutionRate: percentOf(statusCounts.resolved || 0, total),
      statusCounts: statusCounts,
      statusBreakdown: statusBreakdown,
      categoryBreakdown: categoryBreakdown,
      severityBreakdown: severityBreakdown,
      topCategory: topCategory
    };
  }

  // Public: issues with at least one supporter, most supported first.
  function getMostSupportedIssues(limit) {
    const max = Number.isInteger(limit) && limit > 0 ? limit : 5;
    return getIssues()
      .filter(function (issue) { return issue.supportCount > 0; })
      .sort(function (a, b) {
        return (b.supportCount - a.supportCount) || (new Date(b.createdAt) - new Date(a.createdAt));
      })
      .slice(0, max);
  }

  /* Public: newest timeline events across all issues.
     Each item: { issueId, title, status, date, note, text }
     "text" is a ready-made plain sentence (render it with textContent). */
  function getRecentActivity(limit) {
    const max = Number.isInteger(limit) && limit > 0 ? limit : 6;
    const events = [];
    loadIssues().forEach(function (issue) {
      issue.timeline.forEach(function (entry, index) {
        const text = index === 0
          ? 'New report: ' + issue.title
          : '"' + issue.title + '" is now ' + getStatusLabel(entry.status).toLowerCase() + '.';
        events.push({
          issueId: issue.id,
          title: issue.title,
          status: entry.status,
          date: entry.date,
          note: entry.note,
          text: text
        });
      });
    });
    return events
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); })
      .slice(0, max);
  }


 
  function getStorageStatus() {
    const memory = usingMemory();
    const readFailed = !memory && storageStatus.lastReadFailed;
    const blocked = !memory && storageStatus.unresolvedDataProblem;
    const writeError = storageStatus.lastWriteError;

    let message = null;
    if (memory && forcedMemory) {
      message = 'The browser would not save CivicFix data (storage may be full or blocked), so CivicFix is ' +
        'keeping data in memory only. Reports and supports will be lost when you refresh or close this tab.';
    } else if (memory) {
      message = 'Browser storage is not available here, so CivicFix is keeping data in memory only. ' +
        'Reports and supports will be lost when you refresh or close this tab.';
    } else if (readFailed) {
      message = 'The browser would not let CivicFix read its saved data just now. ' +
        'Saving is switched off so your existing reports are not overwritten.';
    } else if (blocked) {
      message = 'Saved data looks damaged and a backup copy could not be made. ' +
        'Saving is switched off so nothing is overwritten.';
    } else if (storageStatus.supportStateMayBeInconsistent) {
      message = 'A support change could not be completed cleanly, so a supporter count may be off by one in this browser.';
    } else if (writeError === 'storage-full') {
      message = 'Browser storage is full, so the last change was not saved.';
    } else if (writeError) {
      message = 'The browser refused the last save, so the last change was not saved.';
    }

    return {
      mode: memory ? 'memory' : 'local',
      memoryOnly: memory,
      memoryReason: !memory ? null : (forcedMemory ? 'save-failed' : 'unavailable'),
      persistent: !memory && !readFailed && !blocked && writeError === null,
      writable: !readFailed && !blocked,
      lastWriteError: writeError,
      message: message,
      seededSampleData: storageStatus.seededSampleData,
      seedWriteFailed: storageStatus.seedWriteFailed,
      recoveredFromCorruption: storageStatus.recoveredFromCorruption,
      backupKey: storageStatus.backupKey,
      supportsListReset: storageStatus.supportsListReset,
      supportStateMayBeInconsistent: storageStatus.supportStateMayBeInconsistent
    };
  }

  // Public: FOR TESTING ONLY. Replaces ALL saved issues (including reports the
  // user created) with the original sample data and forgets saved supports.
  // Nothing in the website calls this automatically.
  function resetToSampleData() {
    const result = writeIssues(buildSampleIssues());
    writeRaw(STORAGE_KEYS.supports, JSON.stringify([]));
    return result;
  }

  // Run once when the script loads, so sample data exists before any page
  // script asks for it. If data already exists, this only reads it.
  loadIssues();


  /* ------------------------------------------------------------------------
     13. Public API
     ------------------------------------------------------------------------ */
  global.CivicFixData = Object.freeze({
    CATEGORIES: CATEGORIES,
    SEVERITIES: SEVERITIES,
    STATUSES: STATUSES,
    LIMITS: LIMITS,

    getIssues: getIssues,
    getIssueById: getIssueById,
    getSimilarIssues: getSimilarIssues,
    createIssue: createIssue,
    updateIssueStatus: updateIssueStatus,
    validateIssueInput: validateIssueInput,
    getReferenceId: getReferenceId,

    hasSupported: hasSupported,
    addSupport: addSupport,
    removeSupport: removeSupport,
    toggleSupport: toggleSupport,

    getSummaryStats: getSummaryStats,
    getMostSupportedIssues: getMostSupportedIssues,
    getRecentActivity: getRecentActivity,

    getCategoryLabel: getCategoryLabel,
    getSeverityLabel: getSeverityLabel,
    getStatusLabel: getStatusLabel,
    getSeverityBadgeClass: getSeverityBadgeClass,
    getStatusBadgeClass: getStatusBadgeClass,
    getSeverityRank: getSeverityRank,

    formatDate: formatDate,
    toDateAttribute: toDateAttribute,

    getStorageStatus: getStorageStatus,
    resetToSampleData: resetToSampleData
  });
})(window);
