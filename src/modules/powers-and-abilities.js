'use strict'

T20.modules.push({
  name: 'powers-and-abilities',
  onLoad: $body => {},
  onSheet: ($iframe, characterId) => {
    const div = $iframe.find('.sheet-powers-and-abilities')
    const click = function () {
      const button = $(this)
      console.log(this, button)
      T20.utils.showSelectDialog(button, 'Poderes e Abilidades', T20.books.powers, selected => {
        T20.api.addAbility(characterId, selected)
      })
    }
    div.find('.repcontrol_add:eq(0)')
      .after($('<button rel="abilities" class="btn repcontrol_more">...</button>').click(click))
    div.find('.repcontrol_add:eq(1)')
      .after($('<button rel="powers" class="btn repcontrol_more">...</button>').click(click))
  }
})