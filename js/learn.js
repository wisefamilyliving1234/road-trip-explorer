/**
 * learn.js
 * -----------------------------------------------------------------------
 * Learn tab: state/topic exploration, backed by the learnData object
 * (single source of truth — see the object literal below for how to
 * add new state/topic content).
 * -----------------------------------------------------------------------
 */

  // ========== LEARN TAB (single source of truth — the earlier duplicate handler,
  // a dangling/corrupted leftover state-content object, and an undefined "stateOptions"
  // reference that broke script execution have all been removed) ==========
  var learnTopics = ['History','Geography','Wildlife','State Symbols','National Parks','Famous Places','Hidden Gems','Fun Facts','Roadside Attractions','Food','Famous People','Major Cities','Climate','Native American History','Economy','Agriculture'];

  // learnData[state][topic] = { title, content } — single source of truth for Learn tab content.
  // To add a new state/topic later, add another entry here; no other code needs to change.
  var learnData = {
    Florida: {
      'Fun Facts': {
        title: 'Florida: Fun Facts',
        content: '<div class="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Fact-Checked Learning</div>' +
          '<p class="text-gray-700 leading-relaxed">Florida is full of unusual stories, surprising facts, and interesting details. Some amazing facts are real, while others are outdated or misunderstood. Wise Family Living will clearly label each one so families know what is verified.</p>' +
          '<div class="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-2">' +
          '<h4 class="font-semibold text-gray-900">Alligators and Crocodiles Live Here</h4>' +
          '<p class="text-sm text-gray-700">Southern Florida is one of the rare places where American alligators and American crocodiles can both be found in the wild. They prefer different habitats, but their ranges overlap in parts of South Florida.</p>' +
          '<p class="text-xs italic text-gray-600 mt-2">👨\u200d👩\u200d👧 Ask your family: How would you tell an alligator and a crocodile apart?</p>' +
          '</div>' +
          '<div class="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-2">' +
          '<h4 class="font-semibold text-gray-900">Florida\'s Highest Point Is Surprisingly Low</h4>' +
          '<p class="text-sm text-gray-700">Britton Hill is Florida\'s highest natural point, but it rises only about 345 feet above sea level. Florida has the lowest state high point in the United States.</p>' +
          '<p class="text-xs italic text-gray-600 mt-2">👨\u200d👩\u200d👧 Ask your family: Is your hometown higher than Florida\'s highest point?</p>' +
          '</div>' +
          '<div class="bg-orange-50 rounded-xl p-4 border border-orange-200 space-y-2">' +
          '<h4 class="font-semibold text-gray-900">Florida Has an Official State Pie</h4>' +
          '<p class="text-sm text-gray-700">Key lime pie is Florida\'s official state pie. It is closely connected to the Florida Keys and is traditionally made with Key lime juice.</p>' +
          '<p class="text-xs italic text-gray-600 mt-2">👨\u200d👩\u200d👧 Ask your family: Would you try a sweet and tart slice of Key lime pie?</p>' +
          '</div>' +
          '<div class="bg-indigo-50 rounded-xl p-4 border border-indigo-200">' +
          '<h4 class="font-semibold text-gray-900 mb-2">Tell Someone in the Car</h4>' +
          '<p class="text-sm text-gray-700">Florida\'s highest point is only about 345 feet above sea level. Did you expect it to be higher or lower?</p>' +
          '</div>'
      }
    }
  };

  var learnStateSelect = document.getElementById('learn-state');
  var learnTopicSelect = document.getElementById('learn-topic');
  var learnStatus = document.getElementById('learn-status');
  var learnContentDiv = document.getElementById('learn-content');
  var learnContentInner = document.getElementById('learn-content-inner');

  if (learnStateSelect && learnTopicSelect) {
    learnTopicSelect.disabled = true;
    learnTopics.forEach(function(topic) { learnTopicSelect.appendChild(new Option(topic, topic)); });

    var learnSelectedState = '';
    var learnSelectedTopic = '';

    learnStateSelect.addEventListener('change', function() {
      learnSelectedState = this.value;
      learnSelectedTopic = '';

      if (learnSelectedState) {
        learnTopicSelect.disabled = false;
        learnTopicSelect.value = '';
        learnStatus.textContent = 'Now choose a topic to explore ' + learnSelectedState + '.';
        learnContentDiv.classList.add('hidden');
        learnContentInner.innerHTML = '';
      } else {
        learnTopicSelect.disabled = true;
        learnStatus.textContent = 'Choose a state above to begin.';
        learnContentDiv.classList.add('hidden');
        learnContentInner.innerHTML = '';
      }
    });

    learnTopicSelect.addEventListener('change', function() {
      learnSelectedTopic = this.value;

      if (learnSelectedTopic && learnSelectedState) {
        learnStatus.textContent = 'Exploring ' + learnSelectedTopic + ' in ' + learnSelectedState;
        learnContentDiv.classList.remove('hidden');
        displayLearnContent();
      } else if (learnSelectedState && !learnSelectedTopic) {
        learnStatus.textContent = 'Now choose a topic to explore ' + learnSelectedState + '.';
        learnContentDiv.classList.add('hidden');
        learnContentInner.innerHTML = '';
      }
    });

    function displayLearnContent() {
      var stateData = learnData[learnSelectedState];
      var topicData = stateData ? stateData[learnSelectedTopic] : null;

      if (!topicData) {
        learnContentInner.innerHTML = '<p class="text-gray-600">Detailed information for this state and topic is coming soon.</p>';
        return;
      }

      var html = '<div class="space-y-6">';
      html += '<h3 class="text-2xl font-bold text-gray-900">' + topicData.title + '</h3>';
      html += topicData.content;

      if (learnSelectedState === 'Florida' && learnSelectedTopic === 'Fun Facts') {
        var learned = localStorage.getItem('learn_florida_funfacts') === 'true';
        html += '<button type="button" id="learn-mark-btn" class="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition" onclick="markLearnedFunFacts()">';
        html += learned ? '✓ Learned' : 'Mark as Learned';
        html += '</button>';
      }

      html += '</div>';
      learnContentInner.innerHTML = html;
    }
  }

  window.markLearnedFunFacts = function() {
    localStorage.setItem('learn_florida_funfacts', 'true');
    var btn = document.getElementById('learn-mark-btn');
    if (btn) {
      btn.textContent = '✓ Learned';
      btn.disabled = true;
      btn.style.opacity = '0.7';
    }
  };
