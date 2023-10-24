import { loadSheetEnhancement } from './character-sheet';

function loadScript (path) {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL(path);
  s.type = 'text/javascript';
  s.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}

$(document).ready(function () {
  $(window).on('message', function (e) {
    const data = e.originalEvent.data;
    if (data.type === 'loaded') { // only add the improvements when a character sheet is opened
      loadSheetEnhancement(data.characterId);
    }
  });

  // load tormenta20 book rules
  loadScript('sidebar-menu.js');

  fetch(chrome.runtime.getURL('data/rules.json'))
    .then((response) => response.json())
    .then((rules) => {
      const book = { rules, icon: chrome.runtime.getURL('images/32.png') };
      window.postMessage(
        {
          type: 'FROM_CONTENT',
          text: JSON.stringify(book)
        },
        '*'
      );
    });
});
