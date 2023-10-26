function loadScript(path) {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL(path);
  s.type = 'text/javascript';
  s.onload = function () {
    this.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}
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
