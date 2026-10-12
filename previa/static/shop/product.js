/* VULTO SHOP · página de produto: galeria, zoom, variantes, estoque e carrinho. */
(() => {
  'use strict';
  const S = window.VultoShop;
  const { D, esc, money } = S;
  S.mountChrome('shop');

  const $ = id => document.getElementById(id);
  const root = $('s-pdp-root');
  const m = location.pathname.match(/\/shop\/([^/?#]+)\/?$/);
  let slug = m ? decodeURIComponent(m[1]) : '';
  if (!slug || slug === 'produto.html') slug = new URLSearchParams(location.search).get('slug') || '';
  const p = S.productBySlug(slug);

  /* Fora do shop (inexistente, rascunho, venda desligada ou drop que ainda não aconteceu):
     a página não revela nada sobre a peça. */
  if (!p) {
    document.title = 'Peça fora do shop · Vulto';
    root.innerHTML = `<section class="s-error"><p class="mono" style="color:var(--text-2)">Shop</p>
      <h1>Essa peça não está no shop.</h1>
      <p>Pode ser que ela tenha saído do catálogo ou que seja de um drop que ainda não aconteceu. Lançamento novo abre só no app, quinta às 19h.</p>
      <a class="s-btn ghost" href="/shop">Voltar para o shop</a> <a class="s-btn" href="/#entrar">Entrar na lista de espera</a></section>`;
    return;
  }

  document.title = `${p.name} · Shop · Vulto`;
  const meta = document.querySelector('meta[name="description"]'); if (meta) meta.content = `${p.name}. ${p.description}`;

  const state = {
    color: p.colors.find(c => p.variants.some(v => v.color === c && v.stock > 0)) || p.colors[0],
    size: null
  };
  if (p.sizes.length === 1) state.size = p.sizes[0];
  const guide = D.sizeGuides[p.garment];

  /* ---------- estrutura ---------- */
  root.innerHTML = `
    <nav class="s-crumbs mono" aria-label="Você está em"><a href="/shop">Shop</a><span aria-hidden="true">/</span><a href="/shop/category/${p.category}">${esc(p.categoryName)}</a><span aria-hidden="true">/</span><span aria-current="page" style="color:var(--text-2)">${esc(p.name)}</span></nav>
    <div class="s-pdp">
      <div>
        <div class="s-gallery" id="s-gallery" aria-label="Fotos de ${esc(p.name)}"></div>
        <div class="s-gnav" id="s-gnav" aria-hidden="true"></div>
      </div>
      <div class="s-buy">
        <p class="s-drop mono">${esc(S.dropLabel(p.drop))} · ${S.dateBR(p.releaseDate)}</p>
        <h1>${esc(p.name)}</h1>
        <span class="s-price">${money(p.price)}</span>
        <p class="s-desc">${esc(p.description)}</p>

        <div class="s-field" ${p.colors.length < 2 ? 'hidden' : ''}>
          <div class="s-field-h"><span class="mono" id="s-color-l">Cor</span><strong id="s-color-name"></strong></div>
          <div class="s-swatches" role="radiogroup" aria-labelledby="s-color-l" id="s-colors"></div>
        </div>
        <p class="s-note" ${p.colors.length > 1 ? 'hidden' : ''} style="margin-top:22px">Cor: ${esc(S.colorName(p.colors[0]))}</p>

        <div class="s-field">
          <div class="s-field-h"><span class="mono" id="s-size-l">Tamanho</span>${guide ? '<button class="s-link" type="button" id="s-open-guide">Guia de medidas</button>' : ''}</div>
          <div class="s-sizes" role="radiogroup" aria-labelledby="s-size-l" id="s-sizes"></div>
          <p class="s-stock" id="s-stock" aria-live="polite"></p>
        </div>

        <div class="s-add"><button class="s-btn" type="button" id="s-add"></button></div>
        <p class="s-note">Colocar no carrinho não reserva a peça. O estoque é conferido de novo no checkout.</p>

        <div class="s-acc">
          <details><summary>Entrega</summary><div class="in">
            <p>O valor e o prazo do frete aparecem no checkout quando a integração com a transportadora estiver ativa. Nesta demonstração, ela não está conectada.</p>
            <p>Em semana de drop sai muito pedido de uma vez, então o prazo de entrega pode ser maior que o normal.</p></div></details>
          <details><summary>Trocas e devoluções</summary><div class="in">
            <p>Compras feitas pela internet podem ser devolvidas em até 7 dias depois do recebimento, pelo direito de arrependimento do Código de Defesa do Consumidor.</p>
            <p>As regras de troca de tamanho ainda precisam ser definidas pela Vulto e entram aqui.</p></div></details>
          <details><summary>Detalhes</summary><div class="in">
            <p>${esc(p.categoryName)} · ${esc(S.dropLabel(p.drop))}</p>
            <p>Lançada no app em ${S.dateBR(p.releaseDate)}.</p></div></details>
        </div>
      </div>
    </div>
    <section class="s-related" id="s-related" hidden><h2>Do mesmo universo</h2><div class="s-grid" id="s-related-grid"></div></section>`;

  /* ---------- galeria ---------- */
  let images = [];
  function paintGallery() {
    images = S.productImages(p, state.color);
    $('s-gallery').innerHTML = images.map((im, i) =>
      `<button class="s-shot" type="button" data-i="${i}" aria-label="Ampliar foto ${i + 1} de ${images.length}: ${esc(im.alt)}">${
        im.kind === 'photo' ? `<img src="${esc(im.src)}" alt="" ${i ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async" width="1600" height="900">`
                            : im.html.replace('<svg class="g-svg"', '<svg class="g-svg" aria-hidden="true"').replace(/<title>.*?<\/title>/, '')}</button>`).join('');
    $('s-gnav').innerHTML = images.length > 1 ? images.map((_, i) => `<span class="${i ? '' : 'on'}"></span>`).join('') : '';
  }
  $('s-gallery').addEventListener('scroll', () => {
    const g = $('s-gallery'); const i = Math.round(g.scrollLeft / g.clientWidth);
    [...$('s-gnav').children].forEach((d, k) => d.classList.toggle('on', k === i));
  }, { passive: true });
  $('s-gallery').addEventListener('click', e => { const b = e.target.closest('.s-shot'); if (b) openZoom(Number(b.dataset.i)); });

  /* ---------- zoom ---------- */
  const zoom = $('s-zoom'), stage = $('s-zoom-stage');
  let zi = 0;
  function paintZoom() {
    const im = images[zi];
    stage.classList.remove('z');
    stage.innerHTML = im.kind === 'photo' ? `<img src="${esc(im.src)}" alt="${esc(im.alt)}">` : im.html;
    $('s-zoom-count').textContent = `${zi + 1} / ${images.length}`;
    $('s-zoom-prev').hidden = $('s-zoom-next').hidden = images.length < 2;
  }
  function openZoom(i) { zi = i; paintZoom(); zoom.showModal(); stage.focus(); }
  const step = d => { zi = (zi + d + images.length) % images.length; paintZoom(); };
  $('s-zoom-prev').addEventListener('click', () => step(-1));
  $('s-zoom-next').addEventListener('click', () => step(1));
  zoom.addEventListener('click', e => { if (e.target.closest('[data-close]')) zoom.close(); });
  zoom.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') step(-1); if (e.key === 'ArrowRight') step(1); });
  const setOrigin = e => { const r = stage.getBoundingClientRect(); stage.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100) + '%'); stage.style.setProperty('--oy', ((e.clientY - r.top) / r.height * 100) + '%'); };
  stage.addEventListener('click', e => { setOrigin(e); stage.classList.toggle('z'); });
  stage.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stage.classList.toggle('z'); } });
  stage.addEventListener('pointermove', e => { if (stage.classList.contains('z')) setOrigin(e); });

  /* ---------- variantes ---------- */
  function stockOf(size) { const v = S.variantOf(p, state.color, size); return v ? v.stock : 0; }
  function paintColors() {
    $('s-colors').innerHTML = p.colors.map(c => {
      const has = p.variants.some(v => v.color === c && v.stock > 0);
      return `<button class="s-sw" type="button" role="radio" aria-checked="${c === state.color}" data-c="${c}" style="--c:${S.colorHex(c)}" aria-label="${esc(S.colorName(c))}${has ? '' : ', esgotada'}" tabindex="${c === state.color ? 0 : -1}"></button>`;
    }).join('');
    $('s-color-name').textContent = S.colorName(state.color);
  }
  function paintSizes() {
    $('s-sizes').innerHTML = p.sizes.map(s => {
      const out = stockOf(s) <= 0;
      const on = s === state.size;
      return `<button class="s-size" type="button" role="radio" aria-checked="${on}" aria-disabled="${out}" data-s="${esc(s)}" tabindex="${on || (!state.size && s === p.sizes[0]) ? 0 : -1}" aria-label="${esc(s)}${out ? ', esgotado' : ''}">${esc(s)}</button>`;
    }).join('');
  }
  function paintStock(msg, err) {
    const el = $('s-stock'); const btn = $('s-add');
    el.classList.toggle('err', !!err);
    if (p.soldOut) { el.textContent = 'Esta peça esgotou e não pode ser comprada.'; btn.textContent = 'Sold out'; btn.disabled = true; return; }
    if (msg) { el.textContent = msg; }
    else if (!state.size) el.textContent = '';
    else el.textContent = stockOf(state.size) > 0 ? `${S.colorName(state.color)}, tamanho ${state.size}: disponível` : `${S.colorName(state.color)}, tamanho ${state.size}: esgotado`;
    const ok = state.size && stockOf(state.size) > 0;
    btn.disabled = false; btn.setAttribute('aria-disabled', String(!ok));
    btn.textContent = ok ? `Adicionar ao carrinho · ${money(p.price)}` : state.size ? 'Esgotado neste tamanho' : 'Escolha um tamanho';
  }
  function repaint() { paintColors(); paintSizes(); paintStock(); }

  function radioKeys(container, sel, pick) {
    container.addEventListener('keydown', e => {
      if (!['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      const items = [...container.querySelectorAll(sel)];
      const i = items.indexOf(document.activeElement); if (i < 0) return;
      e.preventDefault();
      const next = items[(i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
      pick(next); container.querySelector(`[data-${next.dataset.c ? 'c' : 's'}="${CSS.escape(next.dataset.c || next.dataset.s)}"]`)?.focus();
    });
  }
  const pickColor = b => { state.color = b.dataset.c; if (state.size && p.sizes.length > 1 && stockOf(state.size) <= 0) state.size = null; paintGallery(); repaint(); };
  const pickSize = b => {
    if (b.getAttribute('aria-disabled') === 'true') { paintStock(`Tamanho ${b.dataset.s} esgotado nesta cor.`, true); return; }
    state.size = b.dataset.s; paintSizes(); paintStock();
  };
  $('s-colors').addEventListener('click', e => { const b = e.target.closest('.s-sw'); if (b) pickColor(b); });
  $('s-sizes').addEventListener('click', e => { const b = e.target.closest('.s-size'); if (b) pickSize(b); });
  radioKeys($('s-colors'), '.s-sw', pickColor);
  radioKeys($('s-sizes'), '.s-size', b => { if (b.getAttribute('aria-disabled') !== 'true') pickSize(b); });

  /* ---------- carrinho ---------- */
  const mini = $('s-mini');
  mini.addEventListener('click', e => { if (e.target === mini || e.target.closest('[data-close]')) mini.close(); });
  $('s-add').addEventListener('click', () => {
    if (p.soldOut) return;
    if (!state.size) { paintStock('Escolha um tamanho antes de adicionar.', true); $('s-sizes').querySelector('.s-size:not([aria-disabled="true"])')?.focus(); return; }
    if (stockOf(state.size) <= 0) { paintStock('Esse tamanho está esgotado. Escolha outro.', true); return; }
    const r = S.cart.add(p.id, state.color, state.size, 1);
    if (!r.ok) { paintStock(r.reason, true); return; }
    const btn = $('s-add');
    btn.textContent = 'Adicionado ✓';
    setTimeout(() => paintStock(), 1600);
    S.announce(`${p.name}, ${S.colorName(state.color)}, tamanho ${state.size}, adicionado ao carrinho.`);
    const im = images[0];
    $('s-mini-body').innerHTML = `<div class="s-line" style="grid-template-columns:84px 1fr"><div class="s-thumb">${im.kind === 'photo' ? `<img src="${esc(im.src)}" alt="">` : im.html.replace('<svg class="g-svg"', '<svg class="g-svg" aria-hidden="true"')}</div>
      <div><h3>${esc(p.name)}</h3><p>${esc(S.colorName(state.color))} · ${esc(state.size)}</p><p class="s-price" style="margin-top:8px">${money(p.price)}</p></div></div>
      <div class="s-row" style="margin-top:10px"><span>Itens no carrinho</span><span>${S.cart.count()}</span></div>
      <div class="s-row"><span>Subtotal</span><span>${money(S.cart.subtotal())}</span></div>`;
    mini.showModal();
  });

  /* ---------- guia de medidas ---------- */
  if (guide) {
    $('s-guide-body').innerHTML = `<table class="s-table"><thead><tr>${guide.cols.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${guide.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c} cm</td>` : `<th scope="row">${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table>
      <p class="s-note" style="margin-top:14px">Medidas da peça estendida, de referência. Dados demonstrativos.</p>`;
    $('s-open-guide').addEventListener('click', () => $('s-guide').showModal());
    $('s-guide').addEventListener('click', e => { if (e.target === $('s-guide') || e.target.closest('[data-close]')) $('s-guide').close(); });
  }

  /* ---------- relacionados ---------- */
  const others = S.listedProducts().filter(x => x.id !== p.id);
  const related = [...others.filter(x => x.category === p.category), ...others.filter(x => x.category !== p.category && x.dropId === p.dropId), ...others]
    .filter((x, i, a) => a.findIndex(y => y.id === x.id) === i).sort((a, b) => a.soldOut - b.soldOut).slice(0, 4);
  if (related.length) { $('s-related-grid').innerHTML = related.map(x => S.card(x, 'h3')).join(''); $('s-related').hidden = false; }

  paintGallery(); repaint();
})();
