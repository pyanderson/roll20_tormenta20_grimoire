'use strict'

const T20 = {
  d20: null,
  api: null,
  utils: null,
  books: [],
  modules: {}
}

console.log('T20 - Bootstraping T20...')

setInterceptor('d20ext', val => {
  console.log('T20 - D20 API ENV SET TO DEVELOPMENT')
  return { ...val, environment: 'development' }
})

setInterceptor('d20', val => {
  console.log('T20 - D20 API FULLY INITIALIZED')
  val.environment = 'production'
  return T20.d20 = val
})

bootstrap_t20()

//
// implementations below...
//

function setInterceptor (prop, callback) {
  Object.defineProperty(window, prop, {
    enumerable: true,
    configurable: true,
    set: newValue => {
      delete window[prop]
      const intercept = callback && callback(newValue)
      window[prop] = intercept || newValue
    }
  })
}

function bootstrap_t20 () {

  if (!window.$ || !T20.d20) {
    return setTimeout(bootstrap_t20, 10)
  }

  window.$(window).on('message', ({ originalEvent: { data } }) => {

    if (data.type === 't20-scripts-loaded') {
      setTimeout(() => Object.entries(T20.modules).forEach(([key, { onLoad }]) => {
        onLoad(window.$('body'))
        console.log(`T20 - ${key} loaded...`)
      }), 1000)
    }

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
}