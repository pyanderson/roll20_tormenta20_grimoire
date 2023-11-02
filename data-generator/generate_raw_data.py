import argparse
import re
import subprocess

chapter_names = [
    "construção de personagem",
    "perícias & poderes",
    "equipamento",
    "magia",
    "jogando",
    "o mestre",
    "ameaças",
    "recompensas",
]

email_regex = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b")
chapter_regex = re.compile(r"^capítulo \w+$", re.IGNORECASE)
break_line_regex = re.compile(r"\n{3,}")


def read_book_pages(book_path, first_page, last_page):
    return subprocess.check_output(
        f"pdftotext -f {first_page} -l {last_page} -nopgbrk {book_path} -",
        shell=True,
        text=True,
    )


def clear_text(text, first_page, last_page):
    lines = text.split("\n")
    lines = [line for line in lines if line.strip().lower() not in chapter_names]
    lines = [line for line in lines if email_regex.search(line) is None]
    lines = [line for line in lines if chapter_regex.match(line) is None]
    lines = [
        line
        for line in lines
        if not line.strip().isdigit()
        or not (first_page <= int(line.strip()) + 6 <= last_page)
    ]
    return "\n".join(lines)


def format_text(text):
    text = text.replace("\n\n", "=====")
    text = " ".join(text.split()).replace("=====", "\n\n")
    raw_blocks = break_line_regex.sub("\n\n", text).split("\n\n")
    blocks = []
    buffer = []
    for block in raw_blocks:
        if len(block) <= 40:
            blocks.append("\n".join(buffer))
            buffer = [block]
        else:
            buffer.append(block)
    if len(buffer) > 0:
        blocks.append("\n".join(buffer))
    return "\n\n".join(blocks).replace(" •", "\n•").strip()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("book_path", type=str)
    parser.add_argument("first_page", type=int)
    parser.add_argument("last_page", type=int)
    parser.add_argument("output", type=str)

    args = parser.parse_args()

    raw_text = format_text(
        clear_text(
            read_book_pages(args.book_path, args.first_page, args.last_page),
            args.first_page,
            args.last_page,
        )
    )

    with open(args.output, "w") as raw_file:
        raw_file.write(raw_text)


if __name__ == "__main__":
    main()
