'use strict'

function load_script (path) {
  let s
  if (path.endsWith('.css')) {
    s = document.createElement('link')
    s.href = chrome.runtime.getURL(path)
    s.rel = 'stylesheet'
    s.type = 'text/css'
  } else {
    s = document.createElement('script')
    s.src = chrome.runtime.getURL(path)
    s.type = 'text/javascript'
  }
  (document.head || document.documentElement).appendChild(s)
}

function load_book (path) {
  fetch(chrome.runtime.getURL(path))
    .then(response => response.json())
    .then(json => {
      const book = path.split('/').pop().split('.')[0]
      window.postMessage({ type: 't20-book-loaded', book, json }, '*')
    })
}

load_script('bootstrap.js')

$(document).ready(function () {

  load_script('modules/_api.js')
  load_script('modules/_utils.js')
  load_script('modules/attacks-and-equipments.js')
  load_script('modules/handouts.js')
  load_script('modules/macros.js')
  load_script('modules/meet.js')
  load_script('modules/powers-and-abilities.js')
  load_script('modules/spells.js')
  load_script('modules/threats.js')
  load_script('modules/tokens.js')
  load_script('modules/tracker.js')

  load_script('sheet.css')

  load_book('data/equipments.json')
  load_book('data/powers.json')
  load_book('data/rules.json')
  load_book('data/spells.json')

  setTimeout(() => window.postMessage({ type: 't20-scripts-loaded' }, '*'), 100)

  // load tormenta20 book rules
  load_script('tormenta20_book.js')

  fetch(chrome.runtime.getURL('data/rules.json'))
    .then((response) => response.json())
    .then((rules) => {
      const book = { 'rules': rules, 'icon': chrome.runtime.getURL('images/32.png') }
      window.postMessage({ type: 'FROM_CONTENT', text: JSON.stringify(book) }, '*')
    })

  $(window).on('message', ({ originalEvent: { data } }) => {
    if (data.type === 'loaded') {
      const iframe = $(`iframe[name="iframe_${data.characterId}"]`).contents()
      iframe.find('head').append($(`<link href="${chrome.runtime.getURL('sheet.css')}" rel="stylesheet">`))
    }
  })
})