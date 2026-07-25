/**
 * storage.js
 * -----------------------------------------------------------------------
 * Local, offline-first data layer for Wise Family Living Road Trip Explorer.
 *
 * The original prototype was built on a proprietary in-house "dataSdk"
 * (loaded from a private /_sdk/ path) that only exists inside that
 * platform's own hosting environment. This file REPLACES that dependency
 * with a real, self-contained implementation backed by localStorage, using
 * the exact same call signature the rest of the app already expects:
 *
 *   window.dataSdk.init(handler)         -> handler.onDataChanged(records)
 *   await window.dataSdk.create(record)  -> { isOk: true/false }
 *   await window.dataSdk.update(record)  -> { isOk: true/false }
 *   await window.dataSdk.delete(record)  -> { isOk: true/false }
 *
 * Because the signature matches exactly, none of the other modules
 * (app.js, budget.js, journal.js, campground.js, learn.js, local.js,
 * checklist.js) needed to change how they call window.dataSdk.
 *
 * This also means the app now genuinely works OFFLINE, since all data
 * lives in the browser's localStorage — no network round-trip required
 * to save or load a single record.
 *
 * NOTE for future hardening: localStorage has a per-origin size limit
 * (typically 5-10MB) and stores everything as strings synchronously on
 * the main thread. Since this app stores compressed journal photos as
 * base64 data URLs, a future iteration should migrate this file to
 * IndexedDB (larger quota, async, better suited to binary/image data)
 * without changing the public API above — every other file calls
 * window.dataSdk the same way regardless of what backs it.
 * -----------------------------------------------------------------------
 */
(function () {
  var STORAGE_KEY = 'wfl_road_trip_explorer_records_v1';

  function loadRecords() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error('storage.js: failed to read records from localStorage', err);
      return [];
    }
  }

  function saveRecords(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true;
    } catch (err) {
      console.error('storage.js: failed to write records to localStorage (storage may be full)', err);
      return false;
    }
  }

  function makeId() {
    return 'r_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
  }

  var records = loadRecords();
  var handler = null;

  function notify() {
    if (handler && typeof handler.onDataChanged === 'function') {
      handler.onDataChanged(records.slice());
    }
  }

  window.dataSdk = {
    init: function (h) {
      handler = h;
      notify();
    },
    create: function (record) {
      return new Promise(function (resolve) {
        var rec = Object.assign({}, record, { __backendId: makeId() });
        records.push(rec);
        var ok = saveRecords(records);
        notify();
        resolve({ isOk: ok });
      });
    },
    update: function (record) {
      return new Promise(function (resolve) {
        var idx = records.findIndex(function (r) { return r.__backendId === record.__backendId; });
        if (idx === -1) { resolve({ isOk: false }); return; }
        records[idx] = record;
        var ok = saveRecords(records);
        notify();
        resolve({ isOk: ok });
      });
    },
    delete: function (record) {
      return new Promise(function (resolve) {
        var before = records.length;
        records = records.filter(function (r) { return r.__backendId !== record.__backendId; });
        var ok = saveRecords(records) && records.length < before;
        notify();
        resolve({ isOk: ok });
      });
    }
  };
})();
