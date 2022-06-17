'use strict'

T20.modules.attacks = {
  onLoad: $body => {},
  onSheet: ($iframe, characterId) => {
    const click = function () {
      const button = $(this)
      const weapon = button.attr('rel') === 'weapon'
      const options = Object.assign({}, T20.books.equipments)
      const title = weapon ? 'Ataques e Armas' : 'Equipamentos'
      if (weapon) {
        Object.entries(options).forEach(([key, equip]) => {
          if (equip.type !== 'arma') delete options[key]
        })
      }
      T20.utils.showSelectDialog(title, options, selected => {
        T20.api.addEquipment(characterId, selected)
      })
    }
    $iframe.find('.sheet-attacks-container').find('.repcontrol_add')
      .after($('<button rel="weapon" class="btn repcontrol_more">...</button>').click(click))
    $iframe.find('.sheet-equipment-container').find('.repcontrol_add')
      .after($('<button rel="equipment" class="btn repcontrol_more">...</button>').click(click))
  }
}