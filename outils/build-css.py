"""Assemble les feuilles de style sources en un seul fichier minifié : assets/css/app.css.

Les pages ne chargent que app.css. Après toute modification d'un fichier de
assets/css/ (sauf app.css), relancer :  python outils/build-css.py
puis changer le paramètre ?v= des pages pour vider le cache des visiteurs.
"""
import io
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSS = os.path.join(ROOT, 'assets', 'css')
ORDER = ['fonts', 'variables', 'reset', 'global', 'layout', 'components', 'header', 'footer',
         'home', 'contact', 'pages', 'responsive']
BACKSLASH = chr(92)


def minify(css):
    out, i, n = [], 0, len(css)
    while i < n:
        c = css[i]
        if c in '"\'':  # chaîne : recopiée telle quelle
            j = i + 1
            while j < n and css[j] != c:
                j += 2 if css[j] == BACKSLASH else 1
            out.append(css[i:j + 1])
            i = j + 1
        elif css.startswith('/*', i):  # commentaire : supprimé
            i = css.index('*/', i + 2) + 2
        elif c.isspace():
            j = i
            while j < n and css[j].isspace():
                j += 1
            prev = out[-1][-1:] if out else ''
            nxt = css[j:j + 1]
            if prev and prev not in '{};,' and nxt not in '{};,':
                out.append(' ')
            i = j
        else:
            out.append(c)
            i += 1
    return ''.join(out).replace(';}', '}').strip()


parts = []
for name in ORDER:
    with io.open(os.path.join(CSS, name + '.css'), encoding='utf-8') as f:
        parts.append(minify(f.read()))
with io.open(os.path.join(CSS, 'app.css'), 'w', encoding='utf-8', newline='\n') as f:
    f.write('/* Fichier généré par outils/build-css.py : ne pas modifier, éditer les sources. */\n')
    f.write('\n'.join(parts) + '\n')
print('app.css :', os.path.getsize(os.path.join(CSS, 'app.css')), 'octets')
