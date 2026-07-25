/**
 * local.js
 * -----------------------------------------------------------------------
 * Local tab (formerly "Local Wisdom"): questions to ask a local, saved
 * local tips, trusted official resources, transportation info, food
 * recommendations, and the "From Our Travels" tips list.
 * -----------------------------------------------------------------------
 */

  // ========== LOCAL WISDOM ==========
  var localQuestions = [
    'Where do locals like to eat?',
    'What is one place tourists usually miss?',
    'Is there a farmers market nearby?',
    'What is the best family-friendly activity here?',
    'What is worth driving 30 minutes to see?',
    'Is there anything we should avoid?',
    'Are there road closures or construction areas?',
    'Is Uber, Lyft, taxi, trolley, or shuttle service available?',
    'Where is the easiest place to park?',
    'What is the best free thing to do nearby?',
    'Where would you take your own family?',
    'Is there a scenic route we should know about?'
  ];
  document.getElementById('local-questions').innerHTML = localQuestions.map(function(q) {
    return '<button type="button" class="w-full text-left p-3.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 leading-relaxed hover:border-emerald-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"><span class="text-emerald-500 font-semibold mr-1">"</span>' + q + '</button>';
  }).join('');

  var officialResources = [
    {title:'National Park Service', desc:'Official NPS info on parks, passes, and activities', url:'https://www.nps.gov'},
    {title:'Recreation.gov', desc:'Reserve campsites at national forests and parks', url:'https://www.recreation.gov'},
    {title:'ReserveAmerica', desc:'Book campsites at state parks and private campgrounds', url:'https://www.reserveamerica.com'},
    {title:'America the Beautiful Pass', desc:'Annual pass for entry to 2,000+ federal recreation sites', url:'https://www.nps.gov/planyourvisit/passes.htm'},
    {title:'National Weather Service', desc:'Official weather forecasts and alerts', url:'https://www.weather.gov'},
    {title:'State Road Conditions', desc:'Current road and highway conditions by state', url:'https://www.fhwa.dot.gov/trafficinfo/'},
    {title:'Leave No Trace', desc:'Principles for protecting nature while camping', url:'https://lnt.org'},
    {title:'Junior Ranger Resources', desc:'Free kids programs at national parks', url:'https://www.nps.gov/kids/'},
    {title:'Passport Stamp Info', desc:'Passport to Your National Parks program', url:'https://www.nps.gov/planyourvisit/passport-to-your-national-parks.htm'},
    {title:'Roadside Safety', desc:'Information about staying safe on the road', url:'https://www.safercar.gov'},
    {title:'Emergency Preparedness', desc:'FEMA resources for emergency planning', url:'https://www.ready.gov/'}
  ];
  document.getElementById('official-resources').innerHTML = officialResources.map(function(r) {
    return '<div class="bg-white rounded-xl p-4 border border-gray-200 hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"><h4 class="font-semibold text-gray-900 mb-1 tracking-tight">' + r.title + '</h4><p class="text-sm text-gray-600 mb-3 leading-relaxed">' + r.desc + '</p><a href="' + r.url + '" target="_blank" rel="noopener noreferrer" class="text-sm font-medium text-emerald-700 hover:text-emerald-800">Open Resource →</a></div>';
  }).join('');

  var wisdomTips = [
    {title:'Visitor centers are gold', detail:'Visitor centers are one of the best places to find hidden gems, local restaurants, family-friendly activities, and current road information. Ask staff about their favorite local spots.'},
    {title:'Ask where locals eat', detail:'When you arrive in a new town, ask someone local where they would take their own family. You\'ll get authentic recommendations you won\'t find online.'},
    {title:'Farmers markets matter', detail:'Farmers markets are one of the best ways to experience local food, handmade goods, and community personality. Kids love exploring too.'},
    {title:'Rideshare reality check', detail:'Before relying on rideshare, ask if Uber, Lyft, taxis, trolleys, or shuttles actually operate in that area. Rural locations may have limited options.'},
    {title:'Local advice saves time', detail:'Local advice can save time, save money, and help families make better memories. Don\'t hesitate to ask for recommendations.'}
  ];
  document.getElementById('wisdom-tips').innerHTML = wisdomTips.map(function(t, i) {
    return '<div class="toolbox-card border" id="wis-' + i + '"><div class="toolbox-card-header cursor-pointer" onclick="toggleToolboxCard(\'wis-' + i + '\')"><p class="font-semibold text-gray-800 text-sm pr-4">' + t.title + '</p><span class="toolbox-chevron text-gray-400 text-sm flex-shrink-0">▼</span></div><div class="toolbox-card-body"><div class="px-4 pb-3 pt-2 text-sm text-gray-600 leading-relaxed">' + t.detail + '</div></div></div>';
  }).join('');

  window.openTipsForm = function() { document.getElementById('tips-form-wrapper').classList.remove('hidden'); document.getElementById('tips-form-wrapper').scrollIntoView({behavior:'smooth'}); };
  window.closeTipsForm = function() { document.getElementById('tips-form-wrapper').classList.add('hidden'); document.getElementById('save-tip-form').reset(); };
  window.setRecommend = function(val) { document.getElementById('tf-recommend').value = val; };
  window.openTransportForm = function() { document.getElementById('transport-form-wrapper').classList.remove('hidden'); document.getElementById('transport-form-wrapper').scrollIntoView({behavior:'smooth'}); };
  window.closeTransportForm = function() { document.getElementById('transport-form-wrapper').classList.add('hidden'); document.getElementById('save-transport-form').reset(); };
  window.openFoodForm = function() { document.getElementById('food-form-wrapper').classList.remove('hidden'); document.getElementById('food-form-wrapper').scrollIntoView({behavior:'smooth'}); };
  window.closeFoodForm = function() { document.getElementById('food-form-wrapper').classList.add('hidden'); document.getElementById('save-food-form').reset(); };
  window.setEatAgain = function(val) { document.getElementById('fo-eat-again').value = val; };

  document.getElementById('save-tip-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (allData.length >= 999) { showStatus('save-tip-status', 'Max records reached', false); return; }
    var record = { type: 'local_tip', tip_type: document.getElementById('tf-type').value, tip_place_name: document.getElementById('tf-place').value, tip_address: document.getElementById('tf-address').value, tip_phone: document.getElementById('tf-phone').value, tip_website: document.getElementById('tf-website').value, tip_recommended_by: document.getElementById('tf-recommended').value, tip_notes: document.getElementById('tf-notes').value, tip_recommend: document.getElementById('tf-recommend').value };
    var result = await window.dataSdk.create(record);
    if (result.isOk) { closeTipsForm(); renderLocalTips(); }
    showStatus('save-tip-status', result.isOk ? 'Tip saved!' : 'Error', result.isOk);
  });

  function renderLocalTips() {
    var tips = allData.filter(function(d) { return d.type === 'local_tip'; });
    var container = document.getElementById('saved-tips');
    container.innerHTML = tips.map(function(t) {
      var recIcon = t.tip_recommend === 'yes' ? '👍' : t.tip_recommend === 'maybe' ? '🤷' : '👎';
      return '<div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 hover:shadow-md transition-all duration-200"><div class="flex justify-between items-start mb-2"><h4 class="font-semibold text-gray-900">' + (t.tip_place_name || 'Tip') + '</h4><span class="text-lg">' + recIcon + '</span></div><p class="text-xs text-gray-600 mb-2">' + (t.tip_type || '') + ' • ' + (t.tip_recommended_by || '') + '</p>' + (t.tip_notes ? '<p class="text-sm text-gray-700 mb-2 leading-relaxed">' + t.tip_notes + '</p>' : '') + '<button type="button" onclick="deleteTip(\'' + t.__backendId + '\')" class="text-xs px-2 py-1 bg-red-100 text-red-600 rounded font-medium">Delete</button></div>';
    }).join('');
    if (!tips.length) container.innerHTML = '<p class="text-center text-gray-400 py-4">Your favorite local discoveries will appear here.</p>';
  }
  window.deleteTip = async function(id) { var tip = allData.find(function(d) { return d.__backendId === id; }); if (tip) await window.dataSdk.delete(tip); };

  document.getElementById('save-transport-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (allData.length >= 999) { showStatus('save-transport-status', 'Max records reached', false); return; }
    var record = { type: 'local_transport', transport_name: document.getElementById('tr-name').value, transport_available: document.getElementById('tr-available').value, transport_phone_number: document.getElementById('tr-phone').value, transport_website_url: document.getElementById('tr-website').value, transport_cost: document.getElementById('tr-cost').value, transport_hours: document.getElementById('tr-hours').value, transport_tip: document.getElementById('tr-tip').value };
    var result = await window.dataSdk.create(record);
    if (result.isOk) { closeTransportForm(); renderLocalTransport(); }
    showStatus('save-transport-status', result.isOk ? 'Saved!' : 'Error', result.isOk);
  });

  function renderLocalTransport() {
    var trans = allData.filter(function(d) { return d.type === 'local_transport'; });
    var container = document.getElementById('saved-transport');
    container.innerHTML = trans.map(function(t) {
      return '<div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all duration-200"><h4 class="font-semibold text-gray-900 mb-1">' + (t.transport_name || 'Transport') + '</h4><p class="text-xs text-gray-600 mb-2">Available: ' + (t.transport_available || '—') + '</p>' + (t.transport_tip ? '<p class="text-sm text-gray-700 mb-2 leading-relaxed">' + t.transport_tip + '</p>' : '') + '<button type="button" onclick="deleteTransport(\'' + t.__backendId + '\')" class="text-xs px-2 py-1 bg-red-100 text-red-600 rounded font-medium">Delete</button></div>';
    }).join('');
    if (!trans.length) container.innerHTML = '<p class="text-center text-gray-400 py-4">Your saved ways to get around will appear here.</p>';
  }
  window.deleteTransport = async function(id) { var t = allData.find(function(d) { return d.__backendId === id; }); if (t) await window.dataSdk.delete(t); };

  document.getElementById('save-food-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    if (allData.length >= 999) { showStatus('save-food-status', 'Max records reached', false); return; }
    var record = { type: 'local_food', food_place_name: document.getElementById('fo-place').value, food_type: document.getElementById('fo-type').value, food_address: document.getElementById('fo-address').value, food_recommended_by: document.getElementById('fo-recommended').value, food_what_tried: document.getElementById('fo-tried').value, food_eat_again: document.getElementById('fo-eat-again').value, food_notes: document.getElementById('fo-notes').value };
    var result = await window.dataSdk.create(record);
    if (result.isOk) { closeFoodForm(); renderLocalFood(); }
    showStatus('save-food-status', result.isOk ? 'Saved!' : 'Error', result.isOk);
  });

  function renderLocalFood() {
    var foods = allData.filter(function(d) { return d.type === 'local_food'; });
    var container = document.getElementById('saved-food');
    container.innerHTML = foods.map(function(f) {
      return '<div class="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-4 border border-rose-200 hover:shadow-md transition-all duration-200"><h4 class="font-semibold text-gray-900 mb-1">' + (f.food_place_name || 'Restaurant') + '</h4><p class="text-xs text-gray-600 mb-2">' + (f.food_type || '') + '</p>' + (f.food_what_tried ? '<p class="text-sm text-gray-700 mb-2 leading-relaxed">Tried: ' + f.food_what_tried + '</p>' : '') + '<button type="button" onclick="deleteFood(\'' + f.__backendId + '\')" class="text-xs px-2 py-1 bg-red-100 text-red-600 rounded font-medium">Delete</button></div>';
    }).join('');
    if (!foods.length) container.innerHTML = '<p class="text-center text-gray-400 py-4">Your favorite local food finds will appear here.</p>';
  }
  window.deleteFood = async function(id) { var f = allData.find(function(d) { return d.__backendId === id; }); if (f) await window.dataSdk.delete(f); };
