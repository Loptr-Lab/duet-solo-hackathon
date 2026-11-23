"""Publish the preserved Weaver entrance beside the existing static Duet game."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = (root / 'public/weaver/index.html').read_text()
assert source.count('href="/">Return to Duet: Solo</a>') == 1
for target, prefix in [('site/index.html', './'), ('site/weaver/index.html', '../')]:
    page = source.replace('href="../style.css"', f'href="{prefix}style.css"').replace('src="../weaver-invitation.js"', f'src="{prefix}weaver-invitation.js"')
    page = page.replace('href="/">Return to Duet: Solo</a>',
                          f'href="{prefix}play/">Play Duet</a><a class="link-button" href="{prefix}review.html">Duet current state</a>')
    page = page.replace('<a class="door" href="https://ibloud.github.io/inpatient-corridors-review/interactive/yellow-door/docs/">Read the door</a>',
                        f'<a class="door" href="https://ibloud.github.io/inpatient-corridors-review/interactive/yellow-door/docs/">Read the door</a> <a class="door" href="{prefix}play/">Play Duet</a>')
    page = page.replace('>Play Duet</a>', '>Play Duet locally</a>')
    page = page.replace('<a class="door" href="https://ibloud.github.io/inpatient-corridors-review/interactive/yellow-door/docs/">Read the door</a>',
                        '<a class="door" href="https://ibloud.github.io/inpatient-corridors-review/interactive/yellow-door/docs/">Read the door</a> <a class="door" href="https://duet-multiplayer-production.up.railway.app">Play Duet multiplayer demo</a>')
    # Both published entrances represent the same reading surface. Keep the
    # HTTPS URL already listed in the hub sitemap as their canonical address.
    assert 'rel="canonical"' not in page
    page = page.replace('</head>', '<link rel="canonical" href="https://break.loptrlab.com/duet/">\n</head>', 1)
    page = page.replace('</head>', '<script type="application/ld+json" id="site-breadcrumbs">{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Break This Build","item":"https://break.loptrlab.com/"},{"@type":"ListItem","position":2,"name":"The Weaver","item":"https://break.loptrlab.com/duet/"}]}</script>\n' + '</head>', 1)
    path = root / target
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(page)
(root / 'site/style.css').write_bytes((root / 'public/style.css').read_bytes())
print('Built Weaver entrance and /weaver/ alias; original source preserved.')

(root / 'site/weaver-invitation.js').write_bytes((root / 'public/weaver-invitation.js').read_bytes())

# The root hub uses the same authoritative stylesheet as the Duet surfaces.
(root / 'review-site/style.css').write_bytes((root / 'public/style.css').read_bytes())
