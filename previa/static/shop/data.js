/* =========================================================================
   VULTO SHOP · BASE DE DADOS DEMONSTRATIVA (MOCK DATA)
   -------------------------------------------------------------------------
   Tudo neste arquivo é fictício: drops, produtos, preços, estoques e datas.
   Serve para demonstrar o catálogo enquanto não existe um backend comercial.
   Para trocar pelo catálogo real, substitua VULTO_DATA mantendo o mesmo
   formato; as regras de visibilidade em core.js continuam valendo.

   Imagens: entradas { type: 'photo' } são fotografias (em /assets/ ou em
   /static/shop/fotos/). Com { color: 'preto' } a foto só aparece quando essa
   cor está escolhida. Entradas { type: 'svg' } são
   ilustrações temporárias desenhadas em código (core.js · renderGarment)
   e devem ser substituídas por fotos quando existirem.

   O calendário dos drops vem de /static/vulto.js (fonte única com a Home).

   Campos opcionais de produto. Só preencha com informação verificada; vazio,
   o site simplesmente não mostra nada:
     fit: 'oversized' | 'regular' | 'boxy' | 'reto'   (ficha técnica)
     model: { height: 182, size: 'G' }                 (quem vestiu na foto)
     highlight: 'mais-visto-do-drop' | 'em-alta' | 'mais-salvo-semana'
                (vem do analytics; nunca à mão)
     noRestock: true   (só quando a Vulto confirmou que não haverá reposição)
     rating: { avg: 4.8, count: 41 }   (nota média de 1 a 5 e número de avaliações.
                Aqui são DEMONSTRATIVAS; na loja real, só avaliações verificadas)
     teaser: true      (aparece como coming soon até o drop dela abrir; nunca é
                        vendida pelo site antes disso)
   ========================================================================= */
