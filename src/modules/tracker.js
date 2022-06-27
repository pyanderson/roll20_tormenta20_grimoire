'use strict'

T20.modules.tracker = {
  async onLoad ($body) {
    const init = $('#initiativewindow')
    const settings = $('#initiativewindow_settings')
    await checkTimeout(() => init.is(':visible'))
    init.dialog('option', 'minWidth', 220)
    const foot = init.closest('.ui-dialog').find('.ui-dialog-buttonpane')
    const clear = $(`<button class="btn btn-xs btn-danger">Clear`).click(() => settings.find('.clearlist').click())
    const sort = $(`<button class="btn btn-xs">Sort`).click(() => settings.find('.sortlist_numericdesc').click())
    foot.append(clear).append(sort)
  },
  onSheet: ($iframe, characterId) => {}
}