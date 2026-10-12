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
   ========================================================================= */
window.VULTO_DATA = (() => {
  // Drops abrem na quinta-feira, às 19h, horário de Brasília.
  const drops = [
    { id: 'drop-10', number: 10, name: 'Asfalto',  launchAt: '2026-07-02T19:00:00-03:00' },
    { id: 'drop-11', number: 11, name: 'Concreto', launchAt: '2026-08-06T19:00:00-03:00' },
    { id: 'drop-12', number: 12, name: 'Garoa',    launchAt: '2026-09-03T19:00:00-03:00' },
    { id: 'drop-13', number: 13, name: 'Tinta',    launchAt: '2026-10-01T19:00:00-03:00' },
    { id: 'drop-14', number: 14, name: 'Portal',   launchAt: '2026-10-29T19:00:00-03:00' } // futuro: não pode aparecer no shop antes da data
  ];

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
    p({ id: 'vt-13-01', slug: 'camiseta-caveira-rachada', name: 'Camiseta Caveira Rachada', category: 'camisetas', dropId: 'drop-13', price: 189,
        description: 'Camiseta oversized de algodão pesado com caveira e VULTO em tinta branca com acabamento rachado.',
        garment: 'tee', print: 'skull', sizes: TOPS, stock: { preto: [3, 8, 0, 5, 2] },
        images: [
          { type: 'photo', src: '/assets/peca-camiseta.jpg', alt: 'Camiseta Caveira Rachada preta, vista de frente, sob um viaduto de concreto' },
          { type: 'photo', src: '/assets/hero-poster.jpg', alt: 'Camiseta Caveira Rachada preta, enquadramento aberto no concreto' }
        ] }),
    p({ id: 'vt-13-02', slug: 'moletom-anel', name: 'Moletom Anel', category: 'moletons', dropId: 'drop-13', price: 429,
        description: 'Moletom de capuz em felpa pesada com anel de tinta branca nas costas.',
        garment: 'hoodie', print: 'ring', sizes: TOPS, stock: { preto: [2, 0, 4, 3, 1] },
        images: [
          { type: 'photo', src: '/assets/peca-moletom.jpg', alt: 'Moletom Anel preto, vista de costas com o anel de tinta branca' }
        ] }),
    p({ id: 'vt-13-03', slug: 'calca-jeans-concreto', name: 'Calça Jeans Concreto', category: 'calcas', dropId: 'drop-13', price: 349,
        description: 'Jeans de corte reto, lavagem clara e desgaste nos joelhos.',
        garment: 'pants', print: 'none', sizes: JEANS, stock: { azul: [1, 4, 6, 0, 2] },
        images: [
          { type: 'photo', src: '/assets/peca-jeans.jpg', alt: 'Calça Jeans Concreto de lavagem clara pendurada em frente a um pilar de concreto' }
        ] }),
    p({ id: 'vt-13-04', slug: 'camiseta-anel', name: 'Camiseta Anel', category: 'camisetas', dropId: 'drop-13', price: 169,
        description: 'Camiseta de algodão com o anel de tinta no peito.',
        garment: 'tee', print: 'ring', sizes: TOPS, stock: { preto: [4, 6, 6, 3, 0], osso: [0, 3, 5, 2, 1] },
        images: [{ type: 'svg', view: 'front' }, { type: 'svg', view: 'back' }, { type: 'svg', view: 'detail' }] }),
    p({ id: 'vt-13-05', slug: 'bone-vulto', name: 'Boné Vulto', category: 'bones', dropId: 'drop-13', price: 149,
        description: 'Boné de seis gomos com VULTO bordado na frente e regulagem atrás.',
        garment: 'cap', print: 'logo', sizes: UNICO, stock: { preto: [7] },
        images: [{ type: 'photo', color: 'preto', src: '/static/shop/fotos/bone-preto.jpg', alt: 'Boné Vulto preto lavado com VULTO bordado, sobre um case preto' }] }),

    // ---------- Drop 12 · Garoa ----------
    p({ id: 'vt-12-01', slug: 'corta-vento-garoa', name: 'Corta-vento Garoa', category: 'jaquetas', dropId: 'drop-12', price: 499,
        description: 'Corta-vento leve com zíper frontal e recorte no peito.',
        garment: 'jacket', print: 'cut', sizes: TOPS, stock: { preto: [0, 2, 1, 1, 0], grafite: [1, 3, 2, 0, 1] },
        images: [
          { type: 'photo', color: 'preto', src: '/static/shop/fotos/corta-vento-preto.jpg', alt: 'Corta-vento Garoa preto com zíper, vivo refletivo e VULTO no peito' },
          { type: 'photo', color: 'grafite', src: '/static/shop/fotos/corta-vento-grafite.jpg', alt: 'Corta-vento Garoa grafite com zíper, vivo refletivo e VULTO no peito' }
        ] }),
    p({ id: 'vt-12-02', slug: 'camiseta-logo-corte', name: 'Camiseta Logo Corte', category: 'camisetas', dropId: 'drop-12', price: 159,
        description: 'Camiseta de algodão com o logo VULTO grande na frente.',
        garment: 'tee', print: 'logo', sizes: TOPS, stock: { osso: [2, 5, 4, 2, 1] },
        images: [
          { type: 'photo', color: 'osso', src: '/static/shop/fotos/camiseta-logo-osso.jpg', alt: 'Camiseta Logo Corte osso com VULTO preto na frente' },
          { type: 'photo', color: 'osso', src: '/static/shop/fotos/camiseta-logo-osso-dobrada.jpg', alt: 'Camiseta Logo Corte osso apoiada sobre um case' }
        ] }),
    p({ id: 'vt-12-03', slug: 'bermuda-cargo', name: 'Bermuda Cargo', category: 'bermudas', dropId: 'drop-12', price: 259,
        description: 'Bermuda de sarja com bolsos cargo laterais.',
        garment: 'shorts', print: 'none', sizes: JEANS, stock: { preto: [2, 3, 3, 1, 0], cinza: [0, 1, 2, 2, 1] },
        images: [{ type: 'svg', view: 'front' }, { type: 'svg', view: 'back' }] }),
    p({ id: 'vt-12-04', slug: 'gorro-vulto', name: 'Gorro Vulto', category: 'bones', dropId: 'drop-12', price: 119,
        description: 'Gorro de malha canelada com etiqueta VULTO na barra.',
        garment: 'beanie', print: 'logo', sizes: UNICO, stock: { preto: [0] },
        images: [{ type: 'photo', color: 'preto', src: '/static/shop/fotos/gorro-preto.jpg', alt: 'Gorro Vulto preto canelado com etiqueta VULTO' }] }),

    // ---------- Drop 11 · Concreto ----------
    p({ id: 'vt-11-01', slug: 'moletom-logo', name: 'Moletom Logo', category: 'moletons', dropId: 'drop-11', price: 399,
        description: 'Moletom de capuz com o logo VULTO no peito.',
        garment: 'hoodie', print: 'logo', sizes: TOPS, stock: { mescla: [1, 2, 3, 2, 1] },
        images: [
          { type: 'photo', color: 'mescla', src: '/static/shop/fotos/moletom-logo-frente.jpg', alt: 'Moletom Logo cinza mescla, vista de frente com VULTO no peito' },
          { type: 'photo', color: 'mescla', src: '/static/shop/fotos/moletom-logo-costas.jpg', alt: 'Moletom Logo cinza mescla, vista de costas com VULTO grande' }
        ] }),
    p({ id: 'vt-11-02', slug: 'meia-vulto', name: 'Meia Vulto', category: 'acessorios', dropId: 'drop-11', price: 69,
        description: 'Meia cano alto de algodão com VULTO no cano.',
        garment: 'socks', print: 'logo', sizes: ['34 a 38', '39 a 44'], stock: { branco: [6, 9] },
        images: [{ type: 'photo', color: 'branco', src: '/static/shop/fotos/meia-branco.jpg', alt: 'Par de meias Vulto brancas de cano alto com VULTO no cano' }] }),
    p({ id: 'vt-11-03', slug: 'ecobag-concreto', name: 'Ecobag Concreto', category: 'acessorios', dropId: 'drop-11', price: 89,
        description: 'Ecobag de lona com o anel de tinta impresso.',
        garment: 'tote', print: 'ring', sizes: UNICO, stock: { cru: [12] },
        images: [{ type: 'photo', color: 'cru', src: '/static/shop/fotos/ecobag.jpg', alt: 'Ecobag Concreto de lona crua com o anel de tinta preto' }] }),
    p({ id: 'vt-11-04', slug: 'camiseta-minhocao', name: 'Camiseta Minhocão', category: 'camisetas', dropId: 'drop-11', price: 159,
        description: 'Camiseta de algodão com logo pequeno no peito e VULTO grande nas costas.',
        garment: 'tee', print: 'cut', sizes: TOPS, stock: { preto: [0, 0, 0, 0, 0] },
        images: [{ type: 'svg', view: 'front' }, { type: 'svg', view: 'back' }] }),

    // ---------- Drop 10 · Asfalto: venda do estoque remanescente desligada ----------
    p({ id: 'vt-10-01', slug: 'jaqueta-asfalto', name: 'Jaqueta Asfalto', category: 'jaquetas', dropId: 'drop-10', price: 549, siteSale: false,
        description: 'Exemplo de produto de drop passado que não foi liberado para venda no site.',
        garment: 'jacket', print: 'logo', sizes: TOPS, stock: { preto: [2, 2, 2, 2, 2] },
        images: [{ type: 'svg', view: 'front' }] }),

    // ---------- Rascunho: nunca aparece ----------
    p({ id: 'vt-13-99', slug: 'camiseta-rascunho', name: 'Camiseta Rascunho', category: 'camisetas', dropId: 'drop-13', price: 159, status: 'draft',
        description: 'Exemplo de produto em rascunho.',
        garment: 'tee', print: 'logo', sizes: TOPS, stock: { preto: [5, 5, 5, 5, 5] },
        images: [{ type: 'svg', view: 'front' }] }),

    // ---------- Drop 14 · Portal (futuro): cadastrado, mas fora do shop até o lançamento ----------
    p({ id: 'vt-14-01', slug: 'camiseta-portal', name: 'Camiseta Portal', category: 'camisetas', dropId: 'drop-14', price: 189,
        description: 'Produto de drop futuro. Só entra no shop depois do lançamento no app.',
        garment: 'tee', print: 'ring', sizes: TOPS, stock: { preto: [10, 10, 10, 10, 10] },
        images: [{ type: 'svg', view: 'front' }] }),
    p({ id: 'vt-14-02', slug: 'moletom-portal', name: 'Moletom Portal', category: 'moletons', dropId: 'drop-14', price: 449,
        description: 'Produto de drop futuro. Só entra no shop depois do lançamento no app.',
        garment: 'hoodie', print: 'skull', sizes: TOPS, stock: { preto: [6, 6, 6, 6, 6] },
        images: [{ type: 'svg', view: 'front' }] })
  ];

  // Guia de medidas de referência (dados demonstrativos), em centímetros.
  const sizeGuides = {
    tee:    { cols: ['Tamanho', 'Largura', 'Comprimento', 'Manga'], rows: [['P', 56, 70, 22], ['M', 59, 72, 23], ['G', 62, 74, 24], ['GG', 65, 76, 25], ['XG', 68, 78, 26]] },
    hoodie: { cols: ['Tamanho', 'Largura', 'Comprimento', 'Manga'], rows: [['P', 60, 68, 60], ['M', 63, 70, 61], ['G', 66, 72, 62], ['GG', 69, 74, 63], ['XG', 72, 76, 64]] },
    jacket: { cols: ['Tamanho', 'Largura', 'Comprimento', 'Manga'], rows: [['P', 62, 68, 62], ['M', 65, 70, 63], ['G', 68, 72, 64], ['GG', 71, 74, 65], ['XG', 74, 76, 66]] },
    pants:  { cols: ['Tamanho', 'Cintura', 'Quadril', 'Comprimento'], rows: [['38', 38, 50, 104], ['40', 40, 52, 105], ['42', 42, 54, 106], ['44', 44, 56, 107], ['46', 46, 58, 108]] },
    shorts: { cols: ['Tamanho', 'Cintura', 'Quadril', 'Comprimento'], rows: [['38', 38, 52, 50], ['40', 40, 54, 51], ['42', 42, 56, 52], ['44', 44, 58, 53], ['46', 46, 60, 54]] }
  };

  return { drops, categories, colors, products, sizeGuides };
})();
