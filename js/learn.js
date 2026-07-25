/**
 * learn.js
 * -----------------------------------------------------------------------
 * Learn tab: interactive educational hub for all U.S. states
 * 
 * Production framework structure:
 * - All 50 states in the state selector
 * - 22 educational categories per state
 * - Grid-based card UI for category selection
 * - Placeholder content for missing data (ready for future content)
 * - Single source of truth: learnData object
 * -----------------------------------------------------------------------
 */

// ========== CATEGORIES & METADATA ==========

var learnCategories = [
  'State Story',
  'Geography',
  'Timeline',
  'Native American History',
  'State Symbols',
  'Capital & Major Cities',
  'Wildlife',
  'Plants & Trees',
  'National Parks',
  'National Historic Sites',
  'National Battlefields',
  'Industries',
  'Agriculture',
  'Food',
  'Music',
  'Festivals',
  'Famous People',
  'Hidden Gems',
  'Weird Laws',
  'Fun Facts',
  'Vocabulary',
  'Quiz'
];

// Category metadata: icon, description, and color accent
var categoryMeta = {
  'State Story': { icon: '📖', description: 'The story of this state', color: 'blue' },
  'Geography': { icon: '🗺️', description: 'Geography and landscape', color: 'green' },
  'Timeline': { icon: '⏳', description: 'Important historical events', color: 'amber' },
  'Native American History': { icon: '🏛️', description: 'Indigenous peoples and history', color: 'rose' },
  'State Symbols': { icon: '🦅', description: 'Official symbols', color: 'purple' },
  'Capital & Major Cities': { icon: '🏙️', description: 'Major cities and capitals', color: 'cyan' },
  'Wildlife': { icon: '🦌', description: 'Native animals and ecosystems', color: 'emerald' },
  'Plants & Trees': { icon: '🌲', description: 'State plants and trees', color: 'lime' },
  'National Parks': { icon: '🏞️', description: 'Protected natural areas', color: 'orange' },
  'National Historic Sites': { icon: '🏛️', description: 'Historic landmarks', color: 'slate' },
  'National Battlefields': { icon: '⚔️', description: 'Historic battlefields', color: 'red' },
  'Industries': { icon: '🏭', description: 'Major industries and economy', color: 'gray' },
  'Agriculture': { icon: '🌾', description: 'Farming and agriculture', color: 'yellow' },
  'Food': { icon: '🍽️', description: 'Regional cuisine and specialties', color: 'orange' },
  'Music': { icon: '🎵', description: 'Musical heritage and genres', color: 'fuchsia' },
  'Festivals': { icon: '🎉', description: 'Annual festivals and events', color: 'pink' },
  'Famous People': { icon: '👥', description: 'Notable people from the state', color: 'indigo' },
  'Hidden Gems': { icon: '💎', description: 'Off-the-beaten-path treasures', color: 'violet' },
  'Weird Laws': { icon: '⚖️', description: 'Unusual local laws', color: 'teal' },
  'Fun Facts': { icon: '✨', description: 'Surprising facts and trivia', color: 'sky' },
  'Vocabulary': { icon: '📚', description: 'Local words and slang', color: 'blue' },
  'Quiz': { icon: '❓', description: 'Test your knowledge', color: 'emerald' }
};

// ========== STATE LIST ==========

var usStates = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California',
  'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri',
  'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
  'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

// ========== LEARN DATA (Single Source of Truth) ==========
// Structure: learnData[state][category] = { title, description, content }
// 
// To add content for a state/category:
// 1. Add or modify the entry in learnData[state][category]
// 2. Include: title, description (short), and content (HTML)
// 3. No other code changes needed
//
// Placeholder format is automatically applied when content is missing

var learnData = {};

// Initialize all 50 states with all 22 categories
usStates.forEach(function(state) {
  learnData[state] = {};
  learnCategories.forEach(function(category) {
    learnData[state][category] = null; // Placeholder: will show "Coming Soon"
  });
});

// ========== SAMPLE CONTENT (Examples for framework testing) ==========
// Note: Replace these with real content as the educational hub is populated

