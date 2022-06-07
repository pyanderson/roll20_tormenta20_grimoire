'use strict'

T20.utils = {
  showSelectDialog (button, title, options, callback) {
    const dialog = $(`
      <div name="spell-dialog" title="${title}">
        <form>
          <fieldset>
            <input type="text" name="dialog-input" value="" placeholder="Digite para buscar...">
            <input type="submit" tabindex="-1" style="position:absolute; top:-1000px">
          </fieldset>
        </form>
      </div>`)
    const form = dialog.find('form')
    const input = form.find('input[name="dialog-input"]')
    dialog.dialog({
      autoOpen: true,
      buttons: {
        Confirmar: () => form.submit(),
        Cancelar: () => dialog.dialog('close')
      },
      close: () => dialog.remove()
    })
    form.on('submit', e => {
      e.preventDefault()
      if (options[input.val()]) {
        callback && callback(options[input.val()])
        dialog.dialog('close')
      }
    })
    input.on('keydown', e => {
      if (e.keyCode === 13) setTimeout(() => { form.submit() }, 200)
    })
    setTimeout(() => {
      input.autocomplete({ source: Object.keys(options) })
      input.focus()
    }, 200)
  }
}