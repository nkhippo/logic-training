#!/usr/bin/env python3
"""Split app.js into js/ modules (global scope, script tag order)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BACKUP = ROOT / "app.monolith.js"
SRC = ROOT / "app.js"

if not BACKUP.exists() and SRC.exists() and len(SRC.read_text()) > 10000:
    BACKUP.write_text(SRC.read_text(encoding="utf-8"), encoding="utf-8")

src_lines = BACKUP.read_text(encoding="utf-8").splitlines(keepends=True)

def chunk(start, end):
    return "".join(src_lines[start - 1 : end])

OUT = ROOT / "js"
OUT.mkdir(exist_ok=True)

PAST_SHARED_START, PAST_SHARED_END = 2509, 2526

specs = [
    ("01-config.js", [(1, 4, "/* Config */")]),
    ("02-i18n.js", [(6, 402, "/* i18n */")]),
    ("03-state.js", [(404, 410, "/* State */")]),
    ("04-domain.js", [(412, 631, "/* Domain */")]),
    ("05-core-ui.js", [(632, 1227, "/* Core UI */")]),
    ("06-utils-md.js", [(1228, 1422, "/* Markdown */")]),
    ("07-api.js", [(1423, 1654, "/* API + print */")]),
    ("08-fill.js", [(1656, 2058, "/* Fill */")]),
    ("09-summary.js", [(2060, 2506, "/* Summary */")]),
    ("10-past-shared.js", [(PAST_SHARED_START, PAST_SHARED_END, "/* Past shared */")]),
    ("11-critique.js", [
        (2507, PAST_SHARED_START - 1, "/* Critique */"),
        (PAST_SHARED_END + 1, 2774, None),
    ]),
    ("12-ame.js", [(2775, 3073, "/* Ame */")]),
    ("13-past.js", [(3075, 3349, "/* Past */")]),
    ("14-guide.js", [(3351, 3415, "/* Guide */")]),
    ("15-kibari.js", [(3417, 3968, "/* Kibari */")]),
    ("16-init.js", [(3970, len(src_lines), "/* Init */")]),
]

for fname, parts in specs:
    blocks = []
    for start, end, header in parts:
        b = chunk(start, end)
        if b.strip():
            if header:
                blocks.append(header + "\n" + b)
            else:
                blocks.append(b)
    (OUT / fname).write_text("".join(blocks), encoding="utf-8")
    print(f"wrote {fname}")

SRC.write_text(
    "/* Monolith moved to app.monolith.js — see js/*.js */\n",
    encoding="utf-8",
)
