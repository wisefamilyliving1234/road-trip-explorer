/**
 * budget.js
 * -----------------------------------------------------------------------
 * Adventure Funds tab: fund selector, savings-goal calculations, the
 * progress illustration, and the deposit form.
 * -----------------------------------------------------------------------
 */

  // ========== FUNDS (single source of truth for the "Adventure Funds" tab) ==========
  var fundDescriptions = {
    lodging: 'Places where you rest or sleep during the trip, including campgrounds, hotels, motels, Airbnbs, cabins, resorts, cruises, and other overnight accommodations.',
    food: 'Food and drinks purchased during the trip, including restaurants, fast food, grocery stores, gas stations, coffee shops, snacks, drinks, and travel meals.',
    transport: 'Everything that helps the traveler get from place to place, including gasoline, diesel, EV charging, tolls, parking, car washes, vehicle repairs, flat tires, windshield wipers, rental cars, taxis, Uber, Lyft, buses, trains, subways, ferries, flights, airport transportation, cruise transfers, and shuttles.',
    entertainment: 'Activities and experiences during the trip, including parks, museums, movies, tours, attractions, tickets, shows, events, and admission fees.',
    misc: 'Travel expenses that do not clearly belong in Lodging, Food, Transportation, or Entertainment.'
  };

  var fundTips = {
    lodging: 'Compare the total stay price, not only the nightly rate. Cleaning fees, resort fees, campground fees, and parking can change the final cost.',
    food: 'Packing drinks, snacks, or one simple meal each day may help reduce food costs without taking away from special vacation meals.',
    transport: 'Traveling in an RV or camper? Consider a portable electric cooler or refrigerator that plugs into your vehicle. It may reduce the need to buy bags of ice every day.',
    entertainment: 'Check visitor centers, libraries, parks, and community calendars for free or low-cost family activities.',
    misc: 'Leave a little room for unexpected needs such as laundry, forgotten supplies, medicine, or last-minute travel purchases.'
  };

  var currentFund = null;
  var fundData = {};

  // Single fund-selector change handler (a duplicate, simpler handler that only
  // re-set fund-description text was removed — it fired redundantly alongside this one).
  document.getElementById('fund-selector').addEventListener('change', function() {
    var selectedFund = this.value;
    currentFund = selectedFund;
    if (selectedFund) {
      document.getElementById('fund-description').textContent = fundDescriptions[selectedFund] || '';
      document.getElementById('fund-details-section').classList.remove('hidden');
      document.getElementById('calculations-section').classList.remove('hidden');
      document.getElementById('add-money-btn').classList.remove('hidden');
      document.getElementById('progress-scene-section').classList.remove('hidden');
      document.getElementById('tip-section').classList.remove('hidden');
      document.getElementById('fund-tip').textContent = fundTips[selectedFund] || '';
      loadFundData(selectedFund);
      updateFundCalculations(selectedFund);
      updateProgressScene(selectedFund);
    } else {
      document.getElementById('fund-description').textContent = '';
      document.getElementById('fund-details-section').classList.add('hidden');
      document.getElementById('calculations-section').classList.add('hidden');
      document.getElementById('add-money-btn').classList.add('hidden');
      document.getElementById('progress-scene-section').classList.add('hidden');
      document.getElementById('tip-section').classList.add('hidden');
      currentFund = null;
    }
  });

  function loadFundData(fund) {
    if (!fundData[fund]) {
      fundData[fund] = { goal: 0, saved: 0, tripDate: '', nextPayday: '', payFrequency: '' };
    }
    var data = fundData[fund];
    document.getElementById('fund-goal').value = data.goal || '';
    document.getElementById('fund-saved').value = data.saved || '';
    document.getElementById('fund-trip-date').value = data.tripDate || '';
    document.getElementById('fund-next-payday').value = data.nextPayday || '';
    document.getElementById('fund-pay-frequency').value = data.payFrequency || '';
  }

  function saveFundData(fund) {
    if (!fundData[fund]) fundData[fund] = {};
    fundData[fund].goal = Number(document.getElementById('fund-goal').value) || 0;
    fundData[fund].saved = Number(document.getElementById('fund-saved').value) || 0;
    fundData[fund].tripDate = document.getElementById('fund-trip-date').value;
    fundData[fund].nextPayday = document.getElementById('fund-next-payday').value;
    fundData[fund].payFrequency = document.getElementById('fund-pay-frequency').value;
  }

  function updateFundCalculations(fund) {
    if (!currentFund) return;
    saveFundData(fund);
    var data = fundData[fund];
    var goal = Number(data.goal) || 0;
    var saved = Number(data.saved) || 0;
    var remaining = Math.max(0, goal - saved);
    var percentage = goal > 0 ? Math.round((saved / goal) * 100) : 0;
    percentage = Math.min(100, percentage);

    document.getElementById('calc-saved').textContent = '$' + saved.toFixed(2);
    document.getElementById('calc-remaining').textContent = '$' + remaining.toFixed(2);
    document.getElementById('calc-percentage').textContent = percentage + '%';
    document.getElementById('calc-progress-bar').style.width = percentage + '%';

    if (percentage >= 100) {
      document.getElementById('calc-remaining').textContent = '$0';
      document.getElementById('calc-percentage').textContent = '100%';
    }

    var tripDate = data.tripDate ? new Date(data.tripDate) : null;
    var nextPayday = data.nextPayday ? new Date(data.nextPayday) : null;
    var payFreq = data.payFrequency;

    if (!tripDate || !nextPayday || !payFreq || payFreq === 'Variable Income or Tips') {
      if (payFreq === 'Variable Income or Tips') {
        document.getElementById('calc-paydays').textContent = 'Add money whenever you are paid. Your progress and remaining balance will update automatically.';
        document.getElementById('calc-per-payday').textContent = '—';
      } else if (tripDate && nextPayday && tripDate <= nextPayday) {
        document.getElementById('calc-paydays').textContent = 'Trip starts before next payday.';
        document.getElementById('calc-per-payday').textContent = '—';
      } else {
        document.getElementById('calc-paydays').textContent = '—';
        document.getElementById('calc-per-payday').textContent = '—';
      }
    } else {
      var paydayCount = 0;
      var currentPD = new Date(nextPayday);
      var freqDays = { 'Weekly': 7, 'Every Two Weeks': 14, 'Twice a Month': 15, 'Monthly': 30 };
      var daysPerPayPeriod = freqDays[payFreq] || 0;

      while (currentPD <= tripDate) {
        paydayCount++;
        currentPD.setDate(currentPD.getDate() + daysPerPayPeriod);
      }

      var perPayday = paydayCount > 0 ? Math.ceil(remaining / paydayCount * 100) / 100 : 0;
      document.getElementById('calc-paydays').textContent = paydayCount + ' payday(s) remaining';
      document.getElementById('calc-per-payday').textContent = '$' + perPayday.toFixed(2);
    }
  }

  function updateProgressScene(fund) {
    var data = fundData[fund];
    var goal = Number(data.goal) || 0;
    var saved = Number(data.saved) || 0;
    var percentage = goal > 0 ? Math.round((saved / goal) * 100) : 0;
    percentage = Math.min(100, percentage);

    var vehicle = document.getElementById('vehicle');
    var destination = document.getElementById('destination');
    var message = document.getElementById('progress-message');

    var xPos = 50 + (percentage * 3);
    vehicle.setAttribute('transform', 'translate(' + xPos + ', 100)');

    destination.innerHTML = '';
    var destX = 320, destY = 100;

    if (fund === 'lodging') {
      destination.innerHTML = '<rect x="' + (destX - 20) + '" y="' + (destY - 15) + '" width="40" height="30" rx="3" fill="#8b5cf6"/><rect x="' + (destX - 18) + '" y="' + (destY - 12) + '" width="8" height="10" fill="#93c5fd"/><rect x="' + (destX - 7) + '" y="' + (destY - 12) + '" width="8" height="10" fill="#93c5fd"/>';
    } else if (fund === 'food') {
      destination.innerHTML = '<circle cx="' + destX + '" cy="' + destY + '" r="12" fill="#fbbf24"/><circle cx="' + (destX - 6) + '" cy="' + (destY - 6) + '" r="4" fill="#dc2626"/><circle cx="' + (destX + 6) + '" cy="' + (destY - 4) + '" r="4" fill="#dc2626"/>';
    } else if (fund === 'transport') {
      destination.innerHTML = '<polygon points="' + destX + ',' + (destY - 12) + ' ' + (destX + 8) + ',' + destY + ' ' + destX + ',' + (destY + 8) + ' ' + (destX - 8) + ',' + destY + '" fill="#ef4444"/><text x="' + destX + '" y="' + (destY + 2) + '" text-anchor="middle" font-size="8" fill="#fff" font-weight="bold">→</text>';
    } else if (fund === 'entertainment') {
      destination.innerHTML = '<circle cx="' + destX + '" cy="' + destY + '" r="10" fill="#8b5cf6"/><circle cx="' + (destX - 3) + '" cy="' + (destY - 3) + '" r="2" fill="#fbbf24"/><circle cx="' + (destX + 3) + '" cy="' + (destY - 3) + '" r="2" fill="#fbbf24"/><circle cx="' + destX + '" cy="' + (destY + 4) + '" r="2" fill="#fbbf24"/>';
    } else if (fund === 'misc') {
      destination.innerHTML = '<rect x="' + (destX - 10) + '" y="' + (destY - 12) + '" width="20" height="24" rx="2" fill="#06b6d4"/><path d="M ' + (destX - 5) + ' ' + (destY - 10) + ' L ' + (destX + 5) + ' ' + (destY - 5) + '" stroke="#fff" stroke-width="2"/>';
    }

    var msgText = 'Your savings journey begins here.';
    if (percentage >= 100) msgText = 'This fund is ready for the adventure!';
    else if (percentage >= 75) msgText = 'Your goal is getting close!';
    else if (percentage >= 50) msgText = 'Halfway to this travel goal!';
    else if (percentage >= 25) msgText = 'You are making progress!';

    message.textContent = msgText;
  }

  document.addEventListener('input', function() {
    if (currentFund) updateFundCalculations(currentFund);
  });

  document.getElementById('add-money-btn').addEventListener('click', function() {
    document.getElementById('add-money-form').classList.remove('hidden');
    document.getElementById('add-money-form').scrollIntoView({ behavior: 'smooth' });
  });

  window.closeFundForm = function() {
    document.getElementById('add-money-form').classList.add('hidden');
    document.getElementById('deposit-form').reset();
  };

  document.getElementById('deposit-form').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentFund) return;
    var amount = Number(document.getElementById('deposit-amount').value) || 0;
    if (amount <= 0) {
      showStatus('deposit-status', 'Enter a valid amount', false);
      return;
    }
    saveFundData(currentFund);
    fundData[currentFund].saved = (fundData[currentFund].saved || 0) + amount;
    document.getElementById('fund-saved').value = fundData[currentFund].saved;
    updateFundCalculations(currentFund);
    updateProgressScene(currentFund);
    closeFundForm();
    showStatus('deposit-status', 'Deposit added!', true);
  });
