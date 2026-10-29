"""Publish the preserved Weaver entrance beside the existing static Duet game."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'public/weaver/index.html').read_text()
assert source.count('href="/">Return to Duet: Solo</a>') == 1
for target, prefix in [('site/index.html', './'), ('site/weaver/index.html', '../')]:
    page = source.replace('href="../style.css"', f'href="{prefix}style.css"').replace('src="../weaver-invitation.js"', f'src="{prefix}weaver-invitation.js"')
    page = page.replace('href="/">Return to Duet: Solo</a>',
                          f'href="{prefix}play/">Play Duet</a><a class="link-button" href="{prefix}review.html">Duet current state</a>')
    page = page.replace('<a class="door" href="#enter">Read the door</a>',
                        f'<a class="door" href="#enter">Read the door</a> <a class="door" href="{prefix}play/">Play Duet</a>')
    path = root / target
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(page)
(root / 'site/style.css').write_bytes((root / 'public/style.css').read_bytes())
print('Built Weaver entrance and /weaver/ alias; original source preserved.')

(root / 'site/weaver-invitation.js').write_bytes((root / 'public/weaver-invitation.js').read_bytes())
