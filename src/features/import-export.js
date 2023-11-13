import { createElement, enhanceElement } from '../common/helpers';

/**
 * Create a new ImportExportSheet object.
 *
 * @class
 */
export class ImportExportSheet {
  /**
   * @constructs
   * @param {Object} props
   * @param {EnhancedHTMLElement} props.iframe
   * @param {Object} props.character
   */
  constructor({ iframe, character }) {
    /** @type {EnhancedHTMLElement} */
    this.iframe = iframe;
    /** @type {Object} */
    this.character = character;
    this._dialogHeader = null;
  }

  /** @type {EnhancedHTMLElement|null} */
  get dialogHeader() {
    if (this._dialogHeader === null) {
      const characterId = this.character.get('id');
      const selector = `iframe[name="iframe_${characterId}"]`;
      const rawIframe = document.querySelector(selector);
      const header = rawIframe
        .closest('div.ui-dialog')
        .querySelector('div.ui-dialog-titlebar');
      this._dialogHeader = enhanceElement(header);
    }
    return this._dialogHeader;
  }

  addImportButton() {
    const span = this.dialogHeader.getElement('span.ui-dialog-title');
    const importButton = createElement('button', {
      id: 't20-import-button',
      classes: 'btn tormenta20-import-export-button',
      innerHTML: 'Importar',
    });
    importButton.addEventObserver('click', () => {
      console.log('import');
    });
    span.insertBefore(importButton, span.childNodes[2]);
  }

  addExportButton() {
    const span = this.dialogHeader.getElement('span.ui-dialog-title');
    const exportButton = createElement('button', {
      id: 't20-export-button',
      classes: 'btn tormenta20-import-export-button',
      innerHTML: 'Exportar',
    });
    exportButton.addEventObserver('click', () => {
      console.log('export');
    });
    span.insertBefore(exportButton, span.childNodes[3]);
  }

  /** Load the sheet import/export capabilities. */
  load() {
    this.addImportButton();
    this.addExportButton();
  }
}
