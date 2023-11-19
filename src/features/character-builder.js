import { openDialog } from '../common/dialog-manager';
import { clearChildren, createElement, hasCSS } from '../common/helpers';

const ATTRIBUTES = ['for', 'des', 'con', 'int', 'sab', 'car'];
const SKILLS = [
  'Acrobacia',
  'Adestramento',
  'Atletismo',
  'Atuação',
  'Cavalgar',
  'Conhecimento',
  'Cura',
  'Diplomacia',
  'Enganação',
  'Fortitude',
  'Furtividade',
  'Guerra',
  'Iniciativa',
  'Intimidação',
  'Intuição',
  'Investigação',
  'Jogatina',
  'Ladinagem',
  'Luta',
  'Misticismo',
  'Nobreza',
  'Ofício',
  'Percepção',
  'Pilotagem',
  'Pontaria',
  'Reflexos',
  'Religião',
  'Sobrevivência',
  'Vontade',
];
const ELEMENTS = ['frio', 'eletricidade', 'fogo', 'ácido', 'luz', 'trevas'];

const FORM = `
     <div class="t20-cb-form">
      <div id="t20-cb-attrs-row" class="t20-cb-row">
        <div class="t20-cb-column">
          <label for="t20-cb-attr-for">For</label>
          <input
            name="t20-cb-attr-for"
            class="t20-cb-input"
            type="number"
            value="0"
          />
        </div>
        <div class="t20-cb-column">
          <label for="t20-cb-attr-des">Des</label>
          <input
            name="t20-cb-attr-des"
            class="t20-cb-input"
            type="number"
            value="0"
          />
        </div>
        <div class="t20-cb-column">
          <label for="t20-cb-attr-con">Con</label>
          <input
            name="t20-cb-attr-con"
            class="t20-cb-input"
            type="number"
            value="0"
          />
        </div>
        <div class="t20-cb-column">
          <label for="t20-cb-attr-int">Int</label>
          <input
            name="t20-cb-attr-int"
            class="t20-cb-input"
            type="number"
            value="0"
          />
        </div>
        <div class="t20-cb-column">
          <label for="t20-cb-attr-sab">Sab</label>
          <input
            name="t20-cb-attr-sab"
            class="t20-cb-input"
            type="number"
            value="0"
          />
        </div>
        <div class="t20-cb-column">
          <label for="t20-cb-attr-car">Car</label>
          <input
            name="t20-cb-attr-car"
            class="t20-cb-input"
            type="number"
            value="0"
          />
        </div>
        <div class="t20-cb-column">
          <label for="t20-cb-attrs-points">Pontos</label>
          <input
            name="t20-cb-attrs-points"
            class="t20-cb-input"
            type="text"
            value="10"
            disabled
          />
        </div>
      </div>
      <div id="t20-cb-race-row" class="t20-cb-row">
        <div class="t20-cb-column">
          <label for="t20-cb-race">Raça</label>
          <select name="t20-cb-race" class="t20-cb-select"></select>
        </div>
        <div class="t20-cb-column">
          <div id="t20-cb-race-attributes" class="t20-cb-row"></div>
        </div>
      </div>
      <div class="t20-cb-row">
        <div id="t20-cb-race-optional-effects" class="t20-cb-column"></div>
      </div>
      <div class="t20-cb-row">
        <ul id="t20-cb-race-abilities" class="t20-cb-list-pill"></ul>
      </div>
      <div class="t20-cb-row">
        <button class="t20-cb-button">Aplicar</button>
      </div>
    </div>
`;

/**
 * Create a new Character Buiilder object.
 *
 * @class
 */
export class CharacterBuilder {
  /**
   * @constructs
   * @param {Object} props
   * @param {EnhancedHTMLElement} props.iframe
   * @param {Object} props.character
   * @param {String} props.characterBuilderCssURL - URL for the custom URL to be applied to the character builder.
   * @param {Race[]} props.races
   * @param {PowerData} props.abilitiesAndPowers
   * @param {SpellData} props.spells
   */
  constructor({
    iframe,
    character,
    characterBuilderCssURL,
    races,
    abilitiesAndPowers,
    spells,
  }) {
    /** @type {EnhancedHTMLElement} */
    this.iframe = iframe;
    /** @type {Object} */
    this.character = character;
    /** @type {String} */
    this.characterBuilderCssURL = characterBuilderCssURL;
    /** @type {Race[]} */
    this.races = races;
    /** @type {PowerData} */
    this.abilitiesAndPowers = abilitiesAndPowers;
    /** @type {SpellData} */
    this.spells = spells;
    /** @type {String[]} */
    this.generalPowers = Object.keys(this.abilitiesAndPowers).filter((key) =>
      key.startsWith('Poderes '),
    );
    this.content = null;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._navTabs = null;
    /**
     * @type {EnhancedHTMLElement|null}
     * @private
     */
    this._tabContent = null;
  }

