'use strict'

T20.modules.tokens = {
  onLoad: $body => {
    const findAttribute = (models, attributeName, value = 'current') => {
      const find = models.find(attr => attr.attributes.name === attributeName)
      return find ? find.attributes[value] : null
    }
    const click = () => {
      const token = T20.d20.token_editor.currentRadialTarget.model
      const attribs = token.character.attribs
      attribs.fetch()
      setTimeout(() => {
        const vida = findAttribute(attribs.models, 'vida')
        const vidaTotal = findAttribute(attribs.models, 'vidatotal')
        const vidaId = findAttribute(attribs.models, 'vida', 'id')
        const mana = findAttribute(attribs.models, 'mana')
        const manaTotal = findAttribute(attribs.models, 'manatotal')
        const manaId = findAttribute(attribs.models, 'mana', 'id')
        const defesa = findAttribute(attribs.models, 'defesatotal')
        const defesaId = findAttribute(attribs.models, 'defesatotal', 'id')
        const isThreatSheet = findAttribute(attribs.models, 'playername') === '---' || null
        const haveMana = parseInt(manaTotal) || null
        const bars = {
          showname: true,
          bar1_value: vida,
          bar1_max: vidaTotal,
          bar3_value: defesa,
        }
        if (haveMana) Object.assign(bars, {
          bar2_value: mana,
          bar2_max: manaTotal,
        })
        if (!isThreatSheet) Object.assign(bars, {
          bar1_link: vidaId,
          bar2_link: manaId,
          bar3_link: defesaId,
        })
        token.save(bars)
      }, 500)
    }
    const button = $(`<div class="button button-6 open action" data-action-type="">
        <div class="inner"><span class="pictos">b</span></div></div>`).click(click)

    const loop = () => {
      if (!$('#radial-menu .button-6').length) {
        $('#radial-menu').append(button.clone(1, 1))
      }
      setTimeout(loop, 20)
    }
    loop()
  },
  onSheet: ($iframe, characterId) => {}
}