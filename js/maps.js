/**
 * maps.js
 * -----------------------------------------------------------------------
 * Map tab ("Today's Drive"): morning/evening odometer entry and the
 * automatic daily + total mileage calculation.
 * -----------------------------------------------------------------------
 */

  // Mileage auto-calculation
  function updateMileage() {
    var morning = Number(document.getElementById('map-morning-odo').value);
    var evening = Number(document.getElementById('map-evening-odo').value);
    var todayDriven = 0;

    if (!isNaN(morning) && !isNaN(evening) && evening > 0) {
      todayDriven = Math.max(0, evening - morning);
    }

    document.getElementById('map-miles-driven').value = todayDriven;
    recalcTotalMiles();
  }

  function recalcTotalMiles() {
    var mapDailyMiles = Number(document.getElementById('map-miles-driven').value) || 0;
    document.getElementById('map-total-miles').value = mapDailyMiles;
  }

  document.getElementById('map-morning-odo').addEventListener('input', updateMileage);
  document.getElementById('map-evening-odo').addEventListener('input', updateMileage);
