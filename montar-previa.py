"""Monta previa/: copia o site inteiro (Home, shop, carrinho, checkout, regras de
rota e os arquivos de site/assets/) e preenche o domínio das tags de compartilhamento.
Nada é carregado de servidor de terceiros: imagens e vídeo saem do próprio site.
Se faltar algum arquivo em site/assets/, rode antes: python3 tools/baixar-assets.py"""
import json
import pathlib
import shutil
import sys

DOMINIO = "https://vulto-drop-previa.vercel.app/"  # troque pelo domínio definitivo

raiz = pathlib.Path(__file__).parent
origem = raiz / "site"
saida = raiz / "previa"
esperados = [k for k in json.loads((raiz / "assets-cdn.json").read_text(encoding="utf-8")) if k.startswith("assets/")]
faltando = [k for k in esperados if not (origem / k).is_file()]
if faltando:
    sys.exit("faltam em site/: " + ", ".join(faltando) + "\nrode: python3 tools/baixar-assets.py")

if saida.exists():
    shutil.rmtree(saida)
shutil.copytree(origem, saida)

for arquivo in saida.rglob("*.html"):
    texto = arquivo.read_text(encoding="utf-8")
    arquivo.write_text(texto.replace("https://SEU-DOMINIO/", DOMINIO), encoding="utf-8")

print("prévia em", saida, "·", sum(1 for f in saida.rglob("*") if f.is_file()), "arquivos")
