'use strict'

function load_d20_api_as_developer() {
  if (!window.d20ext) {
    return setTimeout(load_d20_api_as_developer, 10)
  }
  window.d20ext.environment = 'development'
  console.log('d20 api env set to development', window.d20)
}

load_d20_api_as_developer()