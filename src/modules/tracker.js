'use strict'

T20.modules.tracker = {
  async onLoad ($body) {
    const init = $('#initiativewindow')
    const settings = $('#initiativewindow_settings')
    await checkTimeout(() => init.is(':visible'))
    init.dialog('option', 'minWidth', 270)
    init.closest('.ui-dialog').find('.ui-dialog-buttonpane')
      .append($(`<button class="btn btn-xs btn-danger clear">Clear`))
      .append($(`<button class="btn btn-xs counter">Counter`))
      .append($(`<button class="btn btn-xs sort">Sort`))

    $body.on('click', '.btn.sort', () => settings.find('.sortlist_numericdesc').click())
    $body.on('click', '.btn.clear', () => settings.find('.clearlist').click())
    $body.on('click', '.btn.counter', () => {
      settings.find('.customentry').val('** Rodada **')
      settings.find('.customformula').val('1')
      settings.find('.addcustom').click()
    })
  },
  onSheet: ($iframe, characterId) => {}
}