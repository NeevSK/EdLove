import re
content = open('.viewer.html', 'r', encoding='utf-8').read()
content = re.sub(r'(href|src)="/_next/', r'\1="https://www.foglamp.dev/_next/', content)
content = re.sub(r"(href|src)='/next/", r"\1='https://www.foglamp.dev/next/", content)
open('scan-viewer.html', 'w', encoding='utf-8').write(content)
print('Written: scan-viewer.html (' + str(len(content)) + ' bytes)')
