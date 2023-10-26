$(document).ready(() => {
  $(window).on('message', (e) => {
    const data = e.originalEvent.data;
    if (data.type === 'loaded') {
      // only add the improvements when a character sheet is opened
      loadSheetEnhancement(data.characterId);
    }
  });

  loadBook();
});
