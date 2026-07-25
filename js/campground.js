/**
 * campground.js
 * -----------------------------------------------------------------------
 * Trip Stops tab: lodging/campground reservations — today's stop,
 * overview stats, the stop timeline, and the add-stop form.
 * -----------------------------------------------------------------------
 */

  // ========== TRIP STOPS ==========
  function getLodgings() { return allData.filter(function(d) { return d.type === 'lodging'; }).sort(function(a, b) { return (a.lodging_checkin || '').localeCompare(b.lodging_checkin || ''); }); }
  function calcNights(checkin, checkout) { if (!checkin || !checkout) return 0; return Math.max(0, Math.round((new Date(checkout) - new Date(checkin)) / 86400000)); }
  function getPaymentStatus(total, paid) { total = Number(total) || 0; paid = Number(paid) || 0; if (total === 0 && paid === 0) return { label: 'Not Reserved', bg: 'bg-gray-100 text-gray-600' }; if (paid >= total) return { label: 'Paid in Full', bg: 'bg-green-100 text-green-700' }; if (paid > 0) return { label: 'Deposit Paid', bg: 'bg-amber-100 text-amber-700' }; return { label: 'Payment Due', bg: 'bg-red-100 text-red-700' }; }
  function formatDate(d) { if (!d) return ''; var p = d.split('-'); return p[1] + '/' + p[2] + '/' + p[0]; }

  function renderTripStops() {
    var lodgings = getLodgings();
    var today = new Date().toISOString().split('T')[0];
    var todayStop = lodgings.find(function(l) { return l.lodging_checkin <= today && (l.lodging_checkout || '9999') >= today; });
    var container = document.getElementById('stops-today');
    if (todayStop) { var status = getPaymentStatus(todayStop.lodging_total, todayStop.lodging_paid); container.innerHTML = '<div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-md border-2 border-emerald-200"><div class="flex items-center justify-between mb-4"><h3 class="text-lg font-bold text-emerald-800">✨ Today\'s Stop</h3><span class="px-3 py-1 text-xs font-semibold rounded-full ' + status.bg + '">' + status.label + '</span></div><h4 class="text-2xl font-bold text-gray-900 mb-1">' + (todayStop.lodging_name || '') + '</h4></div>'; }
    else { container.innerHTML = '<div class="rounded-2xl p-6 bg-gray-50 border-2 border-dashed border-gray-200 text-center"><p class="text-gray-500 text-lg">No check-in today</p></div>'; }
    var totalStops = lodgings.length; var totalNights = lodgings.reduce(function(s, l) { return s + calcNights(l.lodging_checkin, l.lodging_checkout); }, 0);
    document.getElementById('stops-overview').innerHTML = '<div class="bg-white rounded-2xl p-5 text-center shadow-sm border border-emerald-100"><p class="text-xs text-gray-500 font-semibold mb-1">Total Stops</p><p class="text-3xl font-bold text-emerald-700">' + totalStops + '</p></div><div class="bg-white rounded-2xl p-5 text-center shadow-sm border border-blue-100"><p class="text-xs text-gray-500 font-semibold mb-1">Total Nights</p><p class="text-3xl font-bold text-blue-700">' + totalNights + '</p></div>';
    var timelineEl = document.getElementById('stops-timeline');
    if (!lodgings.length) { timelineEl.innerHTML = '<div class="text-center py-8 text-gray-400"><p>No stops added yet</p></div>'; return; }
    timelineEl.innerHTML = lodgings.map(function(l, idx) { var nights = calcNights(l.lodging_checkin, l.lodging_checkout); var status = getPaymentStatus(Number(l.lodging_total), Number(l.lodging_paid)); return '<div class="stop-card bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" data-stop-idx="' + idx + '"><div class="p-5 cursor-pointer" onclick="toggleStop(' + idx + ')"><div class="flex items-center justify-between"><div class="flex-1 min-w-0"><h4 class="font-bold text-gray-900 truncate">' + (l.lodging_name || 'Stop ' + (idx+1)) + '</h4><p class="text-sm text-gray-500">' + formatDate(l.lodging_checkin) + ' → ' + formatDate(l.lodging_checkout) + (nights ? ' • ' + nights + ' nights' : '') + '</p></div><span class="px-2.5 py-1 text-xs font-semibold rounded-full ' + status.bg + '">' + status.label + '</span></div></div><div class="stop-detail" id="stop-detail-' + idx + '"><div class="px-5 pb-5 border-t border-gray-100 pt-4"><button type="button" onclick="deleteStop(' + idx + ')" class="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-200">🗑️ Delete</button></div></div></div>'; }).join('');
  }
  window.toggleStop = function(idx) { var card = document.querySelectorAll('.stop-card')[idx]; var detail = document.getElementById('stop-detail-' + idx); if (!card || !detail) return; card.classList.toggle('expanded'); detail.classList.toggle('open'); };
  window.deleteStop = async function(idx) { var lodgings = getLodgings(); if (lodgings[idx]) await window.dataSdk.delete(lodgings[idx]); };

  document.getElementById('stops-add-btn').addEventListener('click', function() { document.getElementById('stops-form').reset(); document.getElementById('stops-form-wrapper').classList.remove('hidden'); document.getElementById('stops-form-wrapper').scrollIntoView({ behavior: 'smooth' }); });
  document.getElementById('stops-cancel-btn').addEventListener('click', function() { document.getElementById('stops-form-wrapper').classList.add('hidden'); });
  document.getElementById('stops-scan-btn').addEventListener('click', function() { showStatus('stops-form-status', 'Scan & Autofill will be available in a future update.', false); });
  ['sf-rate', 'sf-taxes', 'sf-checkin', 'sf-checkout'].forEach(function(id) { document.getElementById(id).addEventListener('input', calcStopTotal); });
  function calcStopTotal() { var nights = calcNights(document.getElementById('sf-checkin').value, document.getElementById('sf-checkout').value); var rate = Number(document.getElementById('sf-rate').value) || 0; var taxes = Number(document.getElementById('sf-taxes').value) || 0; document.getElementById('sf-total').value = (nights * rate + taxes).toFixed(2); }

  document.getElementById('stops-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (allData.length >= 999) { showStatus('stops-form-status', 'Maximum 999 records reached', false); return; }
    var record = { type: 'lodging', lodging_name: document.getElementById('sf-name').value, lodging_type: document.getElementById('sf-type').value, lodging_address: document.getElementById('sf-address').value, lodging_phone: document.getElementById('sf-phone').value, lodging_email: document.getElementById('sf-email').value, lodging_website: document.getElementById('sf-website').value, lodging_confirmation: document.getElementById('sf-confirmation').value, lodging_checkin: document.getElementById('sf-checkin').value, lodging_checkout: document.getElementById('sf-checkout').value, lodging_checkin_time: document.getElementById('sf-checkin-time').value, lodging_checkout_time: document.getElementById('sf-checkout-time').value, lodging_nights: calcNights(document.getElementById('sf-checkin').value, document.getElementById('sf-checkout').value), lodging_site_number: document.getElementById('sf-site-number').value, lodging_site_type: document.getElementById('sf-site-type').value, lodging_rate: Number(document.getElementById('sf-rate').value) || 0, lodging_taxes: Number(document.getElementById('sf-taxes').value) || 0, lodging_total: Number(document.getElementById('sf-total').value) || 0, lodging_paid: Number(document.getElementById('sf-paid').value) || 0, lodging_payment_method: document.getElementById('sf-payment-method').value, lodging_notes: document.getElementById('sf-notes').value };
    var result = await window.dataSdk.create(record);
    if (result.isOk) { document.getElementById('stops-form').reset(); document.getElementById('stops-form-wrapper').classList.add('hidden'); }
    showStatus('stops-form-status', result.isOk ? 'Stop saved!' : 'Error', result.isOk);
  });