learnData['Florida']['Fun Facts'] = {
  title: 'Florida: Fun Facts',
  description: 'Surprising facts and trivia',
  content: '<div class="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Fact-Checked Learning</div>' +
    '<p class="text-gray-700 leading-relaxed mt-4">Florida is full of unusual stories, surprising facts, and interesting details.</p>' +
    '<div class="bg-emerald-50 rounded-xl p-4 border border-emerald-200 space-y-2 mt-4">' +
    '<h4 class="font-semibold text-gray-900">Alligators and Crocodiles Live Here</h4>' +
    '<p class="text-sm text-gray-700">Southern Florida is one of the rare places where American alligators and American crocodiles can both be found in the wild. They prefer different habitats — alligators in freshwater and crocodiles in brackish water.</p>' +
    '<p class="text-xs italic text-gray-600 mt-2">👨‍👩‍👧 Ask your family: How would you tell an alligator and a crocodile apart?</p>' +
    '</div>' +
    '<div class="bg-amber-50 rounded-xl p-4 border border-amber-200 space-y-2 mt-4">' +
    '<h4 class="font-semibold text-gray-900">Florida\'s Highest Point Is Surprisingly Low</h4>' +
    '<p class="text-sm text-gray-700">Britton Hill is Florida\'s highest natural point, but it rises only about 345 feet above sea level — the lowest state high point in the United States.</p>' +
    '<p class="text-xs italic text-gray-600 mt-2">👨‍👩‍👧 Ask your family: Is your hometown higher than Florida\'s highest point?</p>' +
    '</div>' +
    '<div class="bg-orange-50 rounded-xl p-4 border border-orange-200 space-y-2 mt-4">' +
    '<h4 class="font-semibold text-gray-900">Florida Has an Official State Pie</h4>' +
    '<p class="text-sm text-gray-700">Key lime pie is Florida\'s official state pie. It is closely connected to the Florida Keys and is traditionally made with Key lime juice from the region.</p>' +
    '<p class="text-xs italic text-gray-600 mt-2">👨‍👩‍👧 Ask your family: Would you try a sweet and tart slice of Key lime pie?</p>' +
    '</div>'
};

// ========== DOM ELEMENTS & STATE ==========

var learnStateSelect = document.getElementById('learn-state');
var learnGridContainer = document.getElementById('learn-grid-container');
var learnContentView = document.getElementById('learn-content-view');
var learnContentTitle = document.getElementById('learn-content-title');
var learnContentInner = document.getElementById('learn-content-inner');
var learnBackBtn = document.getElementById('learn-back-btn');

var currentLearnState = '';
var currentLearnCategory = '';

// ========== INITIALIZATION ==========

function initializeLearnTab() {
  if (!learnStateSelect) return;

  // Populate state selector with all 50 states
  usStates.forEach(function(state) {
    var option = new Option(state, state);
    learnStateSelect.appendChild(option);
  });

  // State selection handler
  learnStateSelect.addEventListener('change', function() {
    currentLearnState = this.value;
    currentLearnCategory = '';

    if (currentLearnState) {
      displayCategoryGrid();
    } else {
      hideCategoryGrid();
    }
  });

  // Back button handler
  if (learnBackBtn) {
    learnBackBtn.addEventListener('click', function() {
      currentLearnCategory = '';
      displayCategoryGrid();
    });
  }
}

// ========== DISPLAY FUNCTIONS ==========

