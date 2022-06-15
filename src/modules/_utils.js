'use strict'

T20.utils = {
  showDialog (title, inputsEl, callback, extraOptions = {}) {
    const dialog = $(`<div title="${title}"><form>`)
    const form = dialog.find('form').append(inputsEl)
      .append('<input type="submit" tabindex="-1" style="position:absolute; top:-1000px">')
    dialog.dialog({
      autoOpen: true,
      buttons: {
        Confirmar: () => form.submit(),
        Cancelar: () => dialog.dialog('close')
      },
      close: () => dialog.remove(),
      ...extraOptions
    })
    form.on('submit', e => {
      e.preventDefault()
      const formValues = {}
      form.find(':input').each(function () {
        const name = $(this).attr('name')
        if (name) formValues[name] = $(this).val()
      })
      callback && callback(formValues)
      dialog.dialog('close')
    })
    setTimeout(() => {
      form.find(':input:eq(0)').focus()
    }, 1500)
  },
  showSelectDialog (title, options, callback) {
    const input = $('<input type="text" name="value" value="" placeholder="Digite para buscar...">')
    input.on('keydown', e => {
      if (e.keyCode === 13) setTimeout(() => { form.submit() }, 200)
    })
    this.showDialog(title, input, ({ value }) => {
      if (options[value] && callback) callback(options[value])
    })
    setTimeout(() => {
      input.autocomplete({ source: Object.keys(options) })
      input.focus()
    }, 200)
  }
}