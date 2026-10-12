/* =========================================================================
   VULTO SHOP · NÚCLEO
   Regras de visibilidade, carrinho, formatação, cabeçalho e ilustrações.
   Nada aqui é carregado pela Home.
   ========================================================================= */
(() => {
  'use strict';
  const D = window.VULTO_DATA;
  const V = window.VULTO;

  /* ---------- configuração comercial ----------
     A venda do estoque remanescente pelo site é uma proposta deste projeto.
     Desligue remainingStockOnSite para tirar do shop tudo que veio de drop;
     cada produto ainda precisa de siteSale: true para aparecer. */
  const CONFIG = {
    remainingStockOnSite: true, // liga ou desliga a venda pós-drop no site
    showSoldOut: true,          // mostra peças esgotadas como SOLD OUT (sem compra)
    lowStock: 3,                // "Últimas unidades" só abaixo disso, contado no estoque real
    cartKey: 'vulto-cart-v1',
    savedKey: 'vulto-saved-v1',
    viewedKey: 'vulto-viewed-v1'
  };

  /* Pontos de integração. Hoje nada está conectado: cada função responde que o serviço não existe. */
  const INTEGRATIONS = {
    quoteShipping: async (/* cep, linhas */) => ({ available: false }),
    createPayment: async (/* pedido, método */) => ({ available: false }),
    reserveStock: async (/* linhas */) => ({ available: false })
  };

  /* Agora. Para testar a regra dos drops: ?simular-data=2026-10-30T20:00 (ver vulto.js) */
  const now = V.now;

  const dropById = Object.fromEntries(D.drops.map(d => [d.id, d]));
  const catById = Object.fromEntries(D.categories.map(c => [c.id, c]));

  const totalStock = p => p.variants.reduce((s, v) => s + Math.max(0, v.stock), 0);
  const isSoldOut = p => totalStock(p) === 0;
  const colorsOf = p => [...new Set(p.variants.map(v => v.color))];
  const sizesOf = p => p.sizes;
  const variantOf = (p, color, size) => p.variants.find(v => v.color === color && v.size === size) || null;
  const releaseAt = p => Date.parse(dropById[p.dropId].launchAt);

  /* A regra de visibilidade fica nos dados: só sai daqui o que pode ser vendido ou exibido. */
  function isListed(p, t = now()) {
    const drop = dropById[p.dropId];
    if (!drop) return false;
    if (p.status !== 'published') return false;
    if (Date.parse(drop.launchAt) > t) return false;           // drop ainda não aconteceu: só no app, no dia
    if (!CONFIG.remainingStockOnSite || !p.siteSale) return false;
    if (isSoldOut(p) && !CONFIG.showSoldOut) return false;
    return true;
  }
  const isPurchasable = (p, t = now()) => isListed(p, t) && !isSoldOut(p);
  /* Teaser: peça marcada teaser, de drop confirmado, na semana antes do lançamento. Aparece como
     "app exclusive", sem preço de compra no site e fora do carrinho. */
  const isTeaser = (p, t = now()) => p.status === 'published' && !!p.teaser && V.inTeaser(dropById[p.dropId], t);
  const listedProducts = () => D.products.filter(p => isListed(p)).map(enrich);
  const teaserProducts = () => D.products.filter(p => isTeaser(p)).map(enrich);
  const productBySlug = slug => { const p = D.products.find(x => x.slug === slug); return p && (isListed(p) || isTeaser(p)) ? enrich(p) : null; };
  const productById = id => { const p = D.products.find(x => x.id === id); return p && isListed(p) ? enrich(p) : null; };
  const visibleById = id => { const p = D.products.find(x => x.id === id); return p && (isListed(p) || isTeaser(p)) ? enrich(p) : null; };

  /* Um drop esgotou quando todas as peças dele no shop esgotaram. */
  const dropSoldOut = dropId => { const ps = D.products.filter(p => p.dropId === dropId && isListed(p)); return ps.length > 0 && ps.every(isSoldOut); };

  function enrich(p) {
    const drop = dropById[p.dropId];
    const stock = totalStock(p);
    const sizesIn = p.sizes.filter(s => p.variants.some(v => v.size === s && v.stock > 0));
    const comingSoon = !isListed(p) && isTeaser(p);
    return { ...p, drop, releaseDate: drop.launchAt, categoryName: catById[p.category]?.name || p.category,
      soldOut: isSoldOut(p), colors: colorsOf(p), comingSoon, stock, sizesIn,
      lowStock: !comingSoon && stock > 0 && stock <= CONFIG.lowStock,
      lastSize: !comingSoon && p.sizes.length > 1 && sizesIn.length === 1 ? sizesIn[0] : null,
      dropSoldOut: dropSoldOut(p.dropId) };
  }

  /* Uma etiqueta por cartão, no máximo, sempre derivada de dado real. */
  const HIGHLIGHT = { 'mais-visto-do-drop': 'Mais visto do drop', 'em-alta': 'Em alta na comunidade', 'mais-salvo-semana': 'Mais salvo da semana' };
  function statusFlag(p) {
    if (p.comingSoon) return { cls: 'app', text: 'App exclusive' };
    if (p.soldOut) return { cls: 'out', text: p.dropSoldOut ? 'Drop esgotado' : 'Sold out' };
    if (p.lowStock) return { cls: 'last', text: 'Últimas unidades' };
    if (p.lastSize) return { cls: 'last', text: `Último tamanho: ${p.lastSize}` };
    if (HIGHLIGHT[p.highlight]) return { cls: '', text: HIGHLIGHT[p.highlight] };
    if (p.noRestock) return { cls: '', text: 'Não haverá restock' };
    return null;
  }

  /* ---------- formatação ---------- */
  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const money = v => brl.format(v);
  const dateBR = iso => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'America/Sao_Paulo' });
  const dropLabel = d => `Drop ${d.number} · ${d.name}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const colorName = id => D.colors[id]?.name || id;
  const colorHex = id => D.colors[id]?.hex || '#777';

  /* ---------- carrinho (estado local, validado contra o estoque) ---------- */
  const listeners = new Set();
  function readCart() {
    try { const raw = JSON.parse(localStorage.getItem(CONFIG.cartKey) || '[]'); return Array.isArray(raw) ? raw : []; }
    catch { return []; }
  }
  function writeCart(items) {
    try { localStorage.setItem(CONFIG.cartKey, JSON.stringify(items)); } catch { /* armazenamento indisponível: o carrinho vive só nesta página */ }
    memory = items;
    listeners.forEach(fn => fn());
  }
  let memory = readCart();

  /* Linhas resolvidas: produto, variante e o que ainda dá para comprar. */
  function cartLines() {
    return memory.map(it => {
      const p = productById(it.productId);
      const v = p ? variantOf(p, it.color, it.size) : null;
      const max = p && v && !p.soldOut ? v.stock : 0;
      const qty = Math.min(it.qty, max);
      return { ...it, product: p, variant: v, max, qty, unavailable: !p || !v || max === 0, reduced: it.qty > max && max > 0 };
    });
  }
  const cart = {
    lines: cartLines,
    count: () => cartLines().reduce((s, l) => s + (l.unavailable ? 0 : l.qty), 0),
    subtotal: () => cartLines().reduce((s, l) => s + (l.unavailable ? 0 : l.qty * l.product.price), 0),
    add(productId, color, size, qty = 1) {
      const p = productById(productId);
      if (!p || !isPurchasable(p)) return { ok: false, reason: 'Esta peça não está à venda.' };
      const v = variantOf(p, color, size);
      if (!v || v.stock <= 0) return { ok: false, reason: 'Este tamanho está esgotado.' };
      const items = readCart();
      const found = items.find(i => i.productId === productId && i.color === color && i.size === size);
      const current = found ? found.qty : 0;
      if (current + qty > v.stock) return { ok: false, reason: `Só há ${v.stock} ${v.stock === 1 ? 'unidade' : 'unidades'} deste tamanho, e ${current === 1 ? 'ela já está' : 'elas já estão'} no carrinho.` };
      if (found) found.qty += qty; else items.push({ productId, color, size, qty });
      writeCart(items);
      return { ok: true };
    },
    setQty(index, qty) {
      const items = readCart(); const l = cartLines()[index];
      if (!items[index] || !l) return;
      items[index].qty = Math.max(1, Math.min(qty, l.max || 1));
      writeCart(items);
    },
    remove(index) { const items = readCart(); items.splice(index, 1); writeCart(items); },
    /* Ajusta quantidades ao estoque e tira o que não está mais à venda. */
    normalize() {
      const lines = cartLines();
      const items = lines.filter(l => !l.unavailable).map(l => ({ productId: l.productId, color: l.color, size: l.size, qty: l.qty }));
      if (JSON.stringify(items) !== JSON.stringify(readCart())) writeCart(items);
    },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  };
  addEventListener('storage', e => { if (e.key === CONFIG.cartKey) { memory = readCart(); listeners.forEach(fn => fn()); } });

  /* ---------- salvos e vistos recentemente (só neste aparelho) ---------- */
  const lists = {};
  function readList(k) {
    try { const v = JSON.parse(localStorage.getItem(k) || 'null'); if (Array.isArray(v)) return v; } catch { /* armazenamento indisponível */ }
    return lists[k] || [];
  }
  function writeList(k, v) { lists[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* vale só nesta página */ } }
  const saved = {
    has: id => readList(CONFIG.savedKey).includes(id),
    count: () => saved.products().length,
    toggle(id) {
      const l = readList(CONFIG.savedKey); const i = l.indexOf(id);
      if (i >= 0) l.splice(i, 1); else l.unshift(id);
      writeList(CONFIG.savedKey, l); paintSaved();
      return i < 0;
    },
    products: () => readList(CONFIG.savedKey).map(visibleById).filter(Boolean)
  };
  const viewed = {
    add(id) { writeList(CONFIG.viewedKey, [id, ...readList(CONFIG.viewedKey).filter(x => x !== id)].slice(0, 12)); },
    products: (except) => readList(CONFIG.viewedKey).filter(id => id !== except).map(visibleById).filter(Boolean)
  };
  const BOOKMARK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11v17l-5.5-4.2-5.5 4.2z"/></svg>';
  const saveButton = (p, cls = 's-save') =>
    `<button class="${cls}" type="button" data-save="${p.id}" aria-pressed="${saved.has(p.id)}" aria-label="Salvar ${esc(p.name)}">${BOOKMARK}<span>Salvar</span></button>`;
  function paintSaved() {
    document.querySelectorAll('[data-save]').forEach(b => b.setAttribute('aria-pressed', String(saved.has(b.dataset.save))));
    const n = saved.count();
    document.querySelectorAll('[data-saved-count]').forEach(el => { el.textContent = n ? ` (${n})` : ''; });
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-save]'); if (!b) return;
    e.preventDefault();
    const p = visibleById(b.dataset.save); if (!p) return;
    const on = saved.toggle(p.id);
    announce(on ? `${p.name} salvo. Seus salvos ficam em Shop, Salvos.` : `${p.name} saiu dos salvos.`);
  });
  addEventListener('storage', e => { if (e.key === CONFIG.savedKey) paintSaved(); });

  /* ---------- ilustrações temporárias das peças (substituir por fotos) ---------- */
  let svgSeq = 0;
  function lum(hex) { const n = parseInt(hex.slice(1), 16); const r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255; return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; }

  function printArt(kind, ink, cx, cy, s, fid) {
    if (kind === 'logo') return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Dela Gothic One, Impact, sans-serif" font-size="${34 * s}" fill="${ink}" letter-spacing="${1 * s}">VULTO</text>`;
    if (kind === 'ring') return `<circle cx="${cx}" cy="${cy}" r="${36 * s}" fill="none" stroke="${ink}" stroke-width="${8 * s}" stroke-dasharray="${200 * s} ${8 * s} ${18 * s} ${6 * s}" filter="url(#r${fid})"/>`;
    if (kind === 'cut') return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-family="Dela Gothic One, Impact, sans-serif" font-size="${14 * s}" fill="${ink}">VULTO</text>`;
    if (kind === 'skull') return `<g filter="url(#r${fid})" fill="${ink}" transform="translate(${cx} ${cy}) scale(${s})">
        <text x="0" y="-62" text-anchor="middle" font-family="Dela Gothic One, Impact, sans-serif" font-size="30">VULTO</text>
        <path d="M0-44c-30 0-48 20-48 46 0 16 8 26 16 31v15c0 5 4 9 9 9h46c5 0 9-4 9-9V33c8-5 16-15 16-31 0-26-18-46-48-46z"/>
        <g fill="#000" opacity=".78"><ellipse cx="-17" cy="4" rx="12" ry="13"/><ellipse cx="17" cy="4" rx="12" ry="13"/><path d="M0 18l-6 12h12z"/><rect x="-15" y="40" width="4" height="10"/><rect x="-5" y="40" width="4" height="10"/><rect x="5" y="40" width="4" height="10"/></g></g>`;
    return '';
  }

  /* view: front | back | detail. Devolve um SVG inline (usa as fontes da página). */
  function renderGarment(p, colorId, view = 'front', label = '') {
    const id = ++svgSeq;
    const fill = colorHex(colorId);
    const dark = lum(fill) < 0.45;
    const line = dark ? 'rgba(255,255,255,.24)' : 'rgba(0,0,0,.22)';
    const fold = dark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.09)';
    const ink = dark ? '#ece8dc' : '#151514';
    const shade = dark ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.12)';
    const pr = p.print;
    const defs = `<defs><filter id="r${id}" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${id % 9}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3"/></filter>
      <filter id="g${id}"><feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" result="t"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".06"/></feComponentTransfer><feComposite in2="SourceGraphic" operator="in"/></filter></defs>`;
    const S = (body, extra = '') => `<g stroke="${line}" stroke-width="1.5" stroke-linejoin="round">${body}</g>${extra}`;
    let g = '';
    const backPrint = view === 'back';
    if (view === 'detail') {
      const art = pr === 'none' ? printArt('cut', ink, 200, 250, 4, id) : printArt(pr === 'cut' ? 'logo' : pr, ink, 200, pr === 'skull' ? 270 : 250, pr === 'skull' ? 2.6 : 2.4, id);
      g = `<rect width="400" height="500" fill="${fill}"/><rect width="400" height="500" fill="${fill}" filter="url(#g${id})"/>
        <path d="M0 120c120 30 260-20 400 10M0 380c140-30 250 25 400-5" stroke="${fold}" stroke-width="18" fill="none"/>${art}`;
    } else if (p.garment === 'tee') {
      const neck = backPrint ? 'M164 84c14 6 58 6 72 0' : 'M164 84c14 24 58 24 72 0';
      g = S(`<path d="M118 104l46-20c14 14 58 14 72 0l46 20 64 64-36 42-22-16v222H112V194l-22 16-36-42z" fill="${fill}"/>
          <path d="${neck}" fill="${shade}"/><path d="M90 210l-36-42M310 210l36-42M112 404h176" fill="none"/>`,
          `<path d="M120 196c18 6 30 4 40 0M280 196c-18 6-30 4-40 0M150 380c20-10 40-12 60-6" stroke="${fold}" stroke-width="5" stroke-linecap="round" fill="none"/>` +
          (backPrint ? (pr === 'cut' ? printArt('logo', ink, 200, 205, 1.6, id) : pr === 'ring' ? printArt('ring', ink, 200, 140, .45, id) : printArt('cut', ink, 200, 130, 1, id))
                     : pr === 'skull' ? printArt('skull', ink, 200, 262, 1.1, id) : pr === 'ring' ? printArt('ring', ink, 200, 220, 1.05, id)
                     : pr === 'logo' ? printArt('logo', ink, 200, 222, 1.25, id) : pr === 'cut' ? printArt('cut', ink, 248, 156, 1, id) : ''));
    } else if (p.garment === 'hoodie' || p.garment === 'jacket') {
      const hood = p.garment === 'hoodie' || !backPrint;
      g = S(`${hood ? `<path d="M150 142c-12-50 10-92 50-92s62 42 50 92z" fill="${fill}"/>` : ''}
          <path d="M120 140h160l25 10 35 230-32 8-26-138v180H118V250L92 388l-32-8 35-230z" fill="${fill}"/>
          ${!backPrint && p.garment === 'hoodie' ? `<path d="M168 142c-2-40 12-62 32-62s34 22 32 62z" fill="${shade}"/><path d="M186 146v58M214 146v58" stroke="${ink}" stroke-width="3"/><path d="M150 330h100l15 65H135z" fill="none"/>` : ''}
          ${!backPrint && p.garment === 'jacket' ? `<path d="M200 140v290" stroke="${ink}" stroke-opacity=".5" stroke-width="3"/><path d="M118 215h164" fill="none"/><path d="M168 132l32 20 32-20" fill="none"/>` : ''}
          <path d="M118 415h164M60 380l32 8M308 388l32-8" fill="none"/>`,
          `<path d="M120 260c14 6 24 4 32-2M280 260c-14 6-24 4-32-2" stroke="${fold}" stroke-width="5" stroke-linecap="round" fill="none"/>` +
          (backPrint ? (pr === 'ring' || pr === 'skull' ? printArt('ring', ink, 200, 250, 1.4, id) : printArt('logo', ink, 200, 230, 1.7, id))
                     : pr === 'logo' ? printArt('logo', ink, 200, 230, 1.15, id) : pr === 'skull' ? printArt('skull', ink, 200, 255, .9, id) : pr === 'cut' ? printArt('cut', ink, 245, 185, 1, id) : printArt('cut', ink, 200, 230, .9, id)));
    } else if (p.garment === 'pants' || p.garment === 'shorts') {
      const sh = p.garment === 'shorts';
      const legs = sh ? 'M125 110h150l17 220h-80l-12-130-12 130h-80z' : 'M130 80h140l15 380h-70l-15-290-15 290h-70z';
      const band = sh ? '<rect x="125" y="96" width="150" height="16"/>' : '<rect x="130" y="62" width="140" height="18"/>';
      g = S(`<path d="${legs}" fill="${fill}"/><g fill="${fill}">${band}</g>
          ${backPrint ? `<path d="${sh ? 'M140 140h44v40h-44zM216 140h44v40h-44z' : 'M146 110h44v44h-44zM210 110h44v44h-44z'}" fill="none"/>`
                      : `<path d="${sh ? 'M135 116c20 0 30 18 32 34M265 116c-20 0-30 18-32 34' : 'M140 82c18 0 28 18 30 36M260 82c-18 0-28 18-30 36'}" fill="none"/><path d="M200 ${sh ? 112 : 82}v${sh ? 70 : 80}" fill="none"/>`}
          ${sh ? '<path d="M108 220h40v60h-40zM252 220h40v60h-40z" fill="none"/>' : ''}`,
          p.category === 'calcas' && !backPrint ? `<g fill="${dark ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.35)'}"><ellipse cx="160" cy="300" rx="14" ry="9"/><ellipse cx="240" cy="306" rx="14" ry="9"/></g>` : '');
    } else if (p.garment === 'cap') {
      g = S(`<path d="M108 270c0-118 184-118 184 0z" fill="${fill}"/><path d="M96 272c50 40 158 40 208 0-46 18-162 18-208 0z" fill="${fill}"/><path d="M96 272c50 40 158 40 208 0" fill="none"/>
          <path d="M200 160v110M150 175c8 30 10 60 12 95M250 175c-8 30-10 60-12 95" fill="none"/><circle cx="200" cy="158" r="6" fill="${fill}"/>`,
          printArt('logo', ink, 200, 236, .62, id));
    } else if (p.garment === 'beanie') {
      g = S(`<path d="M122 300c0-150 156-150 156 0z" fill="${fill}"/><rect x="114" y="290" width="172" height="76" rx="6" fill="${fill}"/>
          ${Array.from({ length: 14 }, (_, i) => `<path d="M${124 + i * 12} 296v64" stroke="${fold}" stroke-width="3"/>`).join('')}`,
          `<rect x="168" y="312" width="64" height="26" fill="${ink}"/><text x="200" y="326" text-anchor="middle" dominant-baseline="middle" font-family="Dela Gothic One, Impact, sans-serif" font-size="12" fill="${fill}">VULTO</text>`);
    } else if (p.garment === 'socks') {
      const sock = (dx) => `<path transform="translate(${dx} 0)" d="M150 70h62v230c0 30 40 40 50 70 8 30-22 50-52 40l-62-22c-20-8-12-48-2-70z" fill="${fill}"/>
          <path transform="translate(${dx} 0)" d="M150 90h62M150 100h62M150 110h62" fill="none"/>`;
      g = S(sock(-40) + sock(50), `<text transform="translate(${-40 + 181} 200) rotate(-90)" text-anchor="middle" dominant-baseline="middle" font-family="Dela Gothic One, Impact, sans-serif" font-size="20" fill="${ink}">VULTO</text>
          <text transform="translate(${50 + 181} 200) rotate(-90)" text-anchor="middle" dominant-baseline="middle" font-family="Dela Gothic One, Impact, sans-serif" font-size="20" fill="${ink}">VULTO</text>`);
    } else if (p.garment === 'tote') {
      g = S(`<path d="M150 172c0-92 100-92 100 0" fill="none" stroke="${fill}" stroke-width="12"/><path d="M110 170h180l12 280H98z" fill="${fill}"/>`,
          printArt(pr === 'ring' ? 'ring' : 'logo', ink, 200, 310, 1.3, id));
    }
    const title = label ? `<title>${esc(label)}</title>` : '';
    return `<svg class="g-svg" viewBox="0 0 400 500" role="img" aria-label="${esc(label || p.name)}" preserveAspectRatio="xMidYMid meet">${title}${defs}${g}</svg>`;
  }

  /* Imagens do produto para uma cor: fotos (quando existem e a cor bate) e ilustrações. */
  function productImages(p, colorId) {
    const c = colorId || p.colors[0];
    // fotos marcadas com uma cor só aparecem quando essa cor está escolhida
    const list = p.images.filter(im => im.type !== 'photo' || !im.color || im.color === c);
    return (list.length ? list : p.images).map((im, i) => {
      if (im.type === 'photo') return { kind: 'photo', src: im.src, alt: im.alt || p.name };
      const view = im.view || 'front';
      const alt = im.alt || `${p.name}, ${colorName(c).toLowerCase()}, ${view === 'back' ? 'vista de costas' : view === 'detail' ? 'detalhe' : 'vista de frente'} (ilustração temporária)`;
      return { kind: 'svg', html: renderGarment(p, c, view, alt), alt };
    });
  }
  const imageHTML = (im, opts = '') => im.kind === 'photo'
    ? `<img src="${esc(im.src)}" alt="${esc(im.alt)}" loading="lazy" decoding="async" width="1600" height="900" ${opts}>`
    : im.html;

  /* ---------- cartão de produto (catálogo e relacionados) ---------- */
  function card(p, h = 'h2') {
    const firstColor = p.colors.find(c => p.variants.some(v => v.color === c && v.stock > 0)) || p.colors[0];
    const imgs = productImages(p, firstColor);
    const main = imgs[0], alt = imgs[1];
    const tag = (im, cls) => im.kind === 'photo'
      ? `<img class="${cls}" src="${esc(im.src)}" alt="" loading="lazy" decoding="async" width="1600" height="900">`
      : im.html.replace('<svg class="g-svg"', `<svg class="g-svg ${cls}" aria-hidden="true"`).replace(/<title>.*?<\/title>/, '');
    const dots = p.comingSoon ? `<span>Abre ${esc(V.dayMonth(p.drop))}, 19h, só no app</span>`
      : p.colors.length > 1
      ? `<span class="s-dots" aria-hidden="true">${p.colors.map(c => `<i class="s-dot" style="background:${colorHex(c)}"></i>`).join('')}</span><span>${p.colors.length} cores</span>`
      : `<span>${esc(colorName(p.colors[0]))}</span>`;
    const f = statusFlag(p);
    return `<div class="s-cell"><a class="s-card ${p.soldOut ? 'is-out' : ''}" href="/shop/${p.slug}">
      <div class="s-media">${f ? `<span class="s-flag ${f.cls}">${esc(f.text)}</span>` : ''}${tag(main, 'main' + (alt ? ' has-alt' : ''))}${alt ? tag(alt, 'alt') : ''}</div>
      <div class="s-info"><span class="s-dl">${esc(dropLabel(p.drop))}</span><${h}>${esc(p.name)}</${h}><span class="s-price">${money(p.price)}</span><span class="s-sub">${dots}</span></div>
    </a>${saveButton(p)}</div>`;
  }

  /* ---------- próximo drop, semana de drop e app ---------- */
  function nextDropHTML() {
    const next = V.nextDrop(), open = V.justOpened();
    const app = V.appButtons(next ? `drop/${next.id}` : '', 's-btn', 's-btn ghost');
    if (next) {
      return `<div class="s-next"><p class="mono s-next-k"><i aria-hidden="true"></i>Next drop · ${esc(dropLabel(next))}</p>
        <p class="s-next-when">${esc(V.whenLabel(next))}</p>${V.clockHTML(next)}
        <div class="s-next-row">${app || '<a class="s-btn" href="/#entrar">Ativar lembrete</a>'}<button class="s-link" type="button" data-ics="${next.id}">Adicionar à agenda</button></div>
        <p class="s-note">O drop acontece no app. As peças só chegam ao shop depois.</p></div>`;
    }
    if (open) {
      return `<div class="s-next"><p class="mono s-next-k"><i aria-hidden="true"></i>${esc(dropLabel(open))}</p>
        <p class="s-next-when">Aberto agora no app</p><div class="s-next-row">${app || '<a class="s-btn ghost" href="/#entrar">Entrar na lista</a>'}</div></div>`;
    }
    return `<div class="s-next is-quiet"><p class="mono s-next-k">Next drop</p><p class="s-next-when">Data a anunciar</p>
      <p class="s-note">Drops abrem às quintas, 19h, só no app.</p><div class="s-next-row"><a class="s-link" href="/#entrar">Ativar lembrete</a></div></div>`;
  }
  /* Aviso de prazo na semana depois de um drop (é quando as reclamações de entrega se concentram). */
  function dropWeekNote() {
    const d = V.dropWeek();
    return d ? `<p class="s-notice"><b>Semana de drop.</b> O ${esc(dropLabel(d))} abriu em ${dateBR(d.launchAt)}. Com muito pedido saindo de uma vez, o prazo de entrega pode ser maior que o normal.</p>` : '';
  }

  /* ---------- cabeçalho, rodapé e aviso ---------- */
  const LOGO = `<svg viewBox="0 0 566 120" aria-hidden="true" fill="currentColor"><path d="M0 0h36l26 74L88 0h36L80 120H44z"/><path d="M70 0h18l-14 22z" fill="var(--canvas)"/><path d="M134 0h34v68a24 24 0 0 0 48 0V0h34v70a58 58 0 0 1-116 0z"/><path d="M262 0h34v90h58v30h-92z"/><path d="M352 0h100v30h-33v90h-34V30h-33z"/><path d="M385 30h12l-12 18z" fill="var(--canvas)"/><path fill-rule="evenodd" d="M506 0a60 60 0 1 1 0 120a60 60 0 1 1 0-120zm0 32a28 28 0 1 0 0 56a28 28 0 1 0 0-56z"/></svg>`;
  function mountChrome(active) {
    const head = document.getElementById('shop-header');
    if (head) {
      head.innerHTML = `<a class="s-skip" href="#conteudo">Pular para o conteúdo</a>
        <div class="s-bar">
          <a class="s-logo" href="/" aria-label="Vulto, voltar para a Home">${LOGO}</a>
          <nav class="s-nav" aria-label="Principal">
            <a href="/">Drops</a>
            <a href="/shop" ${active === 'shop' ? 'aria-current="page"' : ''}>Shop</a>
          </nav>
          <a class="s-cartlink" href="/cart" ${active === 'cart' ? 'aria-current="page"' : ''}>Carrinho <span class="s-count" data-cart-count>0</span></a>
        </div>`;
    }
    const foot = document.getElementById('shop-footer');
    if (foot) {
      foot.innerHTML = `<div class="s-wrap s-foot">
          <a class="s-logo" href="/" aria-label="Vulto, voltar para a Home">${LOGO}</a>
          <p>O shop vende peças de drops que já aconteceram. Lançamento novo abre só no app, quinta às 19h.</p>
          <ul><li><a href="/shop">Shop</a></li><li><a href="/shop?salvos=1">Salvos<span data-saved-count></span></a></li><li><a href="/cart">Carrinho</a></li><li><a href="/#entrar">Lista de espera</a></li>${V.links.tracking ? `<li><a href="${esc(V.links.tracking)}" rel="noopener">Rastrear pedido</a></li>` : ''}${V.links.support ? `<li><a href="${esc(V.links.support)}" rel="noopener">Atendimento</a></li>` : ''}</ul>
        </div>
        <ul class="s-wrap s-trust" aria-label="Compra no site"><li>Pix, cartão ou boleto</li><li>Devolução em até 7 dias do recebimento</li><li>Estoque conferido antes de concluir</li><li>25 lojas físicas, 12 com ship from store</li></ul>
        <p class="s-wrap s-demo">Loja demonstrativa: produtos, preços e estoques são fictícios e nenhuma compra é processada.</p>`;
    }
    const paint = () => document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = cart.count(); });
    paint(); cart.subscribe(paint); paintSaved();
  }

  /* Aviso curto e acessível (região viva). */
  function announce(msg) {
    let el = document.getElementById('s-live');
    if (!el) { el = document.createElement('div'); el.id = 's-live'; el.className = 's-sr'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    el.textContent = ''; setTimeout(() => { el.textContent = msg; }, 30);
  }

  window.VultoShop = { CONFIG, D, V, INTEGRATIONS, now, isListed, isPurchasable, listedProducts, teaserProducts, productBySlug, productById, variantOf, totalStock,
    money, dateBR, dropLabel, esc, colorName, colorHex, cart, saved, viewed, saveButton, statusFlag, nextDropHTML, dropWeekNote,
    renderGarment, productImages, imageHTML, card, mountChrome, announce, catById, dropById };
})();
