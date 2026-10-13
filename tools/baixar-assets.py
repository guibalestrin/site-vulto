"""Baixa para site/assets/ os arquivos que ficavam hospedados no Higgsfield
(endereços em assets-cdn.json), para o site não depender de servidor de terceiros.
Uso: python3 tools/baixar-assets.py   (pula o que já foi baixado)"""
import json
import pathlib
import sys
import urllib.request

raiz = pathlib.Path(__file__).resolve().parent.parent
mapa = json.loads((raiz / "assets-cdn.json").read_text(encoding="utf-8"))
destino = raiz / "site"
falhas = 0

for local, url in mapa.items():
    if not local.startswith("assets/"):
        continue
    arquivo = destino / local
    if arquivo.exists() and arquivo.stat().st_size > 0:
        print("ok (já existe)", local)
        continue
    arquivo.parent.mkdir(parents=True, exist_ok=True)
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "vulto-assets"}), timeout=120) as r:
            dados = r.read()
            esperado = int(r.headers.get("Content-Length") or len(dados))
        if len(dados) != esperado or not dados:
            raise ValueError(f"tamanho {len(dados)} != {esperado}")
        arquivo.write_bytes(dados)
        print(f"baixado {local} · {len(dados):,} bytes")
    except Exception as erro:  # segue com os outros e falha no fim
        falhas += 1
        print(f"FALHOU {local}: {erro}", file=sys.stderr)

sys.exit(1 if falhas else 0)
