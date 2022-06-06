'use strict'

const T20 = {
  d20: null,
  api: null,
  utils: null,
  books: [],
  modules: []
}

console.log('Bootstraping T20...')

function load_d20_api_as_developer () {
  if (!window.d20ext) {
    return setTimeout(load_d20_api_as_developer, 10)
  }
  window.d20ext.environment = 'development'
  console.log('T20 - D20 API ENV SET TO DEVELOPMENT')
  load_d20_to_t20()
}

function load_d20_to_t20 () {
  if (!window.d20) {
    return setTimeout(load_d20_to_t20, 10)
  }
  T20.d20 = window.d20
  console.log('T20 - D20 API FULLY INITIALIZED')
  bootstrap_t20()
}

function bootstrap_t20 () {

  $(document).ready(() => {

    T20.modules.forEach(({ onLoad }) => {
      setTimeout(() => onLoad($('body')), 500)
      console.log('T20 - MODULES READY!')
    })

    $(window).on('message', ({ originalEvent: { data } }) => {

      if (data.type === 't20-book-loaded') {
        T20.books[data.book] = data.json
      }

      if (data.type === 'loaded') {
        const characterId = data.characterId
        const iframe = $(`iframe[name="iframe_${characterId}"]`).contents()
        T20.modules.forEach(({ onSheet }) => onSheet(iframe, characterId))
        console.log('T20 - SHEET READY!')
      }
    })
  })
}

load_d20_api_as_developer()