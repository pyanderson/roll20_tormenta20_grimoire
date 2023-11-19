import { openDialog } from '../common/dialog-manager';
import {
  createElement,
  downloadObjectAsJson,
  enhanceElement,
  reverseObj,
} from '../common/helpers';

const ATTRS = {
  playername: '',
  trace: '',
  torigin: '',
  tlevel: '',
  charnivel: '1',
  for: '0',
  des: '0',
  con: '0',
  int: '0',
  sab: '0',
  car: '0',
  vidatotal: '0',
  vida: '0',
  vidatemp: '0',
  manatotal: '0',
  mana: '0',
  manatemp: '0',
  defesaatributo: '1',
  defesaoutros: '0',
  proficiencias: '',
  charnotes: '',
  ts: '0',
  to: '0',
  oficionome: '',
  oficio2nome: '',
};

const JDA_ATTRS = {
  divindade: '',
  modatributodefesa: 'des_mod',
  tamanho: '0',
  deslocamento: '9',
  cdatributo: '@{int_mod} + @{condicaopermental}',
  cdequips: '0',
  cdpoderes: '0',
  cdoutros: '0',
  extraslot: '0',
  // modifies
  rolltemp: '0',
  ataquetemp: '0',
  periciatemp: '0',
  resistemp: '0',
  danotemp: '0',
  fortemp: '0',
  destemp: '0',
  contemp: '0',
  inttemp: '0',
  sabtemp: '0',
  cartemp: '0',
  // conditions
  abalado: '0',
  agarrado: '0',
  alquebrado: '0',
  apavorado: '0',
  atordoado: '0',
  caido: '0',
  cego: '0',
  confuso: '0',
  debilitado: '0',
  desprevenido: '0',
  doente: '0',
  emchama: '0',
  enfeiticado: '0',
  enjoado: '0',
  enreado: '0',
  envenenado: '0',
  esmorecido: '0',
  exausto: '0',
  fascinado: '0',
  fatigado: '0',
  fraco: '0',
  frustrado: '0',
  imovel: '0',
  inconsciente: '0',
  indefeso: '0',
  lento: '0',
  ofuscado: '0',
  paralizado: '0',
  pasmo: '0',
  petrificacao: '0',
  sangrando: '0',
  surdo: '0',
  surpreendido: '0',
  vulneravel: '0',
};

const SKILL_ATTR_FOR = '@{for_mod} + @{condicaoperfisico} + @{condicaocego}';
const SKILL_ATTR_DES = '@{des_mod} + @{condicaoperfisico} + @{condicaocego}';
const SKILL_ATTR_CON = '@{con_mod} + @{condicaoperfisico}';
const SKILL_ATTR_INT = '@{int_mod} + @{condicaopermental}';
const SKILL_ATTR_SAB = '@{sab_mod} + @{condicaopermental}';
const SKILL_ATTR_CAR = '@{car_mod} + @{condicaopermental}';

const SKILLS_ATTRS = {
  acrobacia: ['0', SKILL_ATTR_DES, '0'],
  adestramento: ['0', SKILL_ATTR_CAR, '0'],
  atletismo: ['0', SKILL_ATTR_FOR, '0'],
  atuacao: ['0', SKILL_ATTR_CAR, '0'],
  cavalgar: ['0', SKILL_ATTR_DES, '0'],
  conhecimento: ['0', SKILL_ATTR_INT, '0'],
  cura: ['0', SKILL_ATTR_SAB, '0'],
  diplomacia: ['0', SKILL_ATTR_CAR, '0'],
  enganacao: ['0', SKILL_ATTR_CAR, '0'],
  fortitude: ['0', SKILL_ATTR_CON, '0'],
  furtividade: ['0', SKILL_ATTR_DES, '0'],
  guerra: ['0', SKILL_ATTR_INT, '0'],
  iniciativa: ['0', SKILL_ATTR_DES, '0'],
  intimidacao: ['0', SKILL_ATTR_CAR, '0'],
  intuicao: ['0', SKILL_ATTR_SAB, '0'],
  investigacao: ['0', SKILL_ATTR_INT, '0'],
  jogatina: ['0', SKILL_ATTR_CAR, '0'],
  ladinagem: ['0', SKILL_ATTR_DES, '0'],
  luta: ['0', SKILL_ATTR_FOR, '0'],
  misticismo: ['0', SKILL_ATTR_INT, '0'],
  nobreza: ['0', SKILL_ATTR_INT, '0'],
  oficio: ['0', SKILL_ATTR_INT, '0'],
  oficio2: ['0', SKILL_ATTR_INT, '0'],
  percepcao: ['0', SKILL_ATTR_SAB, '0'],
  pilotagem: ['0', SKILL_ATTR_DES, '0'],
  pontaria: ['0', SKILL_ATTR_DES, '0'],
  reflexos: ['0', SKILL_ATTR_DES, '0'],
  religiao: ['0', SKILL_ATTR_SAB, '0'],
  sobrevivencia: ['0', SKILL_ATTR_SAB, '0'],
  vontade: ['0', SKILL_ATTR_SAB, '0'],
};

