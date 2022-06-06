'use strict'

function load_script (path) {
  const s = document.createElement('script')
  s.src = chrome.runtime.getURL(path)
  s.type = 'text/javascript';
  (document.head || document.documentElement).appendChild(s)
}

function load_book (path) {
  fetch(chrome.runtime.getURL(path))
    .then(response => response.json())
    .then(json => {
      const book = path.split('/').pop().split('.')[0]
      window.postMessage({ type: 't20-book-loaded', book , json }, '*')
    })
}

load_script('bootstrap.js')

$(document).ready(function () {

  load_script('modules/_api.js')
  load_script('modules/_utils.js')
  load_script('modules/powers-and-abilities.js')

  load_book('data/powers.json')
  load_book('data/spells.json')

  $(window).on('message', function (e) {

    const data = e.originalEvent.data
    if (data.type === 'loaded') {  // render the speels only wheen a character sheet is opened
      const iframe = $(`iframe[name="iframe_${data.characterId}"]`)
      const character_sheet = new CharacterSheet(iframe.contents(), data.characterId)
      character_sheet.render()
    }
  })

  // load tormenta20 book rules
  load_script('tormenta20_book.js')

  fetch(chrome.runtime.getURL('data/rules.json'))
    .then((response) => response.json())
    .then((rules) => {
      const book = { 'rules': rules, 'icon': chrome.runtime.getURL('images/32.png') }
      window.postMessage(
        {
          type: 'FROM_CONTENT',
          text: JSON.stringify(book)
        },
        '*'
      )
    })
})