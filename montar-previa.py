"""Monta previa/: copia o site inteiro (Home, shop, carrinho, checkout e regras
de rota) e troca os caminhos de /assets/ pelos endereços hospedados no Higgsfield."""
import json
import pathlib
import shutil

raiz = pathlib.Path(__file__).parent
origem = raiz / "site"
saida = raiz / "previa"
mapa = {k: v for k, v in json.loads((raiz / "assets-cdn.json").read_text(encoding="utf-8")).items() if k.startswith("assets/")}

if saida.exists():
    shutil.rmtree(saida)
shutil.copytree(origem, saida, ignore=shutil.ignore_patterns("assets"))

for arquivo in saida.rglob("*"):
    if arquivo.suffix not in {".html", ".js", ".css"}:
        continue
    texto = arquivo.read_text(encoding="utf-8")
    for local, remoto in mapa.items():
        texto = texto.replace("/" + local, remoto).replace(local, remoto)
    arquivo.write_text(texto, encoding="utf-8")

print("prévia em", saida, "·", sum(1 for f in saida.rglob("*") if f.is_file()), "arquivos")
