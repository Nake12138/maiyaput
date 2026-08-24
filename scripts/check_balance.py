# -*- coding: utf-8 -*-
"""验证 index.html 与 pages/ 目录的 div 平衡"""
import os

base = r'c:/Users/M/WorkBuddy/automation-claw-20260706114454/prototype'

for name in ['index.html'] + [f'pages/{f}' for f in sorted(os.listdir(os.path.join(base, 'pages'))) if f.endswith('.html')]:
    path = os.path.join(base, name)
    with open(path, encoding='utf-8') as f:
        c = f.read()
    opens = c.count('<div')
    closes = c.count('</div>')
    print(f'{name}: opens={opens}, closes={closes}, diff={opens - closes}')
