git checkout 799591c2e0a665b4f44b9a6fe0e329810c2824b0

// assets/js/app.js — builds the Nieuw timeline from data/nieuw/nieuw.json and wires audio/video playback (thumbnail toggles inline play/pause)
(function(){
  'use strict';

  // set footer year if present
  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

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

  // helper: normalize file path
  function normalizePath(file, kind){
    if(!file) return '';
    if(typeof file !== 'string') return '';
    if(file.indexOf('assets/')===0 || file.indexOf('http')===0) return file; // already a path or absolute URL
    if(kind === 'images') return 'assets/images/' + file;
    if(kind === 'audio') return 'assets/audio/' + file;
    if(kind === 'video') return 'assets/video/' + file;
    return file;
  }

  // helpers for extension detection
  function extOf(file){
    if(!file) return '';
    var parts = file.split('.');
    return parts.length>1 ? parts.pop().toLowerCase() : '';
  }
  function isVideoExt(ext){ return ['mp4','mov','webm','m4v'].indexOf(ext)!==-1; }
  function isAudioExt(ext){ return ['mp3','wav','ogg','m4a','aac'].indexOf(ext)!==-1; }

  var nieuwList = document.getElementById('nieuw-list');
  if(!nieuwList) return; // nothing to do on pages without nieuws

  var dataUrls = ['data/nieuw/nieuw.json','data/nieuw/sample.json'];
  function fetchData(i){
    if(i>=dataUrls.length) return Promise.reject();
    return fetch(dataUrls[i]).then(function(r){ if(!r.ok) throw new Error('no data'); return r.json(); }).catch(function(){ return fetchData(i+1); });
  }

  fetchData(0).then(function(items){ buildTimeline(items||[]); }).catch(function(){ console.warn('No nieuws data found at data/nieuw/*.json'); });

  function buildTimeline(items){
    if(!Array.isArray(items)) return;

    // sort newest -> oldest
    items.sort(function(a,b){
      var da = a.date ? new Date(a.date).getTime() : 0;
      var db = b.date ? new Date(b.date).getTime() : 0;
      return db - da; // newest first
    });

    var currentMedia = null;

    items.forEach(function(it){
      var el = document.createElement('article'); el.className='item card';

      var thumb = document.createElement('div'); thumb.className='thumb';
      var img = document.createElement('img'); img.alt = it.title || '';
      img.src = normalizePath(it.image || '', 'images');

      // accessible button for the thumbnail
      var btn = document.createElement('button'); btn.className='left-link';
      btn.setAttribute('aria-label', it.title || 'Open item');
      btn.style.border='none'; btn.style.background='transparent'; btn.style.padding=0; btn.style.cursor='pointer';
      btn.appendChild(img);

      var meta = document.createElement('div'); meta.className='meta';
      var h3 = document.createElement('h3'); h3.textContent = it.title || 'Untitled'; meta.appendChild(h3);
      var date = document.createElement('div'); date.className='date'; if(it.date) { date.textContent = it.date; meta.appendChild(date); }
      if(it.blurb){ var p = document.createElement('p'); p.textContent = it.blurb; meta.appendChild(p); }

      // determine file (support both 'file', 'audio' and 'video' keys)
      var file = it.file || it.audio || it.video || '';
      var filename = file.split('/').pop();
      var ext = extOf(filename);
      var media = null;

      if(isVideoExt(ext)){
        media = document.createElement('video');
        media.controls = true; media.preload = 'none'; media.setAttribute('playsinline', '');
        media.src = normalizePath(file, 'video');
        // poster from item image if available
        var posterSrc = normalizePath(it.image || '', 'images');
        if(posterSrc) media.poster = posterSrc;
        media.style.maxWidth = '480px'; media.style.width='100%'; media.style.height='auto';
      } else if(isAudioExt(ext)){
        media = document.createElement('audio');
        media.controls = true; media.preload = 'none';
        media.src = normalizePath(file, 'audio');
        media.style.maxWidth = '480px'; media.style.width='100%'; media.style.height='auto';
      }

      if(media){
        var mediaRow = document.createElement('div'); mediaRow.className='audio-row'; mediaRow.appendChild(media); meta.appendChild(mediaRow);

        // thumbnail toggles play/pause
        btn.addEventListener('click', function(e){
          e.preventDefault();
          try{
            if(!media.src){ console.warn('No media src for item', it); return; }
            if(media.paused){ if(currentMedia && currentMedia!==media){ try{ currentMedia.pause(); }catch(e){} } media.play(); }
            else { media.pause(); }
          }catch(err){ console.error('Media toggle error', err); }
        });

        // keyboard accessibility for thumbnail button
        btn.addEventListener('keydown', function(e){ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); btn.click(); } });

        media.addEventListener('play', function(){ if(currentMedia && currentMedia!==media){ try{ currentMedia.pause(); }catch(e){} } currentMedia = media; });
        media.addEventListener('ended', function(){ if(currentMedia===media) currentMedia = null; });

        // log fetch errors in console (useful for debugging broken files)
        media.addEventListener('error', function(ev){
          console.error('Media failed to load/play:', media.src, ev);
        });
      } else {
        // no media; clicking thumbnail opens the image in a new tab
        btn.addEventListener('click', function(){ if(img.src) window.open(img.src, '_blank'); });
      }

      thumb.appendChild(btn);
      el.appendChild(thumb);
      el.appendChild(meta);
      nieuwList.appendChild(el);
    });
  }
})();
  }
})();
