import argparse
import json


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=str)
    parser.add_argument("output", type=str)

    args = parser.parse_args()

    with open(args.input) as input_file:
        file_content = input_file.read()

    items = []
    blocks = file_content.split("\n\n")

    for block in blocks:
        paragraphs = block.split("\n")
        if len(paragraphs) == 1:
            items.append({"type": "item", "name": "", "description": paragraphs[0]})
            continue
        name = paragraphs[0].strip().strip(".")
        description = "\n\n".join(paragraphs[1:])
        items.append({"type": "item", "name": name, "description": description})

    with open(args.output, "w") as output_file:
        json.dump(items, output_file, indent=2, ensure_ascii=False)


if __name__ == "__main__":
    main()
