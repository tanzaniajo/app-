#!/usr/bin/env python3
"""Inline the stylesheet and every script into one self-contained studyhub.html."""
import re, pathlib

root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text()

def css_tag(m):
    href = m.group(1)
    return '<style>\n' + (root / href).read_text().rstrip() + '\n</style>'

html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css_tag, html)

def js_tag(m):
    src = m.group(1)
    return '<script>\n' + (root / src).read_text().rstrip() + '\n</script>'

html = re.sub(r'<script src="([^"]+)"></script>', js_tag, html)

assert 'href="css' not in html and 'script src=' not in html, 'something was left un-inlined'
out = root / 'studyhub.html'
out.write_text(html)
print('wrote %s (%.0f KB)' % (out.name, out.stat().st_size / 1024))
