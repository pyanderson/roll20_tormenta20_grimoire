'use strict'

T20.modules.handouts = {
  onLoad ($body) {

    if (!T20.api.isGM()) return

    const btnSetUrl = $(`<button class="btn btn-xs set-url" style="margin: 2px auto;display: block;">Definir por URL`)
      .click(function () {
        const url = prompt('URL:')
        if (!url) return
        const handoutId = $(this).closest('[data-handoutid]').data('handoutid')
        const handout = T20.api.getHandout(handoutId)
        handout.save({ avatar: url })
        if ($(this).closest('.ui-dialog').find('.ui-dialog-buttonset button:first').length) {
          $(this).closest('.ui-dialog').find('.ui-dialog-buttonset button:first').click()
        }
        $(this).closest('.ui-dialog').find('.ui-dialog-titlebar-close').click()
        setTimeout(() => handout.view.showDialog(), 200)
      })

    const btnCreateToken = $('<li class="create-token">Criar token por URL</li>')
      .click(() => {
        const mousePos = T20.utils.getCanvasMousePos()
        const pageId = T20.utils.getCurrentPage().id
        const layer = T20.utils.getCurrentLayer()
        const url = window.prompt('URL:')
        if (!url) return

        const img = new Image()
        img.onload = () => {
          const width = Math.min(img.width, 280)
          const height = img.height * (width / img.width)
          T20.utils.getCurrentPage().thegraphics.create({
            left: mousePos[0], top: mousePos[1], width, height, z_index: 0,
            imgsrc: url, rotation: 0, type: 'image', page_id: pageId, layer, id: T20.api.getUuid()
          })
          T20.utils.closeContextMenu()
        }
        img.onerror = err => {
          alert('Erro ao carregar imagem')
          console.error(err)
          T20.utils.closeContextMenu()
        }
        img.src = url
      })

    const loop = () => {
      $('[data-handoutid]').each((i, el) => {
        if ($(el).find('.set-url').length) return
        $(el).find('.avatar').append(btnSetUrl.clone(1, 1))
      })
      if (!$('.d20contextmenu .create-token').length) {
        $('.d20contextmenu [data-action-type="undo"]').after(btnCreateToken.clone(1, 1))
      }
      setTimeout(loop, 100)
    }
    loop()
  },
  onSheet: ($iframe, characterId) => {}
}