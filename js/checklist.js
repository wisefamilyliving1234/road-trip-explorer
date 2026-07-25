/**
 * checklist.js
 * -----------------------------------------------------------------------
 * Travel Toolbox tab: emergency contact info, vehicle/RV/comfort/tool-kit
 * checklists (persisted per-device via localStorage), Quick Find,
 * Travel Conditions links, and Wise Family Living tips.
 * -----------------------------------------------------------------------
 */

  // ========== TRAVEL TOOLBOX ==========
  window.toggleToolboxCard = function(id) {
    document.getElementById(id).classList.toggle('open');
  };

  function loadEmergencyInfo() {
    var rec = allData.find(function(d) { return d.type === 'emergency_info'; });
    if (!rec) return;
    var map = {'em-primary-name':'emergency_primary_name','em-primary-rel':'emergency_primary_relationship','em-primary-phone':'emergency_primary_phone','em-secondary-name':'emergency_secondary_name','em-secondary-rel':'emergency_secondary_relationship','em-secondary-phone':'emergency_secondary_phone','em-doctor':'emergency_doctor','em-vet':'emergency_vet','em-insurance':'emergency_insurance','em-roadside-provider':'roadside_provider','em-roadside-member':'roadside_member_number','em-roadside-phone':'roadside_phone','em-roadside-exp':'roadside_expiration','em-ins-company':'insurance_company','em-ins-policy':'insurance_policy','em-ins-phone':'insurance_claims_phone','em-veh-make':'vehicle_make','em-veh-model':'vehicle_model','em-veh-year':'vehicle_year','em-veh-plate':'vehicle_plate','em-veh-vin':'vehicle_vin','em-veh-fuel':'vehicle_fuel','em-veh-tire':'vehicle_tire_size','em-tr-make':'trailer_make','em-tr-model':'trailer_model','em-tr-plate':'trailer_plate','em-tr-vin':'trailer_vin','em-tr-insurance':'trailer_insurance','em-park-pass':'park_pass_type','em-koa':'camping_memberships','em-harvest':'park_pass_number','em-thousand':'roadside_member_number','em-other-camp':'camping_memberships'};
    for (var id in map) { var el = document.getElementById(id); if (el && rec[map[id]]) el.value = rec[map[id]]; }
  }

  document.getElementById('em-save-btn').addEventListener('click', async function() {
    if (allData.length >= 999 && !allData.find(function(d){return d.type==='emergency_info';})) { showStatus('em-status', 'Max records reached', false); return; }
    var record = { type: 'emergency_info', emergency_primary_name: document.getElementById('em-primary-name').value, emergency_primary_relationship: document.getElementById('em-primary-rel').value, emergency_primary_phone: document.getElementById('em-primary-phone').value, emergency_secondary_name: document.getElementById('em-secondary-name').value, emergency_secondary_relationship: document.getElementById('em-secondary-rel').value, emergency_secondary_phone: document.getElementById('em-secondary-phone').value, emergency_doctor: document.getElementById('em-doctor').value, emergency_vet: document.getElementById('em-vet').value, emergency_insurance: document.getElementById('em-insurance').value, roadside_provider: document.getElementById('em-roadside-provider').value, roadside_member_number: document.getElementById('em-roadside-member').value, roadside_phone: document.getElementById('em-roadside-phone').value, roadside_expiration: document.getElementById('em-roadside-exp').value, insurance_company: document.getElementById('em-ins-company').value, insurance_policy: document.getElementById('em-ins-policy').value, insurance_claims_phone: document.getElementById('em-ins-phone').value, vehicle_make: document.getElementById('em-veh-make').value, vehicle_model: document.getElementById('em-veh-model').value, vehicle_year: document.getElementById('em-veh-year').value, vehicle_plate: document.getElementById('em-veh-plate').value, vehicle_vin: document.getElementById('em-veh-vin').value, vehicle_fuel: document.getElementById('em-veh-fuel').value, vehicle_tire_size: document.getElementById('em-veh-tire').value, trailer_make: document.getElementById('em-tr-make').value, trailer_model: document.getElementById('em-tr-model').value, trailer_plate: document.getElementById('em-tr-plate').value, trailer_vin: document.getElementById('em-tr-vin').value, trailer_insurance: document.getElementById('em-tr-insurance').value, park_pass_type: document.getElementById('em-park-pass').value, camping_memberships: document.getElementById('em-other-camp').value };
    var btn = document.getElementById('em-save-btn'); btn.disabled = true; btn.style.opacity = '0.5';
    var existing = allData.find(function(d) { return d.type === 'emergency_info'; });
    var result = existing ? await window.dataSdk.update(Object.assign({}, existing, record)) : await window.dataSdk.create(record);
    btn.disabled = false; btn.style.opacity = '1';
    showStatus('em-status', result.isOk ? 'Emergency info saved! ✓' : 'Error saving', result.isOk);
  });

  // Checklists (localStorage-based, per-device)
  var vehicleItems = ['Check engine oil','Check coolant','Check tire pressure','Inspect tire tread','Check spare tire','Check windshield washer fluid','Test headlights','Test brake lights','Test turn signals','Check battery','Clean windows','Fill fuel tank','Schedule oil change if needed','Charge electronics','Remove unnecessary clutter'];
  var rvItems = ['Test trailer lights','Check electrical connection','Test brakes','Check hitch','Safety chains','Breakaway cable','Check tire pressure','Inspect lug nuts','Check propane','Fill fresh water','Empty gray tank','Empty black tank','Secure cabinets','Check awning','Pack leveling blocks','Secure outdoor gear','Walk completely around camper'];
  var comfortItems = ['Snacks','Water','Cooler','First Aid Kit','Phone Chargers','Medications','Paper Towels','Trash Bags','Pet Supplies'];
  var toolkitItems = ['Flashlight','Extra batteries','Adjustable wrench','Socket set','Screwdrivers','Pliers','Multi-tool','Electrical tape','Duct tape','Zip ties','Portable air compressor','Jumper cables','Work gloves','Reflective safety vest','Electrical tester','Spare trailer fuses','Spare hitch pin','Tire pressure gauge','Emergency triangles'];

  function renderChecklist(containerId, items, storageKey) {
    var saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    var container = document.getElementById(containerId);
    container.innerHTML = items.map(function(item, i) {
      var checked = saved[i] ? 'checked' : '';
      return '<div class="checklist-item"><input type="checkbox" id="' + storageKey + '-' + i + '" ' + checked + ' onchange="saveChecklist(\'' + storageKey + '\',\'' + containerId + '\',' + items.length + ')"><label for="' + storageKey + '-' + i + '" class="text-sm text-gray-700 cursor-pointer">' + item + '</label></div>';
    }).join('');
  }
  window.saveChecklist = function(storageKey, containerId, count) {
    var saved = {};
    for (var i = 0; i < count; i++) { var cb = document.getElementById(storageKey + '-' + i); if (cb && cb.checked) saved[i] = true; }
    localStorage.setItem(storageKey, JSON.stringify(saved));
  };

  renderChecklist('checklist-vehicle', vehicleItems, 'cl_vehicle');
  renderChecklist('checklist-rv', rvItems, 'cl_rv');
  renderChecklist('checklist-comfort', comfortItems, 'cl_comfort');
  renderChecklist('checklist-toolkit', toolkitItems, 'cl_toolkit');

  // Quick Find buttons
  var quickFinds = [
    {label:'⛽ Gas Stations', q:'gas station'},
    {label:'🔌 EV Charging', q:'EV charging station'},
    {label:'🅿️ Rest Areas', q:'rest area'},
    {label:'🚛 Truck Stops', q:'truck stop'},
    {label:'🛒 Grocery Stores', q:'grocery store'},
    {label:'💊 Pharmacies', q:'pharmacy'},
    {label:'🦷 Dentists', q:'dentist'},
    {label:'👓 Vision / Eye Care', q:'eye doctor optometrist'},
    {label:'🏥 Hospitals', q:'hospital'},
    {label:'🩺 Urgent Care', q:'urgent care'},
    {label:'🐾 Emergency Vet', q:'emergency veterinarian'},
    {label:'👕 Laundry', q:'laundromat'},
    {label:'🧊 Ice', q:'ice near me'},
    {label:'🔥 Propane', q:'propane refill'},
    {label:'🏕️ Camping World', q:'Camping World'},
    {label:'🏪 Walmart', q:'Walmart'},
    {label:'🏬 Costco', q:'Costco'},
    {label:'🛍️ Sam\'s Club', q:'Sams Club'},
    {label:'🔧 Hardware Store', q:'hardware store'},
    {label:'🔩 Mechanics / Auto Repair', q:'auto repair mechanic'},
    {label:'🚨 Towing Services', q:'towing service'},
    {label:'🚐 RV Repair', q:'RV repair'},
    {label:'🚿 Dump Stations', q:'RV dump station'},
    {label:'💧 Water Fill', q:'RV water fill station'},
    {label:'🛞 Tire Shops', q:'tire shop'},
    {label:'🏧 Banks / ATMs', q:'bank ATM'},
    {label:'📮 Post Office', q:'post office'},
    {label:'🗺️ Visitor Centers', q:'visitor center'},
    {label:'⛺ Campgrounds', q:'campground'}
  ];
  document.getElementById('quick-find-grid').innerHTML = quickFinds.map(function(qf) {
    return '<a href="https://www.google.com/maps/search/' + encodeURIComponent(qf.q) + '" target="_blank" rel="noopener noreferrer" class="quick-find-btn">' + qf.label + '</a>';
  }).join('');

  // Travel Conditions
  var conditions = [
    {label:'🌤 Weather', url:'https://weather.gov'},
    {label:'📡 Radar', url:'https://radar.weather.gov'},
    {label:'🚧 Road Closures', url:'https://www.fhwa.dot.gov/trafficinfo/'},
    {label:'🚗 Traffic', url:'https://www.google.com/maps/@39,-98,5z/data=!5m1!1e1'},
    {label:'💨 Air Quality', url:'https://www.airnow.gov'},
    {label:'🔥 Wildfire Info', url:'https://www.nifc.gov/fire-information'},
    {label:'⚠️ NWS Alerts', url:'https://alerts.weather.gov'}
  ];
  document.getElementById('conditions-grid').innerHTML = conditions.map(function(c) {
    return '<a href="' + c.url + '" target="_blank" rel="noopener noreferrer" class="quick-find-btn">' + c.label + '</a>';
  }).join('');

  // Tips
  var tips = [
    {title:'Check all trailer lights before leaving.', detail:'A quick 30-second check can prevent a ticket or an accident. Have someone stand behind the trailer while you test brake lights, turn signals, and running lights.'},
    {title:'Walk completely around your vehicle before pulling away.', detail:'This simple habit prevents backing into objects, catches flat tires, and ensures nothing is left on the roof or bumper.'},
    {title:'Carry a basic tool kit.', detail:'A flashlight, adjustable wrench, zip ties, and duct tape can solve 80% of roadside problems without calling for help.'},
    {title:'Store emergency contacts inside your RV.', detail:'Place a card with emergency contact info, insurance details, and medical allergies where first responders could find it.'},
    {title:'Keep roadside assistance info in the app.', detail:'When you\'re stranded on the side of the road in the rain, the last thing you want to do is dig through a glove box.'},
    {title:'Fuel up before entering remote areas.', detail:'Some stretches of highway in the western US can go 100+ miles between gas stations. Don\'t let the tank drop below half in unfamiliar territory.'},
    {title:'Pack snacks before long scenic drives.', detail:'Many of America\'s most beautiful drives have limited services. A cooler with snacks and water keeps everyone happy.'},
    {title:'Reserve popular attractions early.', detail:'Timed entry reservations for places like Glacier, Arches, and Rocky Mountain fill up months in advance.'},
    {title:'Bring layers for changing elevations.', detail:'Mountain passes can be 30°F cooler than the valley floor. A light jacket and warm layer take almost no space.'},
    {title:'Download offline maps before you lose signal.', detail:'Cell service disappears in national parks and rural areas. Download Google Maps offline maps for your route before you leave.'}
  ];
  document.getElementById('tips-list').innerHTML = tips.map(function(t, i) {
    return '<div class="toolbox-card border" id="tip-' + i + '"><div class="toolbox-card-header" onclick="toggleToolboxCard(\'tip-' + i + '\')"><p class="font-medium text-gray-800 text-sm pr-4">💡 ' + t.title + '</p><span class="toolbox-chevron text-gray-400 text-sm flex-shrink-0">▼</span></div><div class="toolbox-card-body"><div class="px-5 pb-4 pt-2 text-sm text-gray-600">' + t.detail + '</div></div></div>';
  }).join('');
