'use strict';

import { openDialog } from '../common/dialog-manager';
import { createElement } from '../common/helpers';
import { ImportExportSheet } from './import-export';

// ---------------------------------------------------------------------------
// Mapeamentos
// ---------------------------------------------------------------------------

const SKILL_NAME_TO_FIELD = {
  Acrobacia: 'acrobacia',
  Adestramento: 'adestramento',
  Atletismo: 'atletismo',
  'Atuação': 'atuacao',
  Cavalgar: 'cavalgar',
  Conhecimento: 'conhecimento',
  Cura: 'cura',
  Diplomacia: 'diplomacia',
  'Enganação': 'enganacao',
  Fortitude: 'fortitude',
  Furtividade: 'furtividade',
  Guerra: 'guerra',
  Iniciativa: 'iniciativa',
  'Intimidação': 'intimidacao',
  'Intuição': 'intuicao',
  'Investigação': 'investigacao',
  Jogatina: 'jogatina',
  Ladinagem: 'ladinagem',
  Luta: 'luta',
  Misticismo: 'misticismo',
  Nobreza: 'nobreza',
  'Percepção': 'percepcao',
  Pilotagem: 'pilotagem',
  Pontaria: 'pontaria',
  Reflexos: 'reflexos',
  'Religião': 'religiao',
  'Sobrevivência': 'sobrevivencia',
  Vontade: 'vontade',
};

const SIZE_MAP = {
  'Minúsculo': -4,
  Pequeno: -2,
  'Médio': 0,
  Grande: 1,
  Enorme: 2,
  Colossal: 4,
};

const ATTACK_SKILL_MELEE =
  '@{lutatotal}+@{condicaomodataquecc}+@{condicaomodataque}';
const ATTACK_SKILL_RANGED =
  '@{pontariatotal}+@{condicaomodataquedis}+@{condicaomodataque}';

// ---------------------------------------------------------------------------
// Conversão monstro → dados de importação
// ---------------------------------------------------------------------------

/**
 * Converte um objeto _monster para o formato aceito pelo importNewData().
 *
 * @param {Object} monster
 * @returns {Object}
 */
export function monsterToSheetData(monster) {
  const data = {
    isJDA: true,
    playername: '',
    trace: monster.type || '',
    torigin: '',
    tlevel: '',
    charnivel: '1',
  };

  // Atributos
  const attrs = monster.attributes || {};
  const attrVal = (key) => {
    const v = attrs[key];
    if (v === null || v === undefined) return '0';
    return String(v);
  };
  data.for = attrVal('str');
  data.des = attrVal('dex');
  data.con = attrVal('con');
  data.int = attrVal('int');
  data.sab = attrVal('wis');
  data.car = attrVal('cha');

  // PV e PM
  data.menace_name = monster.name || 'SEM NOME';
  data.vidatotal = String(monster.hp || 0);
  data.vida = String(monster.hp || 0);
  data.vidatemp = '0';
  data.manatotal = String(monster.pm || 0);
  data.mana = String(monster.pm || 0);
  data.manatemp = '0';

  // Defesa: defesaatributo=0, defesaoutros = valor base
  data.defesaatributo = '0';
  data.defesaoutros = String(parseInt(monster.defense || '0') || 0);

  // Deslocamento (primeiro valor em metros)
  const movMatch = (monster.movement || '').match(/(\d+)m/);
  data.deslocamento = movMatch ? movMatch[1] : '9';

  // Tamanho
  data.tamanho = String(SIZE_MAP[monster.size] ?? 0);

  // Notas com dados do monstro
  const roleStr = monster.role ? ` [${monster.role}]` : '';
  const subtypeStr = monster.subtype ? ` (${monster.subtype})` : '';
  const noteLines = [
    `${monster.type}${subtypeStr} ${monster.size}${roleStr}`,
    `ND: ${monster.nd}`,
  ];
  if (monster.initiative) noteLines.push(`Iniciativa: ${monster.initiative}`);
  if (monster.perception) noteLines.push(`Percepção: ${monster.perception}`);
  if ((monster.other_perception || []).length)
    noteLines.push(monster.other_perception.join(', '));
  if (monster.fort)
    noteLines.push(`Fort: ${monster.fort} | Ref: ${monster.ref} | Von: ${monster.von}`);
  if ((monster.immunities || []).length)
    noteLines.push(`Imunidades: ${monster.immunities.join(', ')}`);
  if (Object.keys(monster.damage_reduction || {}).length) {
    const rdStr = Object.entries(monster.damage_reduction)
      .map(([k, v]) => (k === 'normal' ? `${v}` : `${v}/${k}`))
      .join(', ');
    noteLines.push(`RD: ${rdStr}`);
  }
  if ((monster.vulnerabilities || []).length)
    noteLines.push(`Vulnerabilidades: ${monster.vulnerabilities.join(', ')}`);
  if (monster.treasure) noteLines.push(`\nTesouro: ${monster.treasure}`);
  data.charnotes = noteLines.join('\n');

  // Campos obrigatórios restantes
  data.proficiencias = '';
  data.ts = '0';
  data.to = '0';
  data.oficionome = '';
  data.oficio2nome = '';
  data.divindade = '';
  data.modatributodefesa = 'des_mod';
  data.cdatributo = '@{int_mod} + @{condicaopermental}';
  data.cdequips = '0';
  data.cdpoderes = '0';
  data.cdoutros = '0';
  data.extraslot = '0';

  // Perícias: zera todas, depois marca as que o monstro possui
  Object.values(SKILL_NAME_TO_FIELD).forEach((field) => {
    data[`${field}_treinada`] = '0';
    data[`${field}outros`] = '0';
  });
  Object.entries(monster.skills || {}).forEach(([skillName, bonus]) => {
    const field = SKILL_NAME_TO_FIELD[skillName];
    if (field) {
      data[`${field}_treinada`] = '1';
      data[`${field}outros`] = bonus; // bônus como modificador extra
    }
  });

  // Ataques
  data.attacks = (monster.attacks || []).map((attack) => {
    const isRanged = attack.type === 'à distância';
    return {
      nomeataque: attack.name || '',
      bonusataque: attack.bonus || '0',
      danoataque: attack.damage || '0',
      danoextraataque: '0',
      dadoextraataque: '0',
      margemcriticoataque: '20',
      multiplicadorcriticoataque: '2',
      ataquedescricao: attack.type || '',
      ataquepericia: isRanged ? ATTACK_SKILL_RANGED : ATTACK_SKILL_MELEE,
      ataquetipodedano: '',
      ataquealcance: isRanged ? 'médio' : 'corpo a corpo',
      modatributodano: '@{for_mod}',
      tipocritico: '',
    };
  });

  // Habilidades especiais
  data.abilities = (monster.abilities || []).map((ab) => {
    const actionStr = ab.action ? ` (${ab.action})` : '';
    const magicStr = ab.is_magical ? ' [Mágica]' : '';
    return {
      nameability: `${ab.name}${actionStr}${magicStr}`,
      abilitydescription: ab.description || '',
    };
  });

  // Magias do monstro → habilidade extra
  if (monster.spell_description || (monster.spells || []).length > 0) {
    const spellLines = [];
    if (monster.spell_description) spellLines.push(monster.spell_description);
    (monster.spells || []).forEach((s) => {
      const cost = s.cost ? ` (${s.cost})` : '';
      spellLines.push(`${s.name}${cost}: ${s.description}`);
    });
    data.abilities.push({
      nameability: 'Magia',
      abilitydescription: spellLines.join('\n'),
    });
  }

  // Equipamentos
  data.equipments = (monster.equipment || []).map((item) => ({
    equipname: typeof item === 'string' ? item : (item.name || ''),
    equipslot: 1,
    equipquantity: '1',
    equipweight: '1',
    sobrevivencia_treinada: '0',
  }));

  data.powers = [];
  data.spells1 = [];
  data.spells2 = [];
  data.spells3 = [];
  data.spells4 = [];
  data.spells5 = [];
  data.skills = [];

  return data;
}

