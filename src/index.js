'use strict'

function load_script(path) {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL(path);
  s.type='text/javascript'
  s.onload = function() {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}

$(document).ready(function () {
  $(window).on('message', function (e) {
    const data = e.originalEvent.data;
    if (data.type === 'loaded') {  // render the speels only wheen a character sheet is opened
      const iframe = $(`iframe[name="iframe_${data.characterId}"]`);
      const character_sheet = new CharacterSheet(iframe.contents(), data.characterId);
      character_sheet.render();
    }
  });

  // load tormenta20 book rules
  load_script('tormenta20_book.js');

  fetch(chrome.runtime.getURL('data/rules.json'))
    .then((response) => response.json())
    .then((rules) => {
      const book = {'rules': rules, 'icon': chrome.runtime.getURL('images/32.png')}
      window.postMessage(
        {
          type: "FROM_CONTENT",
          text: JSON.stringify(book)
        },
        "*"
      )
    });
})