  /** @type {EnhancedHTMLElement|null} */
  get navTabs() {
    if (this._navTabs === null) {
      const path = 'ul.nav.nav-tabs';
      this._navTabs = this.iframe.getElement(path);
    }
    return this._navTabs;
  }

  /** @type {EnhancedHTMLElement|null} */
  get tabContent() {
    if (this._tabContent === null) {
      const path = '#tab-content';
      this._tabContent = this.iframe.getElement(path);
    }
    return this._tabContent;
  }

  /** Add the character builder nav tab. */
  addNavTab() {
    const link = createElement('a', {
      id: 'tormenta20-character-builder-li',
      href: 'javascript:void(0);',
      textContent: 'Construtor de Personagem',
    });
    link.setAttribute('data-tab', 'tormenta20-character-builder');
    const tab = createElement('li', { classes: '', append: [link] });
    this.navTabs.append(tab);
    this.navTabs.addEventObserver('click', (e) => {
      if (e.target?.tagName?.toLowerCase() === 'a' && e.target.id !== link.id) {
        this.content.style.display = 'none';
      } else if (
        e.target?.tagName?.toLowerCase() === 'a' &&
        e.target.id === link.id
      ) {
        this.content.style.display = 'flex';
      }
    });
  }

  /** Add the character builder tab content. */
  addTabContentItem() {
    this.content = createElement('div', {
      classes: 'tab-pane',
      innerHTML: FORM,
    });
    this.tabContent.append(this.content);
  }

  /** Add the character builder attribute change handler. */
  addAttrChangeHandler() {
    const attrsDiv = this.content.getElement('#t20-cb-attrs-row');
    const points = attrsDiv.getElement('input[name="t20-cb-attrs-points"]');
    attrsDiv.addEventObserver(
      'change',
      (e) => {
        const attrs = this.content.getAllElements('input[type="number"]');
        const values = attrs.map((attrInput) => parseInt(attrInput.value) || 0);
        const total = values.reduce((acc, value) => {
          if (value === -1) return acc + 1;
          if (value === 0) return acc;
          if (value === 1) return acc - 1;
          if (value === 2) return acc - 2;
          if (value === 3) return acc - 4;
          if (value === 4) return acc - 7;
          return acc;
        }, 10);
        points.value = total;
        const target = e.target;
        const value = parseInt(target.value);
        const hasError =
          isNaN(value) || [-1, 0, 1, 2, 3, 4].indexOf(value) === -1;
        target.classList.toggle('t20-cb-input-error', hasError);
      },
      'input[type="number"]',
    );
  }

