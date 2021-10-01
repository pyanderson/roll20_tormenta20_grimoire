'use strict'

$(document).ready(function () {
  $(window).on('message', function (e) {
    const data = e.originalEvent.data;
    if (data.type === 'loaded') {
      const iframe = $(`iframe[name="iframe_${data.characterId}"]`);
      const character_sheet = new CharacterSheet(iframe.contents(), data.characterId);
      character_sheet.render();
    }
  });
})
