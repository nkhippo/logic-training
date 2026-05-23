#!/usr/bin/env python3
"""Inject CLAUDE_API_KEY from env into js/shared/01-config.js (GitHub Actions deploy)."""
import os
import re
import sys
from pathlib import Path

def main():
    key = os.environ.get('CLAUDE_API_KEY', '').strip()
    if not key:
        return 0
    path = Path('js/shared/01-config.js')
    text = path.read_text(encoding='utf-8')
    new, n = re.subn(
        r"(let CLAUDE_API_KEY)='[^']*'",
        lambda m: f"{m.group(1)}={key!r}",
        text,
        count=1,
    )
    if n != 1:
        print('CLAUDE_API_KEY assignment not found in js/shared/01-config.js', file=sys.stderr)
        return 1
    path.write_text(new, encoding='utf-8')
    return 0

if __name__ == '__main__':
    sys.exit(main())