// For old sheets it is only the skill total.
const ATTACK_SKILL_PERFORMANCE =
  '@{atuacaototal}+@{condicaomodataquecc}+@{condicaomodataque}';
const ATTACK_SKILL_MELEE =
  '@{lutatotal}+@{condicaomodataquecc}+@{condicaomodataque}';
const ATTACK_SKILL_AIM =
  '@{pontariatotal}+@{condicaomodataquedis}+@{condicaomodataque}';

const ATTACK_GROUP = {
  nomeataque: '',
  bonusataque: '0',
  danoataque: '0',
  danoextraataque: '0',
  dadoextraataque: '0', // JDA
  margemcriticoataque: '20',
  multiplicadorcriticoataque: '2',
  ataquedescricao: '',
  ataquepericia: ATTACK_SKILL_MELEE, // OLD: '@{lutatotal}'
  ataquetipodedano: '',
  ataquealcance: '',
  modatributodano: '@{for_mod}',
  tipocritico: '', // JDA
};

const ABILITY_GROUP = {
  nameability: '',
  abilitydescription: '',
};

const POWER_GROUP = {
  namepower: '',
  powerdescription: '',
};

const SPELL_GROUP = {
  namespell: '',
  spelltipo: '',
  spellcd: '0', // OLD: ''
  spellexecucao: '',
  spellalcance: '',
  spellduracao: '',
  spellalvoarea: '',
  spellresistencia: '',
  spelldescription: '',
};

const SKILL_GROUP = {
  periciaextratreinada: '0',
  periciaextra: '',
  periciaextraatributo2: '@{for_mod} + @{condicaoperfisico} + @{condicaocego}', // OLD: '@{for_mod}'
  periciaextraoutros: '0',
};

const EQUIPMENT_GROUP = {
  equipname: '',
  equipquantity: '0',
  equipslot: '1', // JDA
  equipweight: '1', // OLD
  sobrevivencia_treinada: '0', // JDA
};

const SKILL_OLD_TO_JDA = {
  '@{for_mod}': SKILL_ATTR_FOR,
  '@{des_mod}': SKILL_ATTR_DES,
  '@{con_mod}': SKILL_ATTR_CON,
  '@{int_mod}': SKILL_ATTR_INT,
  '@{sab_mod}': SKILL_ATTR_SAB,
  '@{car_mod}': SKILL_ATTR_CAR,
};

const ATTACK_SKILL_OLD_TO_JDA = {
  '@{atuacaototal}': ATTACK_SKILL_PERFORMANCE,
  '@{lutatotal}': ATTACK_SKILL_MELEE,
  '@{pontariatotal}': ATTACK_SKILL_AIM,
};

const SKILL_JDA_TO_OLD = reverseObj(SKILL_OLD_TO_JDA);

