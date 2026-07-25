/**
 * journal.js
 * -----------------------------------------------------------------------
 * Travel Memories (Journal) tab: daily stories, the multi-photo gallery
 * per memory category with user-chosen cover photos, the "Who Shared
 * Today With Us" people list, the "Would You Come Back Here" question,
 * star ratings, the Trip Book summary, and the final trip reflection.
 * -----------------------------------------------------------------------
 */

var jsRating = 0;
var jsReturnValue = '';

  // ---- Journal photo categories: each category holds an array of {id, src} photos,
  // plus an explicitly user-chosen cover photo id (never auto-picked). ----
  var journalPhotoCategories = ['view', 'landmark', 'family', 'nature', 'food', 'funny', 'gem', 'memory'];
  var journalPhotos = {};
  var journalPhotoCover = {};
  var journalPhotoIdCounter = 1;
  journalPhotoCategories.forEach(function(c) { journalPhotos[c] = []; journalPhotoCover[c] = null; });
  var journalGalleryOpenCategory = null;

  function renderPhotoSlot(category) {
    var slot = document.querySelector('.journal-photo-slot[data-category="' + category + '"]');
    if (!slot) return;
    var photos = journalPhotos[category] || [];
    var cover = slot.querySelector('.journal-photo-cover');
    var badge = slot.querySelector('.journal-photo-badge');
    var coverPhoto = photos.find(function(p) { return p.id === journalPhotoCover[category]; });
    if (coverPhoto) {
      slot.classList.add('has-photos');
      cover.innerHTML = '<img class="journal-photo-cover-img" src="' + coverPhoto.src + '" alt="' + slot.dataset.label + ' cover photo">';
    } else {
      slot.classList.remove('has-photos');
      cover.innerHTML = '<span class="text-2xl block mb-1">' + slot.dataset.emoji + '</span>';
    }
    if (photos.length) {
      badge.textContent = '📷 ' + photos.length;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
    }
  }
  function renderAllPhotoSlots() { journalPhotoCategories.forEach(renderPhotoSlot); }

  function renderGalleryGrid() {
    var category = journalGalleryOpenCategory;
    var photos = journalPhotos[category] || [];
    var grid = document.getElementById('journal-gallery-grid');
    var empty = document.getElementById('journal-gallery-empty');
    var hint = document.getElementById('journal-gallery-hint');
    if (!photos.length) { grid.innerHTML = ''; empty.classList.remove('hidden'); hint.classList.add('hidden'); return; }
    empty.classList.add('hidden');
    hint.classList.toggle('hidden', photos.length < 1);
    grid.innerHTML = photos.map(function(photo, i) {
      var isCover = journalPhotoCover[category] === photo.id;
      var leftBtn = i > 0 ? '<span class="journal-gallery-move journal-gallery-move-left" onclick="event.stopPropagation(); movePhoto(\'' + category + '\', ' + i + ', -1)">◀</span>' : '';
      var rightBtn = i < photos.length - 1 ? '<span class="journal-gallery-move journal-gallery-move-right" onclick="event.stopPropagation(); movePhoto(\'' + category + '\', ' + i + ', 1)">▶</span>' : '';
      var coverLabel = isCover ? '<span class="journal-gallery-cover-label">★ Cover</span>' : '';
      return '<div class="journal-gallery-thumb' + (isCover ? ' is-cover' : '') + '" onclick="setCoverPhoto(\'' + category + '\', \'' + photo.id + '\')"><img src="' + photo.src + '" alt="Photo ' + (i + 1) + '">' + coverLabel + '<span class="journal-gallery-remove" onclick="event.stopPropagation(); removePhoto(\'' + category + '\', ' + i + ')">×</span>' + leftBtn + rightBtn + '</div>';
    }).join('');
  }

  window.openPhotoGallery = function(category) {
    journalGalleryOpenCategory = category;
    var slot = document.querySelector('.journal-photo-slot[data-category="' + category + '"]');
    if (!slot) return;
    document.getElementById('journal-gallery-emoji').textContent = slot.dataset.emoji;
    document.getElementById('journal-gallery-title').textContent = slot.dataset.label;
    renderGalleryGrid();
    document.getElementById('journal-photo-gallery-modal').classList.remove('hidden');
  };
  window.closePhotoGallery = function() {
    document.getElementById('journal-photo-gallery-modal').classList.add('hidden');
    journalGalleryOpenCategory = null;
  };
  window.setCoverPhoto = function(category, photoId) {
    journalPhotoCover[category] = photoId;
    renderGalleryGrid();
    renderPhotoSlot(category);
  };
  window.removePhoto = function(category, index) {
    var removed = journalPhotos[category][index];
    journalPhotos[category].splice(index, 1);
    if (removed && journalPhotoCover[category] === removed.id) { journalPhotoCover[category] = null; }
    renderGalleryGrid();
    renderPhotoSlot(category);
  };
  window.movePhoto = function(category, index, dir) {
    var arr = journalPhotos[category];
    var newIndex = index + dir;
    if (newIndex < 0 || newIndex >= arr.length) return;
    var tmp = arr[index]; arr[index] = arr[newIndex]; arr[newIndex] = tmp;
    renderGalleryGrid();
    renderPhotoSlot(category);
  };

  function resizeImageFile(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onerror = reject;
      reader.onload = function() {
        var img = new Image();
        img.onerror = reject;
        img.onload = function() {
          var maxDim = 1000;
          var scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          var w = Math.round(img.width * scale) || 1;
          var h = Math.round(img.height * scale) || 1;
          var canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  document.getElementById('journal-gallery-file-input').addEventListener('change', async function(e) {
    var files = Array.from(e.target.files || []);
    var category = journalGalleryOpenCategory;
    if (!category || !files.length) return;
    for (var i = 0; i < files.length; i++) {
      try {
        var src = await resizeImageFile(files[i]);
        journalPhotos[category].push({ id: 'p' + (journalPhotoIdCounter++), src: src });
      } catch (err) { /* skip a file that failed to load */ }
    }
    e.target.value = '';
    renderGalleryGrid();
    renderPhotoSlot(category);
  });


  document.getElementById('journal-photo-gallery-modal').addEventListener('click', function(e) {
    if (e.target === this) closePhotoGallery();
  });
  var editingStoryId = null;
  // ========== JOURNAL ==========
  var sparkPrompts = ["What moment made today unforgettable?","What surprised you the most today?","What made everyone laugh?","What is one thing you'll probably still be talking about next year?","What made this place feel special?","What discovery are you glad you made?","If you could relive one moment from today, which would it be?","What did you notice that nobody else seemed to?","What's the kindest thing someone did for your family today?","What sound or smell will remind you of today?","If today were a chapter in a book, what would the title be?","What would you tell your future self about today?","What was the most beautiful thing you saw?","Who did you meet that left an impression?","What food would you travel back just to eat again?","What's one thing that went differently than planned — but turned out better?","What creature (big or small) did you spot today?","What did the kids teach you today?","What tradition did your family start or continue today?","What's one photo you wish you had taken?"];
  document.getElementById('spark-btn').addEventListener('click', function() { document.getElementById('spark-prompt').textContent = sparkPrompts[Math.floor(Math.random() * sparkPrompts.length)]; });
  document.querySelectorAll('.js-star').forEach(function(s) { s.addEventListener('click', function() { jsRating = parseInt(s.dataset.val); document.querySelectorAll('.js-star').forEach(function(st, i) { st.style.color = i < jsRating ? '#f59e0b' : '#d1d5db'; }); }); });

  document.getElementById('js-add-person-btn').addEventListener('click', function() {
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'js-person-input w-full p-3 border rounded-xl';
    input.placeholder = 'Name (family, friend, relative, or someone you met)';
    document.getElementById('js-people-list').appendChild(input);
  });

  function setReturnChoice(val) {
    jsReturnValue = val;
    document.querySelectorAll('.js-return-btn').forEach(function(btn) {
      var active = btn.dataset.val === val;
      btn.classList.toggle('bg-emerald-600', active);
      btn.classList.toggle('text-white', active);
      btn.classList.toggle('border-emerald-600', active);
      btn.classList.toggle('bg-white', !active);
      btn.classList.toggle('text-gray-700', !active);
      btn.classList.toggle('border-gray-300', !active);
    });
    var showReason = (val === 'Definitely' || val === 'Maybe');
    document.getElementById('js-return-reason-wrap').classList.toggle('hidden', !showReason);
  }
  document.querySelectorAll('.js-return-btn').forEach(function(btn) { btn.addEventListener('click', function() { setReturnChoice(btn.dataset.val); }); });

  document.getElementById('btn-add-story').addEventListener('click', function() {
    editingStoryId = null; resetStoryForm();
    document.getElementById('js-date').value = new Date().toISOString().split('T')[0];
    if (tripSetup && tripSetup.trip_start_date) { var start = new Date(tripSetup.trip_start_date); var day = Math.max(1, Math.ceil((new Date() - start) / 86400000) + 1); document.getElementById('js-day').value = day; }
    document.getElementById('journal-home').classList.add('hidden');
    document.getElementById('journal-story-form').classList.remove('hidden');
    document.getElementById('journal-book-view').classList.add('hidden');
  });
  document.getElementById('btn-trip-book').addEventListener('click', function() { document.getElementById('journal-home').classList.add('hidden'); document.getElementById('journal-story-form').classList.add('hidden'); document.getElementById('journal-book-view').classList.remove('hidden'); renderBookSummary(); });
  document.getElementById('journal-back-btn').addEventListener('click', showJournalHome);
  document.getElementById('book-back-btn').addEventListener('click', showJournalHome);
  function showJournalHome() { document.getElementById('journal-home').classList.remove('hidden'); document.getElementById('journal-story-form').classList.add('hidden'); document.getElementById('journal-book-view').classList.add('hidden'); }
  function resetStoryForm() { ['js-date','js-day','js-location','js-lodging','js-memory','js-laugh','js-surprise','js-learned','js-remember','js-spark-answer'].forEach(function(id) { document.getElementById(id).value = ''; }); document.getElementById('js-state').value = ''; jsRating = 0; document.querySelectorAll('.js-star').forEach(function(s) { s.style.color = '#d1d5db'; }); document.getElementById('spark-prompt').textContent = 'Tap "Surprise Me" for a prompt'; document.getElementById('js-people-list').innerHTML = '<input type="text" class="js-person-input w-full p-3 border rounded-xl" placeholder="Name (family, friend, relative, or someone you met)">'; document.getElementById('js-return-reason').value = ''; setReturnChoice(''); journalPhotoCategories.forEach(function(c) { journalPhotos[c] = []; journalPhotoCover[c] = null; }); renderAllPhotoSlots(); }

  document.getElementById('js-save-btn').addEventListener('click', async function() {
    if (allData.length >= 999) { showStatus('js-status', 'Maximum 999 records reached.', false); return; }
    var jsPeople = Array.from(document.querySelectorAll('.js-person-input')).map(function(el) { return el.value.trim(); }).filter(Boolean).join('|');
    var record = { type: 'journal_story', date: document.getElementById('js-date').value || new Date().toISOString().split('T')[0], journal_trip_day: Number(document.getElementById('js-day').value) || 0, journal_state: document.getElementById('js-state').value, location: document.getElementById('js-location').value, journal_lodging: document.getElementById('js-lodging').value, journal_people: jsPeople, journal_favorite_memory: document.getElementById('js-memory').value, journal_biggest_laugh: document.getElementById('js-laugh').value, journal_surprise: document.getElementById('js-surprise').value, journal_learned: document.getElementById('js-learned').value, journal_remember: document.getElementById('js-remember').value, journal_memory_spark: document.getElementById('js-spark-answer').value, rating: jsRating, journal_would_return: jsReturnValue, journal_return_reason: document.getElementById('js-return-reason').value };
    journalPhotoCategories.forEach(function(c) { record['journal_photos_' + c] = JSON.stringify(journalPhotos[c] || []); record['journal_cover_' + c] = journalPhotoCover[c] || ''; });
    var btn = document.getElementById('js-save-btn'); btn.disabled = true; btn.style.opacity = '0.5';
    var result; if (editingStoryId) { var existing = allData.find(function(d) { return d.__backendId === editingStoryId; }); result = await window.dataSdk.update(Object.assign({}, existing, record)); } else { result = await window.dataSdk.create(record); }
    btn.disabled = false; btn.style.opacity = '1';
    if (result.isOk) showJournalHome();
    showStatus('js-status', result.isOk ? 'Story saved! ✨' : 'Error saving', result.isOk);
  });

  function getStoryCoverPhoto(s) {
    for (var i = 0; i < journalPhotoCategories.length; i++) {
      var c = journalPhotoCategories[i];
      var coverId = s['journal_cover_' + c];
      if (!coverId) continue;
      try {
        var photos = JSON.parse(s['journal_photos_' + c] || '[]');
        var match = photos.find(function(p) { return p.id === coverId; });
        if (match) return match.src;
      } catch (err) { /* ignore malformed photo data */ }
    }
    return null;
  }

  function renderJournalTimeline() {
    var stories = allData.filter(function(d) { return d.type === 'journal_story'; }).sort(function(a, b) { return (b.date || '').localeCompare(a.date || ''); });
    var container = document.getElementById('journal-timeline');
    var empty = document.getElementById('journal-empty');
    if (!stories.length) { container.innerHTML = ''; empty.classList.remove('hidden'); return; }
    empty.classList.add('hidden');
    container.innerHTML = stories.map(function(s) {
      var stars = '★'.repeat(s.rating || 0) + '☆'.repeat(5 - (s.rating || 0));
      var cover = getStoryCoverPhoto(s);
      var coverImg = cover ? '<img src="' + cover + '" alt="Cover photo" class="w-14 h-14 rounded-xl object-cover flex-shrink-0 mr-3">' : '';
      return '<div class="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"><div class="flex justify-between items-start mb-2"><div class="flex items-center">' + coverImg + '<div><p class="font-bold text-gray-900">' + (s.location || s.journal_state || 'On the road') + '</p><p class="text-xs text-gray-400">' + (s.date || '') + (s.journal_trip_day ? ' • Day ' + s.journal_trip_day : '') + '</p></div></div><span class="text-amber-400 text-sm">' + stars + '</span></div>' + (s.journal_favorite_memory ? '<p class="text-sm text-gray-700 mb-1"><span class="font-medium">💛</span> ' + s.journal_favorite_memory + '</p>' : '') + (s.journal_biggest_laugh ? '<p class="text-sm text-gray-700 mb-1"><span class="font-medium">😂</span> ' + s.journal_biggest_laugh + '</p>' : '') + '<div class="flex gap-2 mt-3"><button type="button" onclick="editStory(\'' + s.__backendId + '\')" class="text-xs px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-medium border border-emerald-200">Edit</button><button type="button" onclick="deleteStory(\'' + s.__backendId + '\')" class="text-xs px-3 py-1 bg-red-50 text-red-600 rounded-lg font-medium border border-red-200">Delete</button></div></div>';
    }).join('');
  }
  window.editStory = function(id) { var story = allData.find(function(d) { return d.__backendId === id; }); if (!story) return; editingStoryId = id; document.getElementById('js-date').value = story.date || ''; document.getElementById('js-day').value = story.journal_trip_day || ''; document.getElementById('js-state').value = story.journal_state || ''; document.getElementById('js-location').value = story.location || ''; document.getElementById('js-lodging').value = story.journal_lodging || ''; var peopleNames = (story.journal_people || '').split('|').map(function(n) { return n.trim(); }).filter(Boolean); var peopleList = document.getElementById('js-people-list'); peopleList.innerHTML = ''; (peopleNames.length ? peopleNames : ['']).forEach(function(name) { var input = document.createElement('input'); input.type = 'text'; input.className = 'js-person-input w-full p-3 border rounded-xl'; input.placeholder = 'Name (family, friend, relative, or someone you met)'; input.value = name; peopleList.appendChild(input); }); document.getElementById('js-memory').value = story.journal_favorite_memory || ''; document.getElementById('js-laugh').value = story.journal_biggest_laugh || ''; document.getElementById('js-surprise').value = story.journal_surprise || ''; document.getElementById('js-learned').value = story.journal_learned || ''; document.getElementById('js-remember').value = story.journal_remember || ''; document.getElementById('js-spark-answer').value = story.journal_memory_spark || ''; jsRating = story.rating || 0; document.querySelectorAll('.js-star').forEach(function(st, i) { st.style.color = i < jsRating ? '#f59e0b' : '#d1d5db'; }); setReturnChoice(story.journal_would_return || ''); document.getElementById('js-return-reason').value = story.journal_return_reason || ''; journalPhotoCategories.forEach(function(c) { var raw = story['journal_photos_' + c]; try { journalPhotos[c] = raw ? JSON.parse(raw) : []; } catch (err) { journalPhotos[c] = []; } journalPhotoCover[c] = story['journal_cover_' + c] || null; }); renderAllPhotoSlots(); document.getElementById('journal-home').classList.add('hidden'); document.getElementById('journal-story-form').classList.remove('hidden'); document.getElementById('journal-book-view').classList.add('hidden'); };
  window.deleteStory = async function(id) { var story = allData.find(function(d) { return d.__backendId === id; }); if (story) await window.dataSdk.delete(story); };

  function renderBookSummary() {
    var stories = allData.filter(function(d) { return d.type === 'journal_story'; });
    var stamps = allData.filter(function(d) { return d.type === 'passport_stamp'; });
    var lodgings = allData.filter(function(d) { return d.type === 'lodging'; });
    var statesVisited = [...new Set(stories.map(function(s) { return s.journal_state; }).filter(Boolean))];
    var html = '<ul class="space-y-2"><li>✅ <strong>Cover Page</strong> — ' + (tripSetup ? tripSetup.trip_name || 'Your Trip' : 'Your Trip') + '</li><li>✅ <strong>States Visited</strong> — ' + (statesVisited.length ? statesVisited.join(', ') : 'Add stories') + '</li><li>✅ <strong>Daily Stories</strong> — ' + stories.length + ' days</li><li>✅ <strong>Passport Stamps</strong> — ' + stamps.length + '</li><li>✅ <strong>Lodging Stops</strong> — ' + lodgings.length + '</li></ul><p class="text-sm text-gray-500 mt-4 italic">Keep adding stories each day. 📖</p>';
    var covers = stories.map(getStoryCoverPhoto).filter(Boolean).slice(0, 6);
    if (covers.length) {
      html += '<div class="mt-4"><p class="text-xs font-semibold text-gray-500 mb-2">Cover Photos</p><div class="grid grid-cols-3 gap-2">' + covers.map(function(src) { return '<img src="' + src + '" alt="Trip cover photo" class="w-full h-16 rounded-lg object-cover">'; }).join('') + '</div></div>';
    }
    document.getElementById('book-contents').innerHTML = html;
  }

  function loadFinalReflection() {
    var ref = allData.find(function(d) { return d.type === 'journal_final_reflection'; });
    if (!ref) return;
    var map = {'jr-place':'journal_final_place','jr-meal':'journal_final_meal','jr-park':'journal_final_park','jr-state-park':'journal_final_state_park','jr-capitol':'journal_final_capitol','jr-drive':'journal_final_drive','jr-wildlife':'journal_final_wildlife','jr-market':'journal_final_market','jr-gem':'journal_final_gem','jr-tip':'journal_final_tip','jr-next':'journal_final_next'};
    for (var id in map) { var el = document.getElementById(id); if (el && ref[map[id]]) el.value = ref[map[id]]; }
  }
  document.getElementById('jr-save-btn').addEventListener('click', async function() {
    var existing = allData.find(function(d) { return d.type === 'journal_final_reflection'; });
    var record = { type: 'journal_final_reflection', journal_final_place: document.getElementById('jr-place').value, journal_final_meal: document.getElementById('jr-meal').value, journal_final_park: document.getElementById('jr-park').value, journal_final_state_park: document.getElementById('jr-state-park').value, journal_final_capitol: document.getElementById('jr-capitol').value, journal_final_drive: document.getElementById('jr-drive').value, journal_final_wildlife: document.getElementById('jr-wildlife').value, journal_final_market: document.getElementById('jr-market').value, journal_final_gem: document.getElementById('jr-gem').value, journal_final_tip: document.getElementById('jr-tip').value, journal_final_next: document.getElementById('jr-next').value };
    var btn = document.getElementById('jr-save-btn'); btn.disabled = true; btn.style.opacity = '0.5';
    var result = existing ? await window.dataSdk.update(Object.assign({}, existing, record)) : await window.dataSdk.create(record);
    btn.disabled = false; btn.style.opacity = '1';
    showStatus('jr-status', result.isOk ? 'Reflection saved! 🌟' : 'Error', result.isOk);
  });
