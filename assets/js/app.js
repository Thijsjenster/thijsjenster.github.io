// assets/js/app.js — builds the Nieuw timeline (compact thumbnails + hidden media, click to play/pause, clipboard layout)
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

  function normalizePath(file, kind){
    if(!file) return '';
    if(typeof file !== 'string') return '';
    if(file.indexOf('assets/')===0 || file.indexOf('http')===0) return file;
    if(kind === 'images') return 'assets/images/' + file;
    if(kind === 'audio') return 'assets/audio/' + file;
    if(kind === 'video') return 'assets/video/' + file;
    return file;
  }

  function extOf(file){
    if(!file) return '';
    var parts = (file||'').split('.');
    return parts.length>1 ? parts.pop().toLowerCase() : '';
  }
  function isVideoExt(ext){ return ['mp4','mov','webm','m4v'].indexOf(ext)!==-1; }
  function isAudioExt(ext){ return ['mp3','wav','ogg','m4a','aac'].indexOf(ext)!==-1; }

  var nieuwList = document.getElementById('nieuw-list');
  if(!nieuwList) return;

  var dataUrls = ['data/nieuw/nieuw.json','data/nieuw/sample.json'];
  function fetchData(i){
    if(i>=dataUrls.length) return Promise.reject();
    return fetch(dataUrls[i]).then(function(r){ if(!r.ok) throw new Error('no data'); return r.json(); }).catch(function(){ return fetchData(i+1); });
  }

  fetchData(0).then(function(items){ buildTimeline(items||[]); }).catch(function(){ console.warn('No nieuws data found at data/nieuw/*.json'); });

  // small helper to create SVG play/pause symbol
  function playIconSVG(){
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('width','40'); svg.setAttribute('height','40');
    svg.innerHTML = '<path fill=\"currentColor\" d=\"M8 5v14l11-7z\"></path>';
    return svg;
  }
  function pauseIconSVG(){
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('width','40'); svg.setAttribute('height','40');
    svg.innerHTML = '<path fill=\"currentColor\" d=\"M6 19h4V5H6zm8-14v14h4V5z\"/>';
    return svg;
  }

  function buildTimeline(items){
    if(!Array.isArray(items)) return;

    // sort newest -> oldest
    items.sort(function(a,b){
      var da = a.date ? new Date(a.date).getTime() : 0;
      var db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    });

    // clear old content & apply grid container class
    nieuwList.innerHTML = '';
    nieuwList.classList.add('nieuw-clipboard');

    var currentMedia = null;
    var zBase = 10;

    items.forEach(function(it, idx){
      // card wrapper
      var card = document.createElement('article');
      card.className = 'nieuw-card';
      // random small rotation and offset for "scattered" look
      var angle = (Math.random()*8) - 4; // -4deg..+4deg
      var xOffset = (Math.random()*10) - 5; // -5..+5 px
      var yOffset = (Math.random()*8) - 4;
      card.style.transform = 'translate('+xOffset+'px,'+yOffset+'px) rotate('+angle+'deg)';
      card.style.zIndex = zBase + (items.length - idx); // earlier items sit below later ones

      // thumbnail area
      var thumbWrap = document.createElement('div');
      thumbWrap.className = 'nieuw-thumb';
      var imgSrc = normalizePath(it.image || '', 'images');
      var hasImg = !!(it.image && imgSrc);
      if(hasImg){
        var img = document.createElement('img');
        img.alt = it.title || '';
        img.src = imgSrc;
        thumbWrap.appendChild(img);
      } else {
        // fallback: show a circular play button if no img
        var btnOnly = document.createElement('div');
        btnOnly.className = 'nieuw-no-thumb';
        btnOnly.appendChild(playIconSVG());
        thumbWrap.appendChild(btnOnly);
      }

      // overlay play icon (always present)
      var overlay = document.createElement('div');
      overlay.className = 'nieuw-overlay';
      overlay.appendChild(playIconSVG());
      thumbWrap.appendChild(overlay);

      // hidden media element (no controls, not visible by default)
      var file = it.file || it.audio || it.video || '';
      var filename = file.split('/').pop();
      var ext = extOf(filename);
      var media = null;
      if(isVideoExt(ext)){
        media = document.createElement('video');
        media.preload = 'metadata';
        media.src = normalizePath(file, 'video');
      } else if(isAudioExt(ext)){
        media = document.createElement('audio');
        media.preload = 'metadata';
        media.src = normalizePath(file, 'audio');
      }
      if(media){
        media.style.display = 'none'; // keep hidden; we control playback via click
        media.setAttribute('aria-hidden','true');
        card.appendChild(media);
      }

      // title & date underneath
      var info = document.createElement('div');
      info.className = 'nieuw-info';
      var h3 = document.createElement('h3'); h3.textContent = it.title || 'Untitled';
      var date = document.createElement('div'); date.className='nieuw-date'; if(it.date) date.textContent = it.date;
      info.appendChild(h3); info.appendChild(date);

      // wire click: toggle play/pause
      thumbWrap.addEventListener('click', function(e){
        e.preventDefault();
        if(!media){
          // if no media, flash overlay briefly (or open image)
          overlay.classList.add('flash');
          setTimeout(()=>overlay.classList.remove('flash'), 300);
          return;
        }
        try{
          if(media.paused){
            if(currentMedia && currentMedia !== media) try { currentMedia.pause(); } catch(e){}
            media.play();
          } else {
            media.pause();
          }
        }catch(err){ console.error('Media toggle error', err); }
      });

      // update overlay icon when media plays/pauses
      if(media){
        media.addEventListener('play', function(){
          currentMedia = media;
          card.classList.add('playing');
          overlay.innerHTML = '';
          overlay.appendChild(pauseIconSVG());
        });
        media.addEventListener('pause', function(){
          if(currentMedia===media) currentMedia = null;
          card.classList.remove('playing');
          overlay.innerHTML = '';
          overlay.appendChild(playIconSVG());
        });
        media.addEventListener('ended', function(){ media.pause(); });
        media.addEventListener('error', function(ev){ console.error('Media failed to load/play:', media.src, ev); });
      } else {
        // no media: clicking the thumbnail opens the image in a new tab (if image exists)
        if(hasImg){
          thumbWrap.addEventListener('click', function(){ window.open(imgSrc, '_blank'); });
        }
      }

      card.appendChild(thumbWrap);
      card.appendChild(info);
      nieuwList.appendChild(card);
    });
  }
})();
