'use strict'

T20.modules.push({
  name: 'macros',
  onLoad: $body => {},
  onSheet: ($iframe, characterId) => {
    const click = function () {
      T20.api.deleteAllTokenActions(characterId)
      const actions = [
        { el: $iframe.find('[name=roll_iniciativa]'), name: 'PER: Iniciativa' },
        { el: $iframe.find('[name=roll_percepcao]'), name: 'PER: Percepção' },
        { el: $iframe.find('[name=roll_fortitude]'), name: 'PER: Fortitude' },
        { el: $iframe.find('[name=roll_reflexos]'), name: 'PER: Reflexos' },
        { el: $iframe.find('[name=roll_vontade]'), name: 'PER: Vontade' },
      ]
      $iframe.find('.repcontainer[data-groupname=repeating_attacks] [type=roll]').each(function () {
        const el = $(this)
        const name = 'ATK: ' + el.closest('.repitem').find('[name=attr_nomeataque]').val()
        actions.push({ el, name })
      })
      ;[1, 2, 3, 4, 5].forEach(circle => {
        $iframe.find(`.repcontainer[data-groupname=repeating_spells${circle}] [type=roll]`).each(function () {
          const el = $(this)
          const name = `MG${circle}: ${el.closest('.repitem').find('[name=attr_namespell]').val()}`
          actions.push({ el, name })
        })
      })
      actions.forEach(({ el, name }, i) => {
        const orderSpacing = ' '.repeat(actions.length - i)
        T20.api.addTokenAction(characterId, `${orderSpacing} ${name}`, el)
      })
    }
    $iframe.find('.addabil')
      .after($('<button class="btn" style="float:right;margin-right:8px;">Sincronizar</button>').click(click))
  }
})