window.VULTO_DATA = (() => {
  const drops = window.VULTO.drops;

  const categories = [
    { id: 'camisetas',  name: 'Camisetas' },
    { id: 'moletons',   name: 'Moletons' },
    { id: 'jaquetas',   name: 'Jaquetas' },
    { id: 'calcas',     name: 'Calças' },
    { id: 'bermudas',   name: 'Bermudas' },
    { id: 'bones',      name: 'Bonés e gorros' },
    { id: 'acessorios', name: 'Acessórios' }
  ];

  const colors = {
    preto:  { name: 'Preto',        hex: '#161615' },
    osso:   { name: 'Osso',         hex: '#e6e1d4' },
    cinza:  { name: 'Cinza',        hex: '#7d7b76' },
    mescla: { name: 'Cinza mescla', hex: '#a8a6a0' },
    grafite:{ name: 'Grafite',      hex: '#3b3b38' },
    azul:   { name: 'Azul claro',   hex: '#9cb0c4' },
    cru:    { name: 'Cru',          hex: '#d6ccb4' },
    branco: { name: 'Branco',       hex: '#efede6' }
  };

  const TOPS = ['P', 'M', 'G', 'GG', 'XG'];
  const JEANS = ['38', '40', '42', '44', '46'];
  const UNICO = ['Único'];

  // stock: { cor: [qtd por tamanho, na ordem de sizes] }
  function variants(slug, sizes, stock) {
    const out = [];
    for (const color of Object.keys(stock)) {
      sizes.forEach((size, i) => out.push({ sku: `${slug}-${color}-${size}`.toLowerCase(), color, size, stock: stock[color][i] || 0 }));
    }
    return out;
  }

  const p = (o) => ({ status: 'published', siteSale: true, ...o, variants: variants(o.slug, o.sizes, o.stock) });

  const products = [
    // ---------- Drop 13 · Tinta ----------
    p({ id: 'vt-13-02', rating: { avg: 4.9, count: 64 }, slug: 'moletom-anel', name: 'Moletom Anel', category: 'moletons', dropId: 'drop-13', price: 429,
        description: 'Moletom de capuz em felpa pesada com anel de tinta branca nas costas.',
        garment: 'hoodie', print: 'ring', sizes: TOPS, stock: { preto: [2, 0, 4, 3, 1] },
        images: [
          { type: 'photo', src: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3Kb3YKeSIaGwJYI6odUy0XejCWs/fda23d5f-efcf-45ab-8f6e-6802e7583c94.jpg', alt: 'Moletom Anel preto, vista de costas com o anel de tinta branca' }
        ] }),
    p({ id: 'vt-13-03', rating: { avg: 4.8, count: 41 }, slug: 'calca-jeans-concreto', name: 'Calça Jeans Concreto', category: 'calcas', dropId: 'drop-13', price: 349,
        description: 'Jeans de corte reto, lavagem clara e desgaste nos joelhos.',
        garment: 'pants', print: 'none', fit: 'reto', sizes: JEANS, stock: { azul: [1, 4, 6, 0, 2] },
        images: [
          { type: 'photo', src: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3Kb3YKeSIaGwJYI6odUy0XejCWs/a067344c-bf83-42cb-b8be-d7ea51a21ccc.jpg', alt: 'Calça Jeans Concreto de lavagem clara pendurada em frente a um pilar de concreto' }
        ] }),
    p({ id: 'vt-13-05', rating: { avg: 4.7, count: 88 }, slug: 'bone-vulto', name: 'Boné Vulto', category: 'bones', dropId: 'drop-13', price: 149,
        description: 'Boné de seis gomos com VULTO bordado na frente e regulagem atrás.',
        garment: 'cap', print: 'logo', sizes: UNICO, stock: { preto: [7] },
        images: [{ type: 'photo', color: 'preto', src: '/static/shop/fotos/bone-preto.jpg', alt: 'Boné Vulto preto lavado com VULTO bordado, sobre um case preto' }] }),

    // ---------- Drop 12 · Garoa ----------
    p({ id: 'vt-12-01', rating: { avg: 4.9, count: 37 }, slug: 'corta-vento-garoa', name: 'Corta-vento Garoa', category: 'jaquetas', dropId: 'drop-12', price: 499,
        description: 'Corta-vento leve com zíper frontal e recorte no peito.',
        garment: 'jacket', print: 'cut', sizes: TOPS, stock: { preto: [0, 2, 1, 1, 0], grafite: [1, 3, 2, 0, 1] },
        images: [
          { type: 'photo', color: 'preto', src: '/static/shop/fotos/corta-vento-preto.jpg', alt: 'Corta-vento Garoa preto com zíper, vivo refletivo e VULTO no peito' },
          { type: 'photo', color: 'grafite', src: '/static/shop/fotos/corta-vento-grafite.jpg', alt: 'Corta-vento Garoa grafite com zíper, vivo refletivo e VULTO no peito' }
        ] }),
    p({ id: 'vt-12-02', rating: { avg: 4.8, count: 112 }, slug: 'camiseta-logo-corte', name: 'Camiseta Logo Corte', category: 'camisetas', dropId: 'drop-12', price: 159,
        description: 'Camiseta de algodão com o logo VULTO grande na frente.',
        garment: 'tee', print: 'logo', sizes: TOPS, stock: { osso: [2, 5, 4, 2, 1] },
        images: [
          { type: 'photo', color: 'osso', src: '/static/shop/fotos/camiseta-logo-osso.jpg', alt: 'Camiseta Logo Corte osso com VULTO preto na frente' },
          { type: 'photo', color: 'osso', src: '/static/shop/fotos/camiseta-logo-osso-dobrada.jpg', alt: 'Camiseta Logo Corte osso apoiada sobre um case' }
        ] }),
    p({ id: 'vt-12-04', rating: { avg: 5.0, count: 29 }, slug: 'gorro-vulto', name: 'Gorro Vulto', category: 'bones', dropId: 'drop-12', price: 119,
        description: 'Gorro de malha canelada com etiqueta VULTO na barra.',
        garment: 'beanie', print: 'logo', sizes: UNICO, stock: { preto: [0] },
        images: [{ type: 'photo', color: 'preto', src: '/static/shop/fotos/gorro-preto.jpg', alt: 'Gorro Vulto preto canelado com etiqueta VULTO' }] }),

    // ---------- Drop 11 · Concreto ----------
    p({ id: 'vt-11-01', rating: { avg: 4.8, count: 95 }, slug: 'moletom-logo', name: 'Moletom Logo', category: 'moletons', dropId: 'drop-11', price: 399,
        description: 'Moletom de capuz com o logo VULTO no peito.',
        garment: 'hoodie', print: 'logo', sizes: TOPS, stock: { mescla: [1, 2, 3, 2, 1] },
        images: [
          { type: 'photo', color: 'mescla', src: '/static/shop/fotos/moletom-logo-frente.jpg', alt: 'Moletom Logo cinza mescla, vista de frente com VULTO no peito' },
          { type: 'photo', color: 'mescla', src: '/static/shop/fotos/moletom-logo-costas.jpg', alt: 'Moletom Logo cinza mescla, vista de costas com VULTO grande' }
        ] }),
    p({ id: 'vt-11-02', rating: { avg: 4.7, count: 143 }, slug: 'meia-vulto', name: 'Meia Vulto', category: 'acessorios', dropId: 'drop-11', price: 69,
        description: 'Meia cano alto de algodão com VULTO no cano.',
        garment: 'socks', print: 'logo', sizes: ['34 a 38', '39 a 44'], stock: { branco: [6, 9] },
        images: [{ type: 'photo', color: 'branco', src: '/static/shop/fotos/meia-branco.jpg', alt: 'Par de meias Vulto brancas de cano alto com VULTO no cano' }] }),
    p({ id: 'vt-11-03', rating: { avg: 4.9, count: 52 }, slug: 'ecobag-concreto', name: 'Ecobag Concreto', category: 'acessorios', dropId: 'drop-11', price: 89,
        description: 'Ecobag de lona com o anel de tinta impresso.',
        garment: 'tote', print: 'ring', sizes: UNICO, stock: { cru: [12] },
        images: [{ type: 'photo', color: 'cru', src: '/static/shop/fotos/ecobag.jpg', alt: 'Ecobag Concreto de lona crua com o anel de tinta preto' }] }),

    // ---------- Drop 10 · Asfalto: venda do estoque remanescente desligada ----------
    p({ id: 'vt-10-01', rating: { avg: 4.8, count: 33 }, slug: 'jaqueta-asfalto', name: 'Jaqueta Asfalto', category: 'jaquetas', dropId: 'drop-10', price: 549, siteSale: false,
        description: 'Exemplo de produto de drop passado que não foi liberado para venda no site.',
        garment: 'jacket', print: 'logo', sizes: TOPS, stock: { preto: [2, 2, 2, 2, 2] },
        images: [{ type: 'svg', view: 'front' }] }),

    // ---------- Rascunho: nunca aparece ----------
    p({ id: 'vt-13-99', slug: 'camiseta-rascunho', name: 'Camiseta Rascunho', category: 'camisetas', dropId: 'drop-13', price: 159, status: 'draft',
        description: 'Exemplo de produto em rascunho.',
        garment: 'tee', print: 'logo', sizes: TOPS, stock: { preto: [5, 5, 5, 5, 5] },
        images: [{ type: 'svg', view: 'front' }] }),

    // ---------- Drop 14 · Portal (futuro): fora do shop até o lançamento ----------
    // teaser: true mostra a peça como coming soon até o drop abrir. Sem teaser, fica escondida.
    // Lança no Drop 14, só no app. No shop fica só como coming soon, sem compra.
    p({ id: 'vt-13-01', slug: 'camiseta-caveira-rachada', name: 'Camiseta Caveira Rachada', category: 'camisetas', dropId: 'drop-14', price: 189, teaser: true,
        description: 'Camiseta oversized de algodão pesado com caveira e VULTO em tinta branca com acabamento rachado.',
        garment: 'tee', print: 'skull', fit: 'oversized', sizes: TOPS, stock: { preto: [3, 8, 0, 5, 2] },
        images: [
          { type: 'photo', src: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3Kb3YKeSIaGwJYI6odUy0XejCWs/4288853e-889e-48de-98ce-f358b5617828.jpg', alt: 'Camiseta Caveira Rachada preta, vista de frente, sob um viaduto de concreto' },
          { type: 'photo', src: 'https://d2ol7oe51mr4n9.cloudfront.net/user_3Kb3YKeSIaGwJYI6odUy0XejCWs/e3e4fa63-d79f-4d6f-9ee1-b9050090808e.jpg', alt: 'Camiseta Caveira Rachada preta, enquadramento aberto no concreto' }
        ] }),
    p({ id: 'vt-14-01', slug: 'camiseta-portal', name: 'Camiseta Portal', category: 'camisetas', dropId: 'drop-14', price: 189,
        description: 'Camiseta de algodão com o anel de tinta na frente.',
        garment: 'tee', print: 'ring', sizes: TOPS, stock: { preto: [10, 10, 10, 10, 10] },
        images: [{ type: 'svg', view: 'front' }, { type: 'svg', view: 'detail' }] }),
    p({ id: 'vt-14-02', slug: 'moletom-portal', name: 'Moletom Portal', category: 'moletons', dropId: 'drop-14', price: 449,
        description: 'Moletom de capuz com caveira em tinta branca.',
        garment: 'hoodie', print: 'skull', sizes: TOPS, stock: { preto: [6, 6, 6, 6, 6] },
        images: [{ type: 'svg', view: 'front' }, { type: 'svg', view: 'back' }] })
  ];

  // Guia de medidas de referência (dados demonstrativos), em centímetros.
  const sizeGuides = {
    tee:    { cols: ['Tamanho', 'Largura', 'Comprimento', 'Manga'], rows: [['P', 56, 70, 22], ['M', 59, 72, 23], ['G', 62, 74, 24], ['GG', 65, 76, 25], ['XG', 68, 78, 26]] },
    hoodie: { cols: ['Tamanho', 'Largura', 'Comprimento', 'Manga'], rows: [['P', 60, 68, 60], ['M', 63, 70, 61], ['G', 66, 72, 62], ['GG', 69, 74, 63], ['XG', 72, 76, 64]] },
    jacket: { cols: ['Tamanho', 'Largura', 'Comprimento', 'Manga'], rows: [['P', 62, 68, 62], ['M', 65, 70, 63], ['G', 68, 72, 64], ['GG', 71, 74, 65], ['XG', 74, 76, 66]] },
    pants:  { cols: ['Tamanho', 'Cintura', 'Quadril', 'Comprimento'], rows: [['38', 38, 50, 104], ['40', 40, 52, 105], ['42', 42, 54, 106], ['44', 44, 56, 107], ['46', 46, 58, 108]] },
    shorts: { cols: ['Tamanho', 'Cintura', 'Quadril', 'Comprimento'], rows: [['38', 38, 52, 50], ['40', 40, 54, 51], ['42', 42, 56, 52], ['44', 44, 58, 53], ['46', 46, 60, 54]] }
  };

  // Modelagens: o texto que aparece junto do tamanho e no guia de medidas.
  const fits = {
    oversized: { name: 'Oversized', note: 'Modelagem ampla, ombro caído. Consulte as medidas antes de escolher.' },
    boxy:      { name: 'Boxy',      note: 'Mais larga e mais curta que a regular. Confira o comprimento na tabela.' },
    regular:   { name: 'Regular',   note: 'Veste no seu tamanho de sempre.' },
    reto:      { name: 'Corte reto', note: 'Mesma largura do quadril à barra. Confira cintura e comprimento na tabela.' }
  };

  return { drops, categories, colors, products, sizeGuides, fits };
})();