const ATTACK_SKILL_JDA_TO_OLD = reverseObj(ATTACK_SKILL_OLD_TO_JDA);

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
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._dialogHeader = null;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._isJDA = null;
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

  /** @type {Boolean} */
  get isJDA() {
    if (this._isJDA === null) {
      const selector = 'span[data-i18n="global_charactersheet"]';
      this._isJDA = this.iframe.querySelector(selector);
    }
    return Boolean(this._isJDA);
  }

  /** Delete all rep items in the character sheet. */
  deleteOldData() {
    [
      'repeating_attacks',
      'repeating_abilities',
      'repeating_powers',
      'repeating_spells1',
      'repeating_spells2',
      'repeating_spells3',
      'repeating_spells4',
      'repeating_spells5',
      'repeating_skills',
      'repeating_equipment',
    ].forEach((groupName) => {
      const allIds = this.character.attribs.models
        .filter((a) => a.get('name').startsWith(`${groupName}_`))
        .reduce((acc, a) => {
          const regex = new RegExp(
            `^${groupName}_(?<id>-[A-Za-z0-9-]+)_(?<name>.+)$`,
          );
          const match = a.get('name').match(regex);
          const rowId = match?.groups.id;
          if (acc[rowId] === undefined) {
            acc[rowId] = true;
          }
          return acc;
        }, {});
      Object.keys(allIds).forEach((rowId) => {
        this.character.deleteRow(groupName, rowId);
      });
    });
  }

  /**
   * Returns a list with all items of a group normalized.
   *
   * @param {Object} items
   * @param {Object} group - group of attributes with the respective default values.
   * @param {Function} postProcessFn
   * @returns {Object[]}
   */
  getRepImportData(items, group, postProcessFn = (item) => item) {
    if (items === undefined || items === null) return [];
    const getValue = (source, attrName, defaultValue) => {
      const value = source[attrName];
      return value !== undefined ? value : defaultValue;
    };
    return items.map((item) => {
      const newItem = Object.entries(group).reduce(
        (acc, [attrName, defaultValue]) => ({
          ...acc,
          [attrName]: getValue(item, attrName, defaultValue),
        }),
        {},
      );
      return postProcessFn(newItem);
    });
  }

  /**
   * Convert the data to the JDA character sheet format.
   *
   * @param {Object} newData
   * @returns {Object}
   */
  parseToJDA(newData) {
    const data = {};
    const getValue = (source, attrName, defaultValue) => {
      const value = source[attrName];
      return value !== undefined ? value : defaultValue;
    };
    // The common data between both character sheets formats
    Object.entries(ATTRS).forEach(([attrName, defaultValue]) => {
      data[attrName] = getValue(newData, attrName, defaultValue);
    });
    // JDA
    Object.entries(JDA_ATTRS).forEach(([attrName, defaultValue]) => {
      data[attrName] = getValue(newData, attrName, defaultValue);
    });
    if ('isJDA' in newData && !newData.isJDA) {
      ['for', 'des', 'con', 'int', 'sab', 'car'].forEach((attr) => {
        data[attr] = `${Math.floor((parseFloat(data[attr]) - 10) / 2)}`;
      });
    }
    // skills
    const getAttrValue = (value, defaultValue) => {
      if (value in SKILL_JDA_TO_OLD) {
        return value;
      } else if (value in SKILL_OLD_TO_JDA) {
        return SKILL_OLD_TO_JDA[value];
      }
      return defaultValue;
    };
    Object.entries(SKILLS_ATTRS).forEach(([skillName, defaultArray]) => {
      ['_treinada', 'atributo2', 'outros'].forEach((suffix, index) => {
        const attrName = `${skillName}${suffix}`;
        const value = newData[attrName];
        if (value !== undefined) {
          data[attrName] =
            suffix === 'atributo2'
              ? getAttrValue(value, defaultArray[index])
              : value;
        } else {
          data[attrName] =
            suffix === 'atributo2'
              ? SKILL_JDA_TO_OLD[defaultArray[index]]
              : defaultArray[index];
        }
      });
    });
    data.attacks = this.getRepImportData(
      newData.attacks,
      ATTACK_GROUP,
      (attack) => {
        const skill = attack.ataquepericia;
        if (skill in ATTACK_SKILL_OLD_TO_JDA) {
          attack.ataquepericia = ATTACK_SKILL_OLD_TO_JDA[skill];
        } else if (!(skill in ATTACK_SKILL_JDA_TO_OLD)) {
          attack.ataquepericia = ATTACK_SKILL_MELEE;
        }
        return attack;
      },
    );
    data.abilities = this.getRepImportData(newData.abilities, ABILITY_GROUP);
    data.powers = this.getRepImportData(newData.powers, POWER_GROUP);
    const pSpell = (spell) => {
      if (spell.spellcd) {
        spell.spellcd = '0';
      }
      return spell;
    };
    data.spells1 = this.getRepImportData(newData.spells1, SPELL_GROUP, pSpell);
    data.spells2 = this.getRepImportData(newData.spells2, SPELL_GROUP, pSpell);
    data.spells3 = this.getRepImportData(newData.spells3, SPELL_GROUP, pSpell);
    data.spells4 = this.getRepImportData(newData.spells4, SPELL_GROUP, pSpell);
    data.spells5 = this.getRepImportData(newData.spells5, SPELL_GROUP, pSpell);
    data.equipments = this.getRepImportData(
      newData.equipments,
      EQUIPMENT_GROUP,
      (equipment) => {
        if ('isJDA' in newData && !newData.isJDA) {
          equipment.equipslot = equipment.equipweight;
        }
        return equipment;
      },
    );
    data.skills = this.getRepImportData(newData.skills, SKILL_GROUP);
    return data;
  }

  /**
   * Convert the data to the Old character sheet format.
   *
   * @param {Object} newData
   * @returns {Object}
   */
  parseToOld(newData) {
    const data = {};
    const getValue = (source, attrName, defaultValue) => {
      const value = source[attrName];
      return value !== undefined ? value : defaultValue;
    };
    // The common data between both character sheets formats
    Object.entries(ATTRS).forEach(([attrName, defaultValue]) => {
      data[attrName] = getValue(newData, attrName, defaultValue);
    });
    if (newData.isJDA) {
      ['for', 'des', 'con', 'int', 'sab', 'car'].forEach((attr) => {
        data[attr] = `${parseInt(data[attr]) + 10}`;
      });
    }
    // skills
    const getAttrValue = (value, defaultValue) => {
      if (value in SKILL_OLD_TO_JDA) {
        return value;
      } else if (value in SKILL_JDA_TO_OLD) {
        return SKILL_JDA_TO_OLD[value];
      }
      return SKILL_JDA_TO_OLD[defaultValue];
    };
    Object.entries(SKILLS_ATTRS).forEach(([skillName, defaultArray]) => {
      ['_treinada', 'atributo2', 'outros'].forEach((suffix, index) => {
        const attrName = `${skillName}${suffix}`;
        const value = newData[attrName];
        if (value !== undefined) {
          data[attrName] =
            suffix === 'atributo2'
              ? getAttrValue(value, defaultArray[index])
              : value;
        } else {
          data[attrName] =
            suffix === 'atributo2'
              ? SKILL_JDA_TO_OLD[defaultArray[index]]
              : defaultArray[index];
        }
      });
    });
    data.attacks = this.getRepImportData(
      newData.attacks,
      ATTACK_GROUP,
      (attack) => {
        const skill = attack.ataquepericia;
        if (skill in ATTACK_SKILL_JDA_TO_OLD) {
          attack.ataquepericia = ATTACK_SKILL_JDA_TO_OLD[skill];
        } else if (!(skill in ATTACK_SKILL_OLD_TO_JDA)) {
          attack.ataquepericia = ATTACK_SKILL_JDA_TO_OLD[ATTACK_SKILL_MELEE];
        }
        return attack;
      },
    );
    data.abilities = this.getRepImportData(newData.abilities, ABILITY_GROUP);
    data.powers = this.getRepImportData(newData.powers, POWER_GROUP);
    const pSpell = (spell) => {
      if (spell.spellcd === '0' || spell.spellcd === '1') {
        spell.spellcd = '';
      }
      return spell;
    };
    data.spells1 = this.getRepImportData(newData.spells1, SPELL_GROUP, pSpell);
    data.spells2 = this.getRepImportData(newData.spells2, SPELL_GROUP, pSpell);
    data.spells3 = this.getRepImportData(newData.spells3, SPELL_GROUP, pSpell);
    data.spells4 = this.getRepImportData(newData.spells4, SPELL_GROUP, pSpell);
    data.spells5 = this.getRepImportData(newData.spells5, SPELL_GROUP, pSpell);
    data.equipments = this.getRepImportData(
      newData.equipments,
      EQUIPMENT_GROUP,
      (equipment) => {
        if (newData.isJDA) {
          equipment.equipweight = equipment.equipslot;
        }
        return equipment;
      },
    );
    data.skills = [];
    return data;
  }

  /**
   * Update all data and add new rep items.
   *
   * @param {Object} newData
   */
  importNewData(newData) {
    const {
      attacks,
      abilities,
      powers,
      spells1,
      spells2,
      spells3,
      spells4,
      spells5,
      equipments,
      skills,
      ...data
    } = this.isJDA ? this.parseToJDA(newData) : this.parseToOld(newData);
    this.character.updateAttributes('', data, false);
    this.character.addRepAttributes('repeating_attacks', attacks, false);
    this.character.addRepAttributes('repeating_abilities', abilities, false);
    this.character.addRepAttributes('repeating_powers', powers, false);
    this.character.addRepAttributes('repeating_spells1', spells1, false);
    this.character.addRepAttributes('repeating_spells2', spells2, false);
    this.character.addRepAttributes('repeating_spells3', spells3, false);
    this.character.addRepAttributes('repeating_spells4', spells4, false);
    this.character.addRepAttributes('repeating_spells5', spells5, false);
    this.character.addRepAttributes('repeating_equipment', equipments, false);
    if (this.isJDA) {
      this.character.addRepAttributes('repeating_skills', skills, false);
    }
  }

  /** Add the import button on the dialog header. */
  renderImportDialogContent() {
    const fileInput = createElement('input', {
      id: 't20-file-input',
      classes: 'btn',
      type: 'file',
      accept: '.json',
    });
    const importButton = createElement('button', {
      classes: 'btn',
      disabled: true,
      innerHTML: 'Importar',
    });
    const successMessage = createElement('p', {
      classes: 'tormenta20-success-message',
    });
    const errorMessage = createElement('p', {
      classes: 'tormenta20-error-message',
    });
    const clearMessages = () => {
      errorMessage.textContent = '';
      successMessage.textContent = '';
    };
    fileInput.addEventObserver('change', () => {
      clearMessages();
      if (fileInput?.files?.length > 0) {
        const fileName = fileInput.files[0].name;
        const fileExtension = fileName.split('.').pop().toLowerCase();
        if (fileExtension === 'json') {
          importButton.disabled = false;
        } else {
          importButton.disabled = true;
          fileInput.value = '';
        }
        return;
      }
      importButton.disabled = true;
    });
    importButton.addEventObserver('click', () => {
      try {
        clearMessages();
        importButton.disabled = true;
        importButton.textContent = 'Importando...';
        if (fileInput?.files?.length > 0) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const fileContent = e.target.result;
            const newData = JSON.parse(fileContent);
            this.character.attribs.fetch({
              success: () => {
                this.deleteOldData();
                this.importNewData(newData);
                importButton.textContent = 'Importar';
                successMessage.textContent = 'Arquivo importado com sucesso!';
              },
            });
          };
          reader.readAsText(fileInput.files[0]);
        }
      } catch (e) {
        errorMessage.textContent = 'Falha ao processar o arquivo.';
        console.error({ e });
      }
    });
    return createElement('div', {
      classes: 'tormenta20-import-content',
      append: [
        createElement('p', { innerHTML: 'Essa é uma feature experimental.' }),
        createElement('p', {
          innerHTML:
            '<b>Atenção</b>: Não é possível desfazer essa operação, todos os dados já existentes serão apagados e substituídos.',
        }),
        successMessage,
        errorMessage,
        fileInput,
        importButton,
      ],
    });
  }

  /** Add the import button on the dialog header. */
  addImportButton() {
    const span = this.dialogHeader.getElement('span.ui-dialog-title');
    const importButton = createElement('button', {
      id: 't20-import-button',
      classes: 'btn tormenta20-import-export-button',
      innerHTML: 'Importar',
    });
    importButton.addEventObserver('click', () => {
      openDialog({
        id: `import-dialog-id-${this.character.get('id')}`,
        title: `Importar para ${this.character.get('name')}`,
        content: [this.renderImportDialogContent()],
      });
    });
    span.insertBefore(importButton, span.childNodes[2]);
  }

  /**
   * Returns a list with all items of a group.
   *
   * @param {String} groupName
   * @param {Object} group - group of attributes with the respective default values.
   * @returns {Object[]}
   */
  getRepExportData(groupName, group) {
    const allItems = this.character.attribs.models
      .filter((a) => a.get('name').startsWith(`${groupName}_`))
      .reduce((acc, a) => {
        const regex = new RegExp(
          `^${groupName}_(?<id>-[A-Za-z0-9-]+)_(?<name>.+)$`,
        );
        const match = a.get('name').match(regex);
        const rowId = match?.groups.id;
        if (acc[rowId] === undefined) {
          acc[rowId] = { [match?.groups.name]: a.get('current') };
        } else {
          acc[rowId][match?.groups.name] = a.get('current');
        }
        return acc;
      }, {});
    Object.values(allItems).forEach((attack) => {
      Object.entries(group).forEach(([attrName, defaultValue]) => {
        const value = attack[attrName];
        if (value === undefined) {
          attack[attrName] = defaultValue;
        }
      });
    });
    return Object.values(allItems);
  }

  /** Exports the character data to a JSON file. */
  exportData() {
    const filename = `t20-${this.character.get('name')}${this.character.get(
      'id',
    )}`;
    const data = { isJDA: this.isJDA };
    const attrsMap = this.character.attribs.models.reduce(
      (acc, a) => ({ ...acc, [a.get('name')]: a }),
      {},
    );
    const getData = ([attrName, defaultValue]) => {
      const value = attrsMap[attrName];
      if (value !== undefined) {
        data[attrName] = value.get('current');
      } else {
        data[attrName] = defaultValue;
      }
    };
    // The common data between both character sheets formats
    Object.entries(ATTRS).forEach(getData);
    // JDA
    Object.entries(JDA_ATTRS).forEach(getData);
    // skills
    Object.entries(SKILLS_ATTRS).forEach(([skillName, defaultArray]) => {
      ['_treinada', 'atributo2', 'outros'].forEach((suffix, index) => {
        const attrName = `${skillName}${suffix}`;
        const value = attrsMap[attrName];
        if (value !== undefined) {
          data[attrName] = value.get('current');
          return;
        }
        data[attrName] = defaultArray[index];
      });
    });
    data.attacks = this.getRepExportData('repeating_attacks', ATTACK_GROUP);
    data.abilities = this.getRepExportData(
      'repeating_abilities',
      ABILITY_GROUP,
    );
    data.powers = this.getRepExportData('repeating_powers', POWER_GROUP);
    data.spells1 = this.getRepExportData('repeating_spells1', SPELL_GROUP);
    data.spells2 = this.getRepExportData('repeating_spells2', SPELL_GROUP);
    data.spells3 = this.getRepExportData('repeating_spells3', SPELL_GROUP);
    data.spells4 = this.getRepExportData('repeating_spells4', SPELL_GROUP);
    data.spells5 = this.getRepExportData('repeating_spells5', SPELL_GROUP);
    data.extraSkills = this.getRepExportData('repeating_skills', SKILL_GROUP);
    data.equipments = this.getRepExportData(
      'repeating_equipment',
      EQUIPMENT_GROUP,
    );
    downloadObjectAsJson(data, filename);
  }

  /** Add the export button on the dialog header. */
  addExportButton() {
    const span = this.dialogHeader.getElement('span.ui-dialog-title');
    const exportButton = createElement('button', {
      id: 't20-export-button',
      classes: 'btn tormenta20-import-export-button',
      innerHTML: 'Exportar',
    });
    exportButton.addEventObserver('click', () => {
      exportButton.textContent = 'Exportando...';
      exportButton.disabled = true;
      this.character.attribs.fetch({
        success: () => {
          this.exportData();
          exportButton.textContent = 'Exportar';
          exportButton.disabled = false;
        },
      });
    });
    span.insertBefore(exportButton, span.childNodes[3]);
  }

  /** Load the sheet import/export capabilities. */
  load() {
    if (!document.querySelector('#t20-import-button')) {
      this.addImportButton();
      this.addExportButton();
    }
  }
}
