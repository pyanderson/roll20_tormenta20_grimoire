'use strict'

T20.modules.meet = {
  getBaseLink () { return `https://meet.jit.si/${campaign_id}` },
  click () {
    if ($('.t20-meet-dialog').length) {
      return $('.t20-meet-dialog').each(function () {
        $(this).dialog('destroy')
      }).remove()
    }
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
        <div class="submenu"><ul>
          <li class="toggle"><i class="fa fa-toggle-on"></i> Ligar/desligar video e audio</li>
          <li class="copy-link"><i class="fa fa-link"></i> Copiar link </li>
        </ul></div>
      </li>
    `)
    $('#helpsite').after(entry)
    $('.dark-mode-switch').css('top', 380)

    entry.find('.fa-video, .toggle').click(() => this.click())
    entry.find('.copy-link').click(() => {
      navigator.clipboard.writeText(this.getBaseLink())
      entry.find('.copy-link').append('<i class="copied"><i class="fa fa-check"></i> Copiado!</i>')
      setTimeout(() => entry.find('.copy-link').find('.copied').remove(), 2000)
    })
  },
  onSheet: ($iframe, characterId) => {}
}