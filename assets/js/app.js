// assets/js/app.js — builds the Nieuw timeline from data/nieuw/nieuw.json and wires audio/video playback (thumbnail toggles inline play/pause)
(function(){
  // set footer year if present
  var yearEl = document.getElementById('year'); if(yearEl) yearEl.textContent = new Date().getFullYear();

  // set hero image (if present)
  var hero = document.getElementById('hero-photo');
  if(hero){
    var candidates = [
      'assets/images/ThijsHeadshots-v1-4.jpg',
      'assets/images/ThijsHeadshots v1-4.jpg',
      'assets/images/ThijsHeadshots_v1-4.jpg'
    ];
    (function tryHero(i){ if(i>=candidates.length) return; var url=candidates[i]; var img=new Image(); img.onload=function(){ hero.src=url }; img.onerror=function(){ tryHero(i+1) }; img.src=url; })(0);
  }

  // generic helper to resolve an asset path (if the JSON gives a filename only)
  function normalizePath(file, kind){
    if(!file) return '';
    if(file.indexOf('assets/')===0) return file; // already a path
    if(file.indexOf('http')===0) return file; // external URL
    // kind: 'audio' | 'images' | 'video'
    if(kind==='images') return 'assets/images/' + file;
    if(kind==='audio') return 'assets/audio/' + file;
    if(kind==='video') return 'assets/video/' + file;
    return file;
  }

  var nieuwList = document.getElementById('nieuw-list');
  if(!nieuwList) return; // nothing to do on pages without nieuws

  var dataUrls = ['data/nieuw/nieuw.json','data/nieuw/sample.json'];
  function fetchData(i){ if(i>=dataUrls.length) return Promise.reject(); return fetch(dataUrls[i]).then(function(r){ if(!r.ok) throw new Error('no data'); return r.json(); }).catch(function(){ return fetchData(i+1); }); }

  fetchData(0).then(function(items){ buildTimeline(items||[]); }).catch(function(){ /* no data */ });

  function isVideoExt(ext){ return ['mp4','mov','webm','m4v'].indexOf(ext)!==-1; }
  function isAudioExt(ext){ return ['mp3','wav','ogg','m4a','aac'].indexOf(ext)!==-1; }

  function buildTimeline(items){
    if(!Array.isArray(items)) return;

    // sort: oldest first (chronological). If you prefer newest-first, invert this comparator.
    items.sort(function(a,b){
      var da = a.date ? new Date(a.date).getTime() : 0;
      var db = b.date ? new Date(b.date).getTime() : 0;
      return da - db; // oldest -> newest
    });

    var currentMedia = null;

    items.forEach(function(it){
      var el = document.createElement('article'); el.className='item card';

      var thumb = document.createElement('div'); thumb.className='thumb';
      var img = document.createElement('img'); img.alt = it.title || '';
      img.src = normalizePath(it.image || '', 'images');

      // accessible button for the thumbnail
      var btn = document.createElement('button'); btn.className='left-link'; btn.setAttribute('aria-label', it.title || 'Play item');
      btn.style.border='none'; btn.style.background='transparent'; btn.style.padding=0; btn.style.cursor='pointer';

      btn.appendChild(img);

      // meta
      var meta = document.createElement('div'); meta.className='meta';
      var h3 = document.createElement('h3'); h3.textContent = it.title || 'Untitled'; meta.appendChild(h3);

      // create media element (audio or video) if present
      var file = it.file || it.audio || it.video || '';
      var filename = file.split('/').pop();
      var ext = (filename.split('.').pop() || '').toLowerCase();
      var media = null;

      if(isVideoExt(ext)){
        media = document.createElement('video');
        media.controls = true; media.preload='none'; media.width = 480; media.style.maxWidth='100%';
        media.src = normalizePath(file, 'video');
      } else if(isAudioExt(ext)){
        media = document.createElement('audio');
        media.controls = true; media.preload='none';
        media.src = normalizePath(file, 'audio');
      }

      if(media){
        var audioRow = document.createElement('div'); audioRow.className='audio-row'; audioRow.appendChild(media); meta.appendChild(audioRow);

        // clicking the thumbnail toggles play/pause for this media inline
        btn.addEventListener('click', function(e){ e.preventDefault(); if(!media.src) return; if(media.paused){ if(currentMedia && currentMedia!==media){ try{ currentMedia.pause(); }catch(e){} } media.play(); } else { media.pause(); } });

        // when a media starts playing, pause the previous one
        media.addEventListener('play', function(){ if(currentMedia && currentMedia!==media){ try{ currentMedia.pause(); }catch(e){} } currentMedia = media; });
      } else {
        // if no media, clicking the thumbnail could open the image in a new tab
        btn.addEventListener('click', function(){ window.open(img.src || '#', '_blank'); });
      }

      thumb.appendChild(btn);
      el.appendChild(thumb);
      el.appendChild(meta);
      nieuwList.appendChild(el);
    });
  }
})();