  /** Add the character builder race change handler. */
  addRaceChangeHandler() {
    const raceRow = this.content.getElement('#t20-cb-race-row');
    const raceAbilities = this.content.getElement('#t20-cb-race-abilities');
    const raceOptionalEffects = this.content.getElement(
      '#t20-cb-race-optional-effects',
    );
    const raceSelect = raceRow.getElement('select[name="t20-cb-race"]');
    const getRace = () =>
      this.races.find((race) => race.name === raceSelect.value);
    const raceAttributes = raceRow.getElement('#t20-cb-race-attributes');
    const createValidate =
      (...nodes) =>
      () => {
        const allValues = nodes.map((node) => node.value);
        for (const node of nodes) {
          const value = node.value;
          const count = allValues.filter((v) => v === value).length;
          node.classList.toggle('t20-cb-input-error', count > 1);
        }
      };
    const renderAttribute = ({ attr, mod }) => {
      const disabled = attr !== 'any';
      const options =
        attr !== 'any'
          ? [createElement('option', { value: attr, textContent: attr })]
          : ATTRIBUTES.map((a) =>
              createElement('option', { value: a, textContent: a }),
            );
      const attrSelect = createElement('select', {
        name: 'race-attr',
        disabled,
        append: options,
      });
      // TODO: remember to use the mod value to Calculate the final attr value
      return createElement('div', {
        classes: 't20-cb-race-attribute',
        append: [attrSelect, createElement('span', { textContent: mod })],
      });
    };
    const renderAttributes = () => {
      clearChildren({ el: raceAttributes });
      const race = getRace();
      if (!race) return;
      race.attributes.forEach((attr) => {
        raceAttributes.appendChild(renderAttribute(attr));
      });
      const raceAttrValidate = createValidate(
        ...raceAttributes.getAllElements('select[name="race-attr"]'),
      );
      raceAttributes.addEventObserver(
        'change',
        raceAttrValidate,
        'select[name="race-attr"]',
      );
      raceAttrValidate();
    };
    const renderAbilities = () => {
      clearChildren({ el: raceAbilities });
      const race = getRace();
      if (!race) return;
      race.abilities.forEach((ability) => {
        const pill = createElement('li', {
          classes: 't20-cb-pill',
          textContent: ability.name,
        });
        pill.addEventObserver('click', () => {
          openDialog({
            id: `t20-${race.name}-${ability.name}`,
            title: ability.name,
            content: [createElement('p', { textContent: ability.description })],
            width: 400,
            height: 200,
          });
        });
        raceAbilities.appendChild(pill);
      });
    };
    const createTitle = (title) =>
      createElement('span', {
        classes: 't20-cb-title',
        textContent: `${title}:`,
      });
    const createRow = (title, ...nodes) =>
      createElement('div', {
        classes: 't20-cb-row',
        append: [createTitle(title), ...nodes],
      });
    const createOption = (option) => {
      const { value, text } =
        typeof option === 'string' ? { value: option, text: option } : option;
      return createElement('option', { value, textContent: text });
    };
    const createSelect = (name, opts) => {
      const options = opts.map((name) => createOption(name));
      return createElement('select', {
        name,
        classes: 't20-cb-select',
        append: options,
      });
    };
    const customSelectSpells = (spells) => {
      const spell1 = createSelect('t20-cb-race-spell', spells);
      const spell2 = createSelect('t20-cb-race-spell', spells);
      const validate = createValidate(spell1, spell2);
      spell1.addEventObserver('change', validate);
      spell2.addEventObserver('change', validate);
      validate();
      return [spell1, spell2];
    };

    const skillsSelect = (suffix = '') =>
      createSelect(`t20-cb-race-skill${suffix}`, SKILLS);
    const generalPowersSelect = () =>
      createSelect('t20-cb-race-power', this.generalPowers);
    const tormentaPowersSelect = () =>
      createSelect(
        't20-cb-race-power',
        this.generalPowers.filter((name) =>
          name.startsWith('Poderes da Tormenta'),
        ),
      );
    const raceAbilitiesSelect = () =>
      createSelect(
        't20-cb-race-ability',
        this.races
          .filter((race) => race.name !== 'Osteon')
          .reduce(
            (acc, race) => [
              ...acc,
              ...race.abilities.map((ability) => ability.name),
            ],
            [],
          ),
      );
    const renderOptionalEffects = () => {
      clearChildren({ el: raceOptionalEffects });
      const race = getRace();
      if (!race) return;
      const effectsMap = {
        Versátil: () => {
          const select = createSelect('t20-cb-effect', [
            { value: '1', text: '2 Perícias treinadas' },
            { value: '2', text: '1 Perícia treinada e 1 Poder geral' },
          ]);
          const content = createElement('div', { classes: 't20-cb-row' });
          const onChange = () => {
            clearChildren({ el: content });
            const value = select.value;
            if (value === '1') {
              const nodes = [skillsSelect(), skillsSelect()];
              const validate = createValidate(...nodes);
              nodes.forEach((node) =>
                node.addEventObserver('change', validate),
              );
              validate();
              content.append(...nodes);
            } else if (value === '2') {
              content.append(skillsSelect(), generalPowersSelect());
            }
          };
          select.addEventObserver('change', onChange);
          onChange();
          return createRow('Versátil', select, content);
        },
        Deformidade: () => {
          const select = createSelect('t20-cb-effect', [
            { value: '1', text: '+2 em 2 Perícias' },
            { value: '2', text: '+2 em 1 Perícia e 1 Poder da Tormenta' },
          ]);
          const content = createElement('div', { classes: 't20-cb-row' });
          const onChange = () => {
            clearChildren({ el: content });
            const value = select.value;
            if (value === '1') {
              const nodes = [skillsSelect('bonus'), skillsSelect('bonus')];
              const validate = createValidate(...nodes);
              nodes.forEach((node) =>
                node.addEventObserver('change', validate),
              );
              validate();
              content.append(...nodes);
            } else if (value === '2') {
              content.append(skillsSelect(), tormentaPowersSelect());
            }
          };
          select.addEventObserver('change', onChange);
          onChange();
          return createRow('Deformidade', select, content);
        },
        'Resistência Elemental': () => {
          const select = createSelect('t20-cb-race-resistance', ELEMENTS);
          return createRow('Resistência Elemental', select);
        },
        'Tatuagem Mística': () => {
          const spells = Object.keys(this.spells[1]);
          const select = createSelect('t20-cb-race-spell', spells);
          return createRow('Tatuagem Mística', select);
        },
        'Propósito de Criação': () => {
          return createRow('Propósito de Criação', generalPowersSelect());
        },
        'Fonte Elemental': () => {
          const spirits = ['frio', 'eletricidade', 'fogo', 'ácido'];
          const select = createSelect('t20-cb-race-immunity', spirits);
          return createRow('Fonte Elemental', select);
        },
        'Pequeno e Rechonchudo': () => {
          const select = createSelect('t20-cb-race-skill-Atletismo-attr', [
            'for',
            'des',
          ]);
          return createRow('Pequeno e Rechonchudo', select);
        },
        'Memória Póstuma': () => {
          const select = createSelect('t20-cb-effect', [
            { value: '1', text: '1 Perícia treinada' },
            { value: '2', text: '1 Poder geral' },
            { value: '3', text: 'Habilidade de Raça' },
          ]);
          const content = createElement('div', { classes: 't20-cb-row' });
          const onChange = () => {
            clearChildren({ el: content });
            const value = select.value;
            if (value === '1') {
              content.append(skillsSelect());
            } else if (value === '2') {
              content.append(generalPowersSelect());
            } else if (value === '3') {
              content.append(raceAbilitiesSelect());
            }
          };
          select.addEventObserver('change', onChange);
          onChange();
          return createRow('Memória Póstuma', select, content);
        },
        'Canção dos Mares': () => {
          const spells = [
            'Amedrontar',
            'Comando',
            'Despedaçar',
            'Enfeitiçar',
            'Hipnotismo',
            'Sono',
          ];
          const [spell1, spell2] = customSelectSpells(spells);
          return createRow('Canção dos Mares', spell1, spell2);
        },
        'Magia das Fadas': () => {
          const spells = ['Criar Ilusão', 'Enfeitiçar', 'Luz', 'Sono'];
          const [spell1, spell2] = customSelectSpells(spells);
          return createRow('Magia das Fadas', spell1, spell2);
        },
      };
      race.abilities.forEach((ability) => {
        if (ability.name in effectsMap) {
          raceOptionalEffects.appendChild(effectsMap[ability.name]());
        }
      });
    };
    this.races.forEach((race) => {
      raceSelect.appendChild(
        createElement('option', { value: race.name, textContent: race.name }),
      );
    });
    const onRaceChange = () => {
      renderAttributes();
      renderAbilities();
      renderOptionalEffects();
    };
    raceSelect.addEventObserver('change', onRaceChange);
    onRaceChange();
  }

  /** Load the character builder capabilities. */
  load() {
    this.addNavTab();
    this.addTabContentItem();
    this.addAttrChangeHandler();
    this.addRaceChangeHandler();
    this.loadCSS();
  }

  /** Load the extra css in the iframe. */
  loadCSS() {
    if (hasCSS({ iframe: this.iframe, url: this.characterBuilderCssURL }))
      return;
    this.iframe.head.appendChild(
      createElement('link', {
        rel: 'stylesheet',
        href: this.characterBuilderCssURL,
      }),
    );
  }
}
