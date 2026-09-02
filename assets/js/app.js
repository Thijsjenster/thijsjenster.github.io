// assets/js/app.js — builds the Nieuw timeline from a JSON file and wires audio playback
(function(){
  // utility: set footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // try to set hero image — prefer hyphenated filename but fall back to original with spaces
  var hero = document.getElementById('hero-photo');
  var candidates = [
    'assets/images/ThijsHeadshots-v1-4.jpg',
    'assets/images/ThijsHeadshots v1-4.jpg',
    'assets/images/ThijsHeadshots_v1-4.jpg'
  ];
  (function tryHero(i){
    if(i>=candidates.length) return;
    var url = candidates[i];
    // quick probe by creating an image
    var img = new Image();
    img.onload = function(){ hero.src = url };
    img.onerror = function(){ tryHero(i+1) };
    img.src = url;
  })(0);

  // load nieuw items from data/nieuw/nieuw.json (or sample)
  var nieuwList = document.getElementById('nieuw-list');
  var dataUrls = ['data/nieuw/nieuw.json','data/nieuw/sample.json'];

  function fetchData(idx){
    if(idx>=dataUrls.length) return;
    fetch(dataUrls[idx]).then(function(res){
      if(!res.ok) throw new Error('no data');
      return res.json();
    }).then(function(items){
      buildTimeline(items);
    }).catch(function(){ fetchData(idx+1) });
  }
  fetchData(0);

  function buildTimeline(items){
    if(!Array.isArray(items)) return;
    // ensure only one audio plays at a time
    var currentAudio = null;
    items.sort(function(a,b){return (b.date||'') - (a.date||'')});
    items.forEach(function(it){
      var el = document.createElement('article');
      el.className = 'item card';

      var thumb = document.createElement('div'); thumb.className='thumb';
      var img = document.createElement('img');
      img.alt = it.title || '';
      img.src = it.image || '';
      thumb.appendChild(img);

      var meta = document.createElement('div'); meta.className='meta';
      var h3 = document.createElement('h3'); h3.textContent = it.title || 'Untitled';
      var date = document.createElement('div'); date.className='date'; date.textContent = it.date || '';
      var p = document.createElement('p'); p.textContent = it.blurb || '';

      meta.appendChild(h3);
      if(date.textContent) meta.appendChild(date);
      if(p.textContent) meta.appendChild(p);

      if(it.audio){
        var audioRow = document.createElement('div'); audioRow.className='audio-row';
        var audio = document.createElement('audio'); audio.controls=true;
        audio.src = it.audio;
        audio.preload = 'none';
        audioRow.appendChild(audio);
        meta.appendChild(audioRow);

        audio.addEventListener('play', function(){
          if(currentAudio && currentAudio!==audio){ currentAudio.pause(); }
          currentAudio = audio;
        });
      }

      el.appendChild(thumb);
      el.appendChild(meta);
      nieuwList.appendChild(el);
    });
  }
})();
