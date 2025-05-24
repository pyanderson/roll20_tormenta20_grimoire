import hashlib
import json
from collections import OrderedDict, defaultdict
from operator import itemgetter
from pathlib import Path

output_path = "static/db.json"


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
        "items": ([
            {
                "name": "Admissão",
                "description": d["admission"],
                "type": "item"
            }
        ] if "admission" in d else [] ) + [
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
distinctions = load_folder("data/distinctions")
equipments = load_folder("data/equipments")

# fill the book
for name, source in [
    ("Raças", races),
    ("Classes", classes),
    ("Poderes", powers),
    ("Magias", spells),
    ("Distinções", distinctions)
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
    "Distinções",
    "Origens",
    "Deuses",
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

a_and_p_group = OrderedDict()
entry_name_group = defaultdict(list)
abilities_and_powers = OrderedDict()
entries = (
    sorted(races, key=itemgetter("name"))
    + sorted(classes, key=itemgetter("name"))
    + sorted(distinctions, key=itemgetter("name"))
    + sorted(powers, key=itemgetter("name"))
)
for entry in entries:
    for item in entry.get("abilities", entry.get("powers")):
        source = item.get("source")
        source = f" - {source}" if source else ""
        key_suffix = hashlib.md5(item["description"].encode()).hexdigest()
        key = f"{item['name']}{source}__{key_suffix}"
        a_and_p_group[key] = item
        entry_name_group[key].append(entry["name"])

for key, item in a_and_p_group.items():
    key_prefix = key.split("__")[0]
    new_key = f"{key_prefix} - {', '.join(entry_name_group[key])}"
    abilities_and_powers[new_key] = item

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