function displayCategoryGrid() {
  if (!learnGridContainer) return;

  var html = '<div class="learn-grid">';

  learnCategories.forEach(function(category) {
    var meta = categoryMeta[category] || { icon: '📌', description: '', color: 'gray' };
    var colorClass = getColorClass(meta.color);

    html += '<button type="button" class="learn-card ' + colorClass + '" onclick="selectLearnCategory(\'' + 
            category.replace(/'/g, "\\'") + '\')">' +
            '<div class="learn-card-icon">' + meta.icon + '</div>' +
            '<h3 class="learn-card-title">' + category + '</h3>' +
            '<p class="learn-card-description">' + meta.description + '</p>' +
            '</button>';
  });

  html += '</div>';

  learnGridContainer.innerHTML = html;
  learnGridContainer.classList.remove('hidden');
  learnContentView.classList.add('hidden');
}

function hideCategoryGrid() {
  if (learnGridContainer) {
    learnGridContainer.classList.add('hidden');
  }
  if (learnContentView) {
    learnContentView.classList.add('hidden');
  }
}

function selectLearnCategory(category) {
  if (!currentLearnState) return;

  currentLearnCategory = category;
  displayCategoryContent();
}

function displayCategoryContent() {
  if (!learnContentView || !learnContentInner) return;

  var stateData = learnData[currentLearnState];
  var contentData = stateData ? stateData[currentLearnCategory] : null;
  var meta = categoryMeta[currentLearnCategory] || { icon: '📌' };

  // Update title
  var titleHtml = '<div class="flex items-center gap-2 mb-2">' +
                  '<span class="text-3xl">' + meta.icon + '</span>' +
                  '<h2 class="canva-text font-bold" style="color: rgb(27, 67, 50); font-weight: 700; font-size: 28px;">' +
                  currentLearnState + ': ' + currentLearnCategory + '</h2>' +
                  '</div>';
  learnContentTitle.innerHTML = titleHtml;

  // Display content or placeholder
  if (contentData && contentData.content) {
    learnContentInner.innerHTML = '<div class="space-y-6">' + contentData.content + '</div>';
  } else {
    learnContentInner.innerHTML = getComingSoonPlaceholder(currentLearnState, currentLearnCategory);
  }

  // Show content view, hide grid
  learnGridContainer.classList.add('hidden');
  learnContentView.classList.remove('hidden');
}

function getComingSoonPlaceholder(state, category) {
  return '<div class="bg-gradient-to-br from-slate-50 to-gray-50 rounded-2xl p-8 border border-slate-200 text-center">' +
         '<div class="mb-4">' +
         '<div class="inline-block p-4 bg-white rounded-full mb-4">' +
         '<span class="text-5xl">🔍</span>' +
         '</div>' +
         '</div>' +
         '<h3 class="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h3>' +
         '<p class="text-gray-600 mb-6">Educational content for <strong>' + category + '</strong> in <strong>' + state + '</strong> is being developed.</p>' +
         '<p class="text-sm text-gray-500">Check back soon to explore this topic. In the meantime, visit your local library, visitor center, or tourism board for information about ' + state + '.</p>' +
         '<div class="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">' +
         '<p class="text-sm font-semibold text-blue-900">💡 Did you know?</p>' +
         '<p class="text-sm text-blue-800 mt-1">Each U.S. state has a rich and unique story. Learning about states helps us appreciate the diversity and heritage of our country.</p>' +
         '</div>' +
         '</div>';
}

function getColorClass(colorName) {
  var colorMap = {
    'blue': 'learn-card-blue',
    'green': 'learn-card-green',
    'amber': 'learn-card-amber',
    'rose': 'learn-card-rose',
    'purple': 'learn-card-purple',
    'cyan': 'learn-card-cyan',
    'emerald': 'learn-card-emerald',
    'lime': 'learn-card-lime',
    'orange': 'learn-card-orange',
    'slate': 'learn-card-slate',
    'red': 'learn-card-red',
    'gray': 'learn-card-gray',
    'yellow': 'learn-card-yellow',
    'fuchsia': 'learn-card-fuchsia',
    'pink': 'learn-card-pink',
    'indigo': 'learn-card-indigo',
    'violet': 'learn-card-violet',
    'teal': 'learn-card-teal',
    'sky': 'learn-card-sky'
  };
  return colorMap[colorName] || 'learn-card-gray';
}

// ========== WINDOW EXPORTS ==========

window.selectLearnCategory = selectLearnCategory;

// ========== BOOTSTRAP ==========

document.addEventListener('DOMContentLoaded', function() {
  initializeLearnTab();
});
