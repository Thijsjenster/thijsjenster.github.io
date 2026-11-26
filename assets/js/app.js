// Renders the dump list with play/pause controls.
(function(){
  'use strict';

  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  var nieuwList = document.getElementById('nieuw-list');
  if(!nieuwList) return;

  var dataUrls = ['data/nieuw/nieuw.json', 'data/nieuw/sample.json'];

  function fetchData(i){
    if(i >= dataUrls.length) return Promise.reject();
    return fetch(dataUrls[i]).then(function(response){
      if(!response.ok) throw new Error('No dump data');
      return response.json();
    }).catch(function(){
      return fetchData(i + 1);
    });
  }

  function normalizePath(file, kind){
    if(!file || typeof file !== 'string') return '';
    if(file.indexOf('assets/') === 0 || file.indexOf('http') === 0) return file;
    return 'assets/' + kind + '/' + file;
  }

  function extOf(file){
    var parts = (file || '').split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  function buildTimeline(items){
    if(!Array.isArray(items)) return;

    items.sort(function(a, b){
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });

    nieuwList.innerHTML = '';
    var currentMedia = null;

    items.forEach(function(item){
      var row = document.createElement('article');
      row.className = 'dump-item';

      var file = item.file || item.audio || item.video || '';
      var ext = extOf(file.split('/').pop());
      var media = null;

      if(['mp4', 'mov', 'webm', 'm4v'].indexOf(ext) !== -1){
        media = document.createElement('video');
        media.src = normalizePath(file, 'video');
      } else if(['mp3', 'wav', 'ogg', 'm4a', 'aac'].indexOf(ext) !== -1){
        media = document.createElement('audio');
        media.src = normalizePath(file, 'audio');
      }

      var titleText = item.title || 'Untitled';
      var button = document.createElement('button');
      button.className = 'dump-play';
      button.type = 'button';
      button.textContent = '▶';
      button.disabled = !media;
      button.setAttribute('aria-label', 'Play ' + titleText);

      var info = document.createElement('div');
      info.className = 'dump-info';

      var title = document.createElement('div');
      title.className = 'dump-title';
      title.textContent = titleText;
      info.appendChild(title);

      if(item.date){
        var date = document.createElement('div');
        date.className = 'nieuw-date';
        date.textContent = item.date;
        info.appendChild(date);
      }

      if(media){
        media.preload = 'metadata';
        media.hidden = true;
        media.setAttribute('aria-hidden', 'true');
        row.appendChild(media);

        button.addEventListener('click', function(){
          if(media.paused){
            if(currentMedia && currentMedia !== media) currentMedia.pause();
            media.play().catch(function(error){
              console.error('Could not play dump media:', media.src, error);
            });
          } else {
            media.pause();
          }
        });

        media.addEventListener('play', function(){
          currentMedia = media;
          button.textContent = '❚❚';
          button.setAttribute('aria-label', 'Pause ' + titleText);
        });

        media.addEventListener('pause', function(){
          if(currentMedia === media) currentMedia = null;
          button.textContent = '▶';
          button.setAttribute('aria-label', 'Play ' + titleText);
        });

        media.addEventListener('ended', function(){
          media.pause();
        });

        media.addEventListener('error', function(event){
          console.error('Dump media failed to load:', media.src, event);
        });
      }

      row.appendChild(button);
      row.appendChild(info);
      nieuwList.appendChild(row);
    });
  }

  fetchData(0).then(function(items){
    buildTimeline(items || []);
  }).catch(function(error){
    console.error('Could not load dump data:', error);
  });
})();
