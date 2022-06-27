'use strict'

T20.modules.meet = {
  getBaseLink () { return `https://meet.jit.si/${campaign_id}` },
  click () {
    $('.t20-meet-dialog').each(function () {
      $(this).dialog('destroy')
    }).remove()
    const player = $('#player_displayname').val()
    const meetLink = this.getBaseLink() + `#config.prejoinPageEnabled=false&userInfo.displayName="${player}"`
    const iframe = $(`<iframe frameBorder="0" src='${meetLink}' allow="camera *;microphone *" style="height: 300px; width: 100%;">`)
    const dialog = T20.utils.showDialog('', iframe, null, {
      width: 300, buttons: null, padding: '0', class: 't20-meet-dialog'
    })
    iframe.contents()
    dialog.css({ top: '', bottom: 0, left: 0, zIndex: 100000 })
  },
  async onLoad ($body) {
    await checkTimeout(() => $('#player_displayname').val() && $('#helpsite').length)
    const entry = $(`
      <li id="helpsite" style="font-size: 14px">
        <i class="fa fa-video"></i>
        <div class="submenu"><ul><li class="copy-link"><i class="fa fa-link"></i> Copy link </li></ul></div>
      </li>
    `).click(() => this.click())
    $('#helpsite').after(entry)
    entry.find('.copy-link').click(() => {
      navigator.clipboard.writeText(this.getBaseLink())
      entry.find('.copy-link').append('<i class="copied"><i class="fa fa-check"></i> Copiado!</i>')
      setTimeout(() => entry.find('.copy-link').find('.copied').remove(), 2000)
    })
  },
  onSheet: ($iframe, characterId) => {}
}