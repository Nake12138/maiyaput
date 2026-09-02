import os
import re
import shutil
import markdown
from pathlib import Path

BASE_DIR = Path("C:/Users/M/WorkBuddy/2026-08-31-18-10-03/maiyaput")
MD_PATH = Path("C:/Users/M/WorkBuddy/2026-08-31-18-10-03/maiyaput/output/prd-doc-fix-20260902/stage1/final_draft.md")
OUT_DIR = Path("C:/Users/M/WorkBuddy/2026-08-31-18-10-03/maiyaput/output/prd-doc-fix-20260902/stage2")
IMAGES_DIR = OUT_DIR / "images"

IMAGES_DIR.mkdir(parents=True, exist_ok=True)

md = markdown.Markdown(extensions=[
    "tables",
    "fenced_code",
    "toc",
    "nl2br",
])

text = MD_PATH.read_text(encoding="utf-8")

# Convert Markdown image syntax to use local images/ folder for docx embedding
# Pattern: ![alt](path)
def relocate_images(match):
    alt = match.group(1)
    src = match.group(2)
    # Normalize path
    if src.startswith("C:/") or src.startswith("/c/") or src.startswith("file:///"):
        clean = re.sub(r"^file:///+", "", src)
        clean = clean.replace("/", os.sep)
        src_path = Path(clean)
    else:
        src_path = BASE_DIR / src

    if src_path.exists():
        dest = IMAGES_DIR / src_path.name
        shutil.copy2(str(src_path), str(dest))
        return f'![{alt}](images/{src_path.name})'
    return match.group(0)

text = re.sub(r"!\[([^\]]*)\]\(([^\)]+)\)", relocate_images, text)

html_body = md.convert(text)

# Ensure hyperlinks open in new tab (add target="_blank" to external links)
html_body = re.sub(
    r'<a href="(https?://[^"]+)"',
    r'<a href="\1" target="_blank" rel="noopener noreferrer"',
    html_body,
)

# Make sure bullet list items are rendered as compact paragraphs
# The html-to-docx converter should already handle <ul>/<li>; we add CSS to control spacing.
html = f"""<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="docx-page-size" content="A4">
<title>商务中心页面需求文档</title>
<style>
:root {{
  --primary: #1d4ed8;
  --text-main: #101828;
  --text-secondary: #475467;
  --border: #d0d5dd;
  --bg-light: #f8fafc;
}}
body {{
  font-family: "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 11pt;
  line-height: 1.6;
  color: var(--text-main);
  margin: 0;
  padding: 2cm 2.5cm;
}}
h1 {{ font-size: 20pt; color: var(--primary); border-bottom: 2px solid var(--primary); padding-bottom: 8px; margin-top: 0; }}
h2 {{ font-size: 16pt; color: var(--text-main); margin-top: 28px; margin-bottom: 12px; border-left: 4px solid var(--primary); padding-left: 10px; }}
h3 {{ font-size: 13pt; color: var(--text-main); margin-top: 22px; margin-bottom: 10px; }}
h4 {{ font-size: 12pt; color: var(--text-main); margin-top: 16px; margin-bottom: 8px; }}
p {{ margin: 8px 0; }}
a {{ color: var(--primary); text-decoration: underline; }}
ul, ol {{
  margin: 6px 0;
  padding-left: 24px;
}}
li {{
  margin: 2px 0;
  line-height: 1.5;
}}
li > p {{
  margin: 2px 0;
}}
table {{
  border-collapse: collapse;
  width: 100%;
  margin: 12px 0;
  font-size: 10pt;
}}
th, td {{
  border: 1px solid var(--border);
  padding: 6px 8px;
  text-align: left;
  vertical-align: top;
}}
th {{
  background: var(--bg-light);
  font-weight: 600;
}}
img {{
  max-width: 100%;
  height: auto;
  display: block;
  margin: 12px 0;
  border: 1px solid var(--border);
  border-radius: 4px;
}}
pre {{
  background: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 10px;
  overflow-x: auto;
  font-size: 10pt;
}}
blockquote {{
  margin: 10px 0;
  padding: 8px 12px;
  background: var(--bg-light);
  border-left: 4px solid var(--primary);
  color: var(--text-secondary);
}}
</style>
</head>
<body>
{html_body}
</body>
</html>
"""

output_path = OUT_DIR / "formatted-business-report.html"
output_path.write_text(html, encoding="utf-8")
print(f"HTML written to: {output_path}")
print(f"Images copied to: {IMAGES_DIR}")
