'use strict'

T20.modules.tokens = {
  onLoad: $body => {
    const findAttribute = (models, attributeName, value = 'current') => {
      const find = models.find(attr => attr.attributes.name === attributeName)
      return find ? find.attributes[value] : null
    }
    const syncTokenBars = async () => {
      const token = T20.d20.token_editor.currentRadialTarget.model
      const attribs = token.character.attribs
      attribs.fetch()
      await checkTimeout(() => attribs.models.length)

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
    }

    const updateToken = () => {
      const url = window.prompt('URL:')
      if (!url) return
      const token = T20.d20.token_editor.currentRadialTarget.model
      const char = token.character
      token.save({ imgsrc: url })

      const toDelete = ['id', 'z_index', 'type', 'top', 'left', 'statusmarkers', 'statusdead', 'sides',
        'pageid', 'page_id', 'locked', 'layer', 'lastmove', 'isdrawing', 'groupwidth', 'gmnotes',
        'currentSide', 'cardid', 'adv_fow_view_distance', 'anim_autoplay', 'anim_loop', 'anim_paused_at']

      const rawToken = JSON.parse(JSON.stringify(token))
      toDelete.forEach(key => delete rawToken[key])

      char.save({ avatar: url, defaulttoken: new Date().getTime() })
      char.updateBlobs({ defaulttoken: JSON.stringify(rawToken) })
    }

    const button1 = $(`<div class="button button-6 open action" data-action-type="">
        <div class="inner"><span class="pictos">b</span></div></div>`).click(syncTokenBars)

    const button2 = $(`<div class="button button-6 open action" style="top: 146px;left: 52px;" data-action-type="">
        <div class="inner"><span class="pictos">c</span></div></div>`).click(updateToken)

    const loop = () => {
      if (!$('#radial-menu .button-6').length) {
        $('#radial-menu').append(button1.clone(1, 1))
        $('#radial-menu').append(button2.clone(1, 1))
      }
      setTimeout(loop, 20)
    }
    loop()
  },
  onSheet: ($iframe, characterId) => {}
}