'use strict'

T20.modules.macros = {
  onLoad: $body => {},
  onSheet: ($iframe, characterId) => {
    const click = function () {
      T20.api.deleteAllTokenActions(characterId)
      const isThreatSheet = T20.api.getAttrib(characterId, 'playername') === '---'
      const threatAttackMacro = `
        &{template:t20-attack}
        {{character=@{character_name}}}
        {{attackname=@{nomeataque}}}
        {{attackroll=[[1d20cs>?{Crit + Bonus|20 + 0}]]}}
        {{damageroll=[[?{Dano|1d8 + 0}}]]}}
        {{criticaldamageroll=[[0]]}}
      `.split(/\r?\n/).map(line => line.trim()).join('')
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
        const macro = isThreatSheet ? threatAttackMacro : ''
        actions.push({ el, name, macro })
      })
      ;[1, 2, 3, 4, 5].forEach(circle => {
        $iframe.find(`.repcontainer[data-groupname=repeating_spells${circle}] [type=roll]`).each(function () {
          const el = $(this)
          const name = `MG${circle}: ${el.closest('.repitem').find('[name=attr_namespell]').val()}`
          actions.push({ el, name })
        })
      })
      actions.forEach(({ el, name, macro }, i) => {
        const orderSpacing = ' '.repeat(actions.length - i)
        T20.api.addTokenAction(characterId, `${orderSpacing} ${name}`, el, macro)
      })
    }
    $iframe.find('.addabil')
      .after($('<button class="btn" style="float:right;margin-right:8px;">Sincronizar</button>').click(click))
  }
}