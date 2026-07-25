/**
 * utilities.js
 * -----------------------------------------------------------------------
 * Shared state and helper functions used across multiple tabs/modules.
 * Loaded early (after storage.js) so every other module can rely on
 * `allData`, `tripSetup`, and `showStatus` already existing.
 *
 * This project intentionally uses plain global-scope <script> files
 * (no bundler, no ES modules) so it can be deployed as-is to any static
 * host, including Cloudflare Pages, with zero build step required.
 * -----------------------------------------------------------------------
 */

  var allData = [];
  var tripSetup = null;
// State list + population, shared by the Map tab and the Journal tab.
  // State list used by Map and Journal tabs only (Learn tab has its own hardcoded <option> list in the HTML)
  var stateList = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];

  var mapMorningState = document.getElementById('map-morning-state');
  var mapEveningState = document.getElementById('map-evening-state');
  var jsState = document.getElementById('js-state');

  if (mapMorningState) stateList.forEach(function(s) { mapMorningState.appendChild(new Option(s, s)); });
  if (mapEveningState) stateList.forEach(function(s) { mapEveningState.appendChild(new Option(s, s)); });
  if (jsState) stateList.forEach(function(s) { jsState.appendChild(new Option(s, s)); });

  document.getElementById('map-date').value = new Date().toISOString().split('T')[0];
  function showStatus(id, msg, ok) { var el = document.getElementById(id); if (!el) return; el.textContent = msg; el.className = 'mt-2 text-center text-sm ' + (ok ? 'text-green-600' : 'text-red-600'); el.classList.remove('hidden'); setTimeout(function() { el.classList.add('hidden'); }, 3000); }
