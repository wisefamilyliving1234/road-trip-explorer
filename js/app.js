/**
 * app.js
 * -----------------------------------------------------------------------
 * Application bootstrap + Adventure (Trip Setup) tab.
 *
 * IMPORTANT: this file must be loaded LAST (after storage.js, utilities.js,
 * budget.js, journal.js, campground.js, learn.js, local.js, checklist.js)
 * because the onDataChanged handler below references functions defined in
 * those other files (renderJournalTimeline, renderTripStops, loadEmergencyInfo,
 * renderLocalTips, etc.). See index.html for the required script order.
 * -----------------------------------------------------------------------
 */

  // ========== TAB SWITCHING ==========
  document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
      document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
      btn.classList.add('active');
      var section = document.getElementById('section-' + btn.dataset.tab);
      if (section) section.classList.add('active');
    });
  });

  // Transport toggles - each checkbox independently controls its section
  document.querySelectorAll('[data-transport]').forEach(function(checkbox) {
    checkbox.addEventListener('change', function(e) {
      var transportType = this.dataset.transport;
      var sectionMap = {
        'driving': 'driving-details',
        'flying': 'flying-details',
        'rv': 'rv-details',
        'rental': 'rental-details',
        'train': 'train-details',
        'cruise': 'cruise-details',
        'bus': 'bus-details'
      };
      var sectionId = sectionMap[transportType];
      if (sectionId) {
        var section = document.getElementById(sectionId);
        section.classList.toggle('hidden', !e.target.checked);
      }
    });
  });

  // ========== DATA SDK (single onDataChanged handler — replaces the earlier
  // handler + a second "wrap and reassign" block that bolted on the Local Wisdom renders) ==========
  var handler = {
    onDataChanged: function(data) {
      allData = data;
      tripSetup = data.find(function(d) { return d.type === 'trip_setup'; }) || null;
      if (tripSetup) populateTripForm();
      renderJournalTimeline();
      renderTripStops();
      displayTripSummary();
      loadFinalReflection();
      loadEmergencyInfo();
      renderLocalTips();
      renderLocalTransport();
      renderLocalFood();
    }
  };
  if (window.dataSdk && typeof window.dataSdk.init === 'function') {
    window.dataSdk.init(handler);
  } else {
    console.error('window.dataSdk is undefined - the data_sdk.js include did not load before this script ran. Rendering with no data.');
    handler.onDataChanged([]);
  }

  function populateTripForm() {
    if (!tripSetup) return;
    var fields = {'f-trip-name':'trip_name','f-main-start':'main_start_location','f-main-end':'main_end_location','f-trip-start-date':'trip_start_date','f-trip-end-date':'trip_end_date','f-general-notes':'general_notes','f-driver-names':'driver_names','f-vehicle-nickname':'vehicle_nickname','f-vehicle-type':'vehicle_type','f-driving-start':'driving_start','f-driving-destination':'driving_destination','f-driving-notes':'driving_notes','f-traveler-names':'traveler_names','f-airline':'airline','f-flight-number':'flight_number','f-confirmation-code':'confirmation_code','f-departure-airport':'departure_airport','f-arrival-airport':'arrival_airport','f-departure-date':'departure_date','f-return-date':'return_date','f-ticket-cost':'ticket_cost','f-payment-method':'payment_method','f-flying-notes':'flying_notes','f-rv-type':'rv_type','f-rv-length':'rv_length','f-rv-rental-company':'rv_rental_company','f-rv-pickup-location':'rv_pickup_location','f-rv-pickup-date':'rv_pickup_date','f-rv-return-date':'rv_return_date','f-rv-notes':'rv_notes','f-rental-company':'rental_company','f-rental-pickup-location':'rental_pickup_location','f-rental-pickup-date':'rental_pickup_date','f-rental-return-date':'rental_return_date','f-rental-car-type':'rental_car_type','f-rental-confirmation':'rental_confirmation','f-rental-notes':'rental_notes','f-train-service':'train_service','f-train-route':'train_route','f-train-departure-station':'train_departure_station','f-train-arrival-station':'train_arrival_station','f-train-departure-date':'train_departure_date','f-train-confirmation':'train_confirmation','f-train-notes':'train_notes','f-cruise-line':'cruise_line','f-cruise-ship':'cruise_ship','f-cruise-departure-port':'cruise_departure_port','f-cruise-departure-date':'cruise_departure_date','f-cruise-return-date':'cruise_return_date','f-cruise-confirmation':'cruise_confirmation','f-cruise-notes':'cruise_notes','f-bus-company':'bus_company','f-bus-route':'bus_route','f-bus-departure-station':'bus_departure_station','f-bus-arrival-station':'bus_arrival_station','f-bus-departure-date':'bus_departure_date','f-bus-confirmation':'bus_confirmation','f-bus-notes':'bus_notes'};
    for (var id in fields) { var el = document.getElementById(id); if (el && tripSetup[fields[id]]) el.value = tripSetup[fields[id]]; }
    var roundTripEl = document.getElementById('f-round-trip');
    if (roundTripEl) roundTripEl.checked = tripSetup.round_trip === 'yes';
    // Restore transport checkboxes and their sections
    var transportMap = {'check-driving':'transport_driving','check-flying':'transport_flying','check-rv':'transport_rv','check-rental':'transport_rental','check-train':'transport_train','check-cruise':'transport_cruise','check-bus':'transport_bus'};
    for (var checkId in transportMap) {
      var checkbox = document.getElementById(checkId);
      var fieldName = transportMap[checkId];
      if (checkbox && tripSetup[fieldName] === 'yes') {
        checkbox.checked = true;
        var event = new Event('change', { bubbles: true });
        checkbox.dispatchEvent(event);
      }
    }
  }

  // Trip form
  document.getElementById('trip-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    var record = { type: 'trip_setup', trip_name: document.getElementById('f-trip-name').value, main_start_location: document.getElementById('f-main-start').value, main_end_location: document.getElementById('f-main-end').value, trip_start_date: document.getElementById('f-trip-start-date').value, trip_end_date: document.getElementById('f-trip-end-date').value, general_notes: document.getElementById('f-general-notes').value, transport_driving: document.getElementById('check-driving').checked ? 'yes' : 'no', transport_flying: document.getElementById('check-flying').checked ? 'yes' : 'no', transport_rv: document.getElementById('check-rv').checked ? 'yes' : 'no', transport_rental: document.getElementById('check-rental').checked ? 'yes' : 'no', transport_train: document.getElementById('check-train').checked ? 'yes' : 'no', transport_cruise: document.getElementById('check-cruise').checked ? 'yes' : 'no', transport_bus: document.getElementById('check-bus').checked ? 'yes' : 'no', driver_names: document.getElementById('f-driver-names').value, vehicle_nickname: document.getElementById('f-vehicle-nickname').value, vehicle_type: document.getElementById('f-vehicle-type').value, round_trip: document.getElementById('f-round-trip').checked ? 'yes' : 'no', driving_start: document.getElementById('f-driving-start').value, driving_destination: document.getElementById('f-driving-destination').value, driving_notes: document.getElementById('f-driving-notes').value, traveler_names: document.getElementById('f-traveler-names').value, airline: document.getElementById('f-airline').value, flight_number: document.getElementById('f-flight-number').value, confirmation_code: document.getElementById('f-confirmation-code').value, departure_airport: document.getElementById('f-departure-airport').value, arrival_airport: document.getElementById('f-arrival-airport').value, departure_date: document.getElementById('f-departure-date').value, return_date: document.getElementById('f-return-date').value, ticket_cost: Number(document.getElementById('f-ticket-cost').value) || 0, payment_method: document.getElementById('f-payment-method').value, flying_notes: document.getElementById('f-flying-notes').value, rv_type: document.getElementById('f-rv-type').value, rv_length: document.getElementById('f-rv-length').value, rv_rental_company: document.getElementById('f-rv-rental-company').value, rv_pickup_location: document.getElementById('f-rv-pickup-location').value, rv_pickup_date: document.getElementById('f-rv-pickup-date').value, rv_return_date: document.getElementById('f-rv-return-date').value, rv_notes: document.getElementById('f-rv-notes').value, rental_company: document.getElementById('f-rental-company').value, rental_pickup_location: document.getElementById('f-rental-pickup-location').value, rental_pickup_date: document.getElementById('f-rental-pickup-date').value, rental_return_date: document.getElementById('f-rental-return-date').value, rental_car_type: document.getElementById('f-rental-car-type').value, rental_confirmation: document.getElementById('f-rental-confirmation').value, rental_notes: document.getElementById('f-rental-notes').value, train_service: document.getElementById('f-train-service').value, train_route: document.getElementById('f-train-route').value, train_departure_station: document.getElementById('f-train-departure-station').value, train_arrival_station: document.getElementById('f-train-arrival-station').value, train_departure_date: document.getElementById('f-train-departure-date').value, train_confirmation: document.getElementById('f-train-confirmation').value, train_notes: document.getElementById('f-train-notes').value, cruise_line: document.getElementById('f-cruise-line').value, cruise_ship: document.getElementById('f-cruise-ship').value, cruise_departure_port: document.getElementById('f-cruise-departure-port').value, cruise_departure_date: document.getElementById('f-cruise-departure-date').value, cruise_return_date: document.getElementById('f-cruise-return-date').value, cruise_confirmation: document.getElementById('f-cruise-confirmation').value, cruise_notes: document.getElementById('f-cruise-notes').value, bus_company: document.getElementById('f-bus-company').value, bus_route: document.getElementById('f-bus-route').value, bus_departure_station: document.getElementById('f-bus-departure-station').value, bus_arrival_station: document.getElementById('f-bus-arrival-station').value, bus_departure_date: document.getElementById('f-bus-departure-date').value, bus_confirmation: document.getElementById('f-bus-confirmation').value, bus_notes: document.getElementById('f-bus-notes').value };
    var btn = document.querySelector('[data-template-id="save-trip-btn"]'); btn.disabled = true; btn.style.opacity = '0.5';
    var result = tripSetup ? await window.dataSdk.update(Object.assign({}, tripSetup, record)) : await window.dataSdk.create(record);
    btn.disabled = false; btn.style.opacity = '1';
    showStatus('trip-status', result.isOk ? 'Trip saved!' : 'Error saving trip', result.isOk);
  });

  function displayTripSummary() {
    if (!tripSetup || !tripSetup.trip_name) { document.getElementById('trip-summary').classList.add('hidden'); return; }
    document.getElementById('summary-content').innerHTML = '<div><strong>Trip:</strong> ' + tripSetup.trip_name + '</div>' + (tripSetup.main_start_location ? '<div><strong>Route:</strong> ' + tripSetup.main_start_location + ' → ' + (tripSetup.main_end_location || '') + '</div>' : '');
    document.getElementById('trip-summary').classList.remove('hidden');
  }