// ---------------------------------------------------------------------------
// Dialog de confirmação e importação
// ---------------------------------------------------------------------------

/**
 * Abre dialog de confirmação para importar monstro na ficha ativa.
 *
 * @param {Object} props
 * @param {Object} props.monster
 * @param {ImportExportSheet} props.importExportSheet
 */
export function openMonsterImportDialog({ monster, importExportSheet }) {
  const dialogId = `tormenta20-monster-import-${monster.name.replace(/\s+/g, '-')}`;

  const successMessage = createElement('p', {
    classes: 'tormenta20-success-message',
  });
  const errorMessage = createElement('p', {
    classes: 'tormenta20-error-message',
  });
  const importButton = createElement('button', {
    classes: 'btn',
    innerHTML: 'Importar Monstro',
  });

  importButton.addEventListener('click', () => {
    try {
      errorMessage.textContent = '';
      successMessage.textContent = '';
      importButton.disabled = true;
      importButton.textContent = 'Importando...';

      const sheetData = monsterToSheetData(monster);
      importExportSheet.character.attribs.fetch({
        success: () => {
          importExportSheet.deleteOldData();
          importExportSheet.importNewData(sheetData);
          importButton.textContent = 'Importar Monstro';
          importButton.disabled = false;
          successMessage.textContent = 'Monstro importado com sucesso!';
        },
      });
    } catch (e) {
      errorMessage.textContent = 'Falha ao importar o monstro.';
      importButton.textContent = 'Importar Monstro';
      importButton.disabled = false;
      console.error({ e });
    }
  });

  openDialog({
    id: dialogId,
    title: `Importar "${monster.name}" para a ficha`,
    content: [
      createElement('div', {
        classes: 'tormenta20-import-content',
        append: [
          createElement('p', {
            innerHTML: `Isso vai substituir <b>todos os dados</b> da ficha pelos dados de <b>${monster.name}</b>.`,
          }),
          createElement('p', {
            innerHTML:
              '<b>Atenção</b>: Essa operação não pode ser desfeita.',
          }),
          successMessage,
          errorMessage,
          importButton,
        ],
      }),
    ],
  });
}