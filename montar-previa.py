"""Monta previa/index.html: o site com os arquivos apontando para o Higgsfield."""
import json
import pathlib

raiz = pathlib.Path(__file__).parent
mapa = json.loads((raiz / "assets-cdn.json").read_text(encoding="utf-8"))
html = (raiz / "site" / "index.html").read_text(encoding="utf-8")
for local, remoto in mapa.items():
    if local.startswith("assets/"):
        html = html.replace(local, remoto)
saida = raiz / "previa"
saida.mkdir(parents=True, exist_ok=True)
(saida / "index.html").write_text(html, encoding="utf-8")
print("prévia em", saida / "index.html", len(html), "bytes")
