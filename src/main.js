function loadScript(path) {
  const s = document.createElement('script');
  s.src = chrome.runtime.getURL(path);
  s.type = 'text/javascript';
  s.onload = () => {
    s.remove();
  };
  (document.head || document.documentElement).appendChild(s);
}

// https://youmightnotneedjquery.com/#ready
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {
  const DB_PATH = 'static/db.json';
  const CHARACTER_SHEET_CSS_PATH = 'src/css/sheet.css';
  const ICON_PATH = 'static/icons/32.png';
  loadScript('index.js');
  fetch(chrome.runtime.getURL(DB_PATH))
    .then((response) => response.json())
    .then((db) => {
      const characterSheetCssURL = chrome.runtime.getURL(
        CHARACTER_SHEET_CSS_PATH,
      );
      const buttonIconURL = chrome.runtime.getURL(ICON_PATH);
      window.postMessage(
        { type: 't20-data', db, characterSheetCssURL, buttonIconURL },
        '*',
      );
    });
});
