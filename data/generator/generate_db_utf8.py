import json
from collections import OrderedDict
from operator import itemgetter
from pathlib import Path

output_path = "static/db.json"

# Raças que possuem alguma repetição de poder por serem variantes
racas_com_repeticao = {
    "Soterrado", "Trog Anão", "Golem de Barro", "Golem de Bronze", "Golem de Carne", 
    "Golem de Espelhos", "Golem de Ferro", "Golem de Gelo Eterno", "Golem de Pedra", 
    "Golem de Sucata", "Mashin"
}

# Poderes que são repetidos nas raças variantes
itens_que_retornam_zero = {
    "Natureza Esquelética", "Preço da Não Vida", "Mau Cheiro", "Mordida",
    "Sangue Frio", "Criatura Artificial", "Propósito de Criação", "Fonte de Energia"
}

def repeticao(nominho, item):
    if nominho in racas_com_repeticao:
        if item['name'] in itens_que_retornam_zero:
            return 0
        else:
            return 1
    else:
        return 1

def load_folder(source_path):
    folder = []
    for path in Path(source_path).rglob("*.json"):
        with open(path, encoding="utf-8") as jfile:
            folder.append(json.load(jfile))
    return folder

def convert_to_book_folder(d):
    items = d.get("abilities", d.get("powers", d.get("spells")))
    return {
        "type": "folder",
        "name": d["name"],
        "items": [
            {
                **item,
                "spellType": item.get("type"),
                "type": "item",
            }
            for item in items
        ],
    }

# load data
book = load_folder("data/book")
races = load_folder("data/races")
classes = load_folder("data/classes")
powers = load_folder("data/powers")
spells = load_folder("data/spells")
equipments = load_folder("data/equipments")

# fill the book
for name, source in [
    ("Raças", races),
    ("Classes", classes),
    ("Poderes", powers),
    ("Magias", spells),
]:
    book.append(
        {
            "type": "folder",
            "name": name,
            "items": sorted(
                [convert_to_book_folder(d) for d in source], key=itemgetter("name")
            ),
        }
    )

book_folders_order = [
    "Condições",
    "Raças",
    "Classes",
    "Origens",
    "Perícias",
    "Poderes",
    "Equipamento",
    "Magias",
    "Testes",
    "Habilidades",
    "Combate",
    "Tabelas",
]
book = sorted(book, key=lambda item: book_folders_order.index(item["name"]))

abilities_and_powers = OrderedDict()
for source in (
    sorted(races, key=itemgetter("name"))
    + sorted(classes, key=itemgetter("name"))
    + sorted(powers, key=itemgetter("name"))
):
    for item in source.get("abilities", source.get("powers")):
        extra = item.get("source")
        if repeticao(source['name'], item):
            abilities_and_powers[ 
                f"{source['name']}{f' - {extra}' if extra else ''} - {item['name']}"
            ] = item

spells_circles = OrderedDict()
for spell_circle in spells:
    spells_circles[spell_circle["name"][0]] = OrderedDict()
    for spell in sorted(spell_circle["spells"], key=itemgetter("name")):
        spells_circles[spell_circle["name"][0]][spell["name"]] = spell

with open(output_path, "w", encoding="utf-8") as jfile:
    json.dump(
        {
            "book": book,
            "abilities_and_powers": abilities_and_powers,
            "spells": spells_circles,
            "equipments": equipments,
            "races": sorted(races, key=itemgetter("name")),
        },
        jfile,
        ensure_ascii=False,
    )
