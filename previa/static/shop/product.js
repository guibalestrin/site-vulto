/* VULTO SHOP · página de produto: galeria, zoom, variantes, estoque, carrinho,
   modelagem, prazo por CEP, história do drop e recomendações. */
(() => {
  'use strict';
  const S = window.VultoShop;
  const { D, V, esc, money } = S;
  S.mountChrome('shop');

  const $ = id => document.getElementById(id);
  const root = $('s-pdp-root');
  const m = location.pathname.match(/\/shop\/([^/?#]+)\/?$/);
  let slug = m ? decodeURIComponent(m[1]) : '';
  if (!slug || slug === 'produto.html') slug = new URLSearchParams(location.search).get('slug') || '';
  const p = S.productBySlug(slug);

  /* Fora do shop (inexistente, rascunho, venda desligada ou drop que ainda não aconteceu
     e não está em semana de teasers confirmada): a página não revela nada sobre a peça. */
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
  const fit = D.fits[p.fit];
  const soon = p.comingSoon;
  const dated = soon && V.isConfirmed(p.drop); // data e contagem só com drop confirmado

  /* ---------- status: disponibilidade real e canal de venda ---------- */
  const flag = S.statusFlag(p);
  const status = soon ? { chip: 'App exclusive', text: dated ? `Coming soon. Abre ${V.whenShort(p.drop)}, só no app.` : `Coming soon. Lança no ${S.dropLabel(p.drop)}, só no app. Data a anunciar.` }
    : p.soldOut ? { chip: flag.text, text: p.dropSoldOut ? 'Todas as peças deste drop esgotaram.' : 'Esta peça esgotou no shop.' }
    : { chip: flag && flag.cls === 'last' ? flag.text : 'Available', text: 'Peça de drop que já aconteceu, à venda no site enquanto houver estoque.' };

  const fitHTML = fit ? `<p class="s-fit"><b class="mono">Fit: ${esc(fit.name)}</b> ${esc(fit.note)}</p>` : '';
  const modelHTML = p.model ? `<p class="s-note" style="margin-top:6px">Na foto: ${String(p.model.height / 100).replace('.', ',')} m, vestindo ${esc(p.model.size)}.</p>` : '';
  const guideBtn = guide ? '<button class="s-link" type="button" id="s-open-guide">Guia de medidas</button>' : '';

  const buyHTML = soon ? `
        <div class="s-teaser">
          <p class="mono s-next-k"><i aria-hidden="true"></i>Abre no app</p>
          <p class="s-next-when">${dated ? esc(V.whenLabel(p.drop)) : 'Data a anunciar'}</p>${dated ? V.clockHTML(p.drop) : '<p class="s-note">Entra na lista de espera para receber o aviso quando a data sair.</p>'}
          <div class="s-next-row">${V.appButtons(`peca/${p.slug}`, 's-btn', 's-btn ghost') || '<a class="s-btn" href="/#entrar">Ativar lembrete</a>'}
            ${dated ? `<button class="s-btn ghost" type="button" data-ics="${p.drop.id}">Adicionar à agenda</button>` : ''}${S.saveButton(p, 's-save s-save-lg')}</div>
          ${fitHTML}${guide ? `<p style="margin:12px 0 0">${guideBtn}</p>` : ''}
          <p class="s-note">Esta peça não é vendida pelo site no lançamento. A lista de espera não reserva peça: garante que você recebe o aviso.</p>
        </div>` : `
        <div class="s-field" ${p.colors.length < 2 ? 'hidden' : ''}>
          <div class="s-field-h"><span class="mono" id="s-color-l">Cor</span><strong id="s-color-name"></strong></div>
          <div class="s-swatches" role="radiogroup" aria-labelledby="s-color-l" id="s-colors"></div>
        </div>
        <p class="s-note" ${p.colors.length > 1 ? 'hidden' : ''} style="margin-top:22px">Cor: ${esc(S.colorName(p.colors[0]))}</p>

        <div class="s-field">
          <div class="s-field-h"><span class="mono" id="s-size-l">Tamanho</span>${guideBtn}</div>
          ${fitHTML}${modelHTML}
          <div class="s-sizes" role="radiogroup" aria-labelledby="s-size-l" id="s-sizes"></div>
          <p class="s-stock" id="s-stock" aria-live="polite"></p>
        </div>

        <div class="s-add"><button class="s-btn" type="button" id="s-add"></button>${S.saveButton(p, 's-save s-save-lg')}</div>
        <p class="s-note">Colocar no carrinho não reserva a peça. O estoque é conferido de novo no checkout.</p>

        <form class="s-ship" id="s-ship" novalidate>
          <label class="mono" for="s-cep">Prazo de entrega</label>
          <div><input id="s-cep" name="cep" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="9" placeholder="Seu CEP" aria-describedby="s-ship-out"><button class="s-btn ghost" type="submit">Calcular</button></div>
          <p class="s-ship-out" id="s-ship-out" aria-live="polite"></p>
        </form>
        ${S.dropWeekNote()}`;

  /* ---------- estrutura ---------- */
  root.innerHTML = `
    <nav class="s-crumbs mono" aria-label="Você está em"><a href="/shop">Shop</a><span aria-hidden="true">/</span><a href="/shop/category/${p.category}">${esc(p.categoryName)}</a><span aria-hidden="true">/</span><span aria-current="page" style="color:var(--text-2)">${esc(p.name)}</span></nav>
    <div class="s-pdp">
      <div>
        <div class="s-gallery" id="s-gallery" aria-label="Fotos de ${esc(p.name)}"></div>
        <div class="s-gnav" id="s-gnav" aria-hidden="true"></div>
      </div>
      <div class="s-buy">
        <p class="s-drop mono">${esc(S.dropLabel(p.drop))} · ${!soon ? `lançado ${S.dateBR(p.releaseDate)}` : dated ? `abre ${S.dateBR(p.releaseDate)}` : 'data a anunciar'}</p>
        <h1>${esc(p.name)}</h1>
        <span class="s-price">${money(p.price)}</span>
        ${soon ? '' : S.ratingHTML(p, true)}
        <p class="s-status"><span class="s-chip ${soon ? 'app' : p.soldOut ? 'out' : flag && flag.cls === 'last' ? 'last' : ''}">${esc(status.chip)}</span>${esc(status.text)}</p>
        <p class="s-desc">${esc(p.description)}</p>
        ${buyHTML}

        ${p.drop.concept ? `<section class="s-story" aria-label="Sobre o drop"><p class="mono">Behind the drop · ${esc(S.dropLabel(p.drop))}</p><p>${esc(p.drop.concept)}</p></section>` : ''}

        <div class="s-acc">
          <details><summary>Entrega</summary><div class="in">
            <p>O valor e o prazo do frete aparecem antes de pagar, quando a integração com a transportadora estiver ativa. Nesta demonstração, ela não está conectada.</p>
            <p>Das 25 lojas da Vulto, 12 fazem ship from store: parte dos pedidos do site sai direto do estoque de uma loja.</p>
            <p>Em semana de drop sai muito pedido de uma vez, então o prazo de entrega pode ser maior que o normal.</p></div></details>
          <details><summary>Trocas e devoluções</summary><div class="in">
            <p>Compras feitas pela internet podem ser devolvidas em até 7 dias depois do recebimento, pelo direito de arrependimento do Código de Defesa do Consumidor.</p>
            <p>As regras de troca de tamanho ainda precisam ser definidas pela Vulto e entram aqui.</p></div></details>
          <details><summary>Detalhes</summary><div class="in">
            <p>${esc(p.categoryName)} · ${esc(S.dropLabel(p.drop))}${fit ? ` · Fit ${esc(fit.name.toLowerCase())}` : ''}</p>
            <p>${!soon ? `Lançada no app em ${S.dateBR(p.releaseDate)}.` : dated ? `Abre no app em ${S.dateBR(p.releaseDate)}, às 19h.` : `Lança no ${esc(S.dropLabel(p.drop))}, no app. Data a anunciar.`}</p></div></details>
        </div>
      </div>
    </div>
    ${!soon && p.rating ? `<section class="s-revs" id="avaliacoes" aria-labelledby="s-revs-t">
      <div class="s-revs-sum">
        <h2 class="mono" id="s-revs-t">Avaliações</h2>
        <p class="s-revs-avg"><b>${S.rateText(p.rating.avg)}</b><span>de 5</span></p>
        ${S.stars(p.rating.avg)}
        <p class="s-note">${p.rating.count} ${p.rating.count === 1 ? 'avaliação' : 'avaliações'} de quem comprou</p>
        ${S.ratingBars(p.rating)}
        <p class="s-note">Avaliações de demonstração, como os demais dados deste shop.</p>
      </div>
      <div class="s-revs-list">${p.reviews.map(r => S.reviewHTML(r)).join('')}</div>
    </section>` : ''}
    <div id="s-rails"></div>`;

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

  /* ---------- guia de medidas ---------- */
  if (guide) {
    const how = p.garment === 'pants' || p.garment === 'shorts'
      ? 'Estenda uma calça sua que veste bem. Meça a cintura de ponta a ponta, o quadril na parte mais larga e o comprimento da cintura à barra. Compare com a tabela.'
      : 'Estenda uma peça sua que veste bem. Meça a largura de axila a axila e o comprimento do ombro até a barra. Compare com a tabela.';
    $('s-guide-body').innerHTML = `${fit ? `<p class="s-fit" style="margin:0 0 16px"><b class="mono">Fit: ${esc(fit.name)}</b> ${esc(fit.note)}</p>` : ''}
      <table class="s-table"><thead><tr>${guide.cols.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
      <tbody>${guide.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c} cm</td>` : `<th scope="row">${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table>
      <p class="s-note" style="margin-top:14px"><b style="color:var(--text-2);font-weight:500">Como medir.</b> ${how}</p>
      ${p.model ? `<p class="s-note">Na foto: ${String(p.model.height / 100).replace('.', ',')} m, vestindo ${esc(p.model.size)}.</p>` : ''}
      <p class="s-note">Medidas da peça estendida, de referência. Dados demonstrativos.</p>`;
    $('s-open-guide').addEventListener('click', () => $('s-guide').showModal());
    $('s-guide').addEventListener('click', e => { if (e.target === $('s-guide') || e.target.closest('[data-close]')) $('s-guide').close(); });
  }

  /* ---------- recomendações ---------- */
  // Complete the fit: peças de outro grupo (parte de cima, de baixo, acessório), do mesmo drop primeiro.
  const GROUP = { camisetas: 'cima', moletons: 'cima', jaquetas: 'cima', calcas: 'baixo', bermudas: 'baixo', bones: 'acessorio', acessorios: 'acessorio' };
  const listed = S.listedProducts().filter(x => x.id !== p.id);
  const avail = listed.filter(x => !x.soldOut);
  const complement = avail.filter(x => GROUP[x.category] !== GROUP[p.category])
    .sort((a, b) => (b.dropId === p.dropId) - (a.dropId === p.dropId));
  const fitPicks = [];
  complement.forEach(x => { if (fitPicks.length < 4 && !fitPicks.some(y => y.category === x.category)) fitPicks.push(x); });
  complement.forEach(x => { if (fitPicks.length < 4 && !fitPicks.includes(x)) fitPicks.push(x); });
  const shown = new Set(fitPicks.map(x => x.id));
  const sameDrop = (soon ? S.teaserProducts().filter(x => x.id !== p.id) : listed.filter(x => x.dropId === p.dropId && !shown.has(x.id)))
    .sort((a, b) => a.soldOut - b.soldOut).slice(0, 4);
  sameDrop.forEach(x => shown.add(x.id));
  const similar = fitPicks.length + sameDrop.length < 4 ? avail.filter(x => !shown.has(x.id) && x.category === p.category).slice(0, 4) : [];
  similar.forEach(x => shown.add(x.id));
  const seen = S.viewed.products(p.id).filter(x => !shown.has(x.id)).slice(0, 4);
  const ugc = V.community(p.slug);

  const rail = (title, list) => list.length ? `<section class="s-related"><h2>${title}</h2><div class="s-grid">${list.map(x => S.card(x, 'h3')).join('')}</div></section>` : '';
  $('s-rails').innerHTML =
    (ugc.length ? `<section class="s-related"><h2>Vulto in real life</h2><div class="s-ugc">${ugc.map(c =>
      `<figure><img src="${esc(c.src)}" alt="${esc(c.alt || '')}" loading="lazy" decoding="async"><figcaption class="mono">${esc(c.author || '')}</figcaption></figure>`).join('')}</div></section>` : '') +
    rail('Complete the fit', fitPicks) +
    rail(`Mais do ${esc(S.dropLabel(p.drop))}`, sameDrop) +
    rail('Você também pode curtir', similar) +
    rail('Vistos por você', seen);
  S.viewed.add(p.id);

  if (soon) { paintGallery(); V.startClocks(); return; }

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
  // Quantidade só aparece quando é pouca, e é sempre a do estoque.
  const stockText = n => n <= 0 ? 'esgotado' : n === 1 ? 'última unidade' : n <= S.CONFIG.lowStock ? `restam ${n}` : 'disponível';
  function paintStock(msg, err) {
    const el = $('s-stock'); const btn = $('s-add');
    el.classList.toggle('err', !!err);
    if (p.soldOut) { el.textContent = 'Esta peça esgotou e não pode ser comprada.'; btn.textContent = 'Sold out'; btn.disabled = true; return; }
    if (msg) { el.textContent = msg; }
    else if (!state.size) el.textContent = p.lastSize ? `Só sobrou o tamanho ${p.lastSize}.` : '';
    else el.textContent = `${S.colorName(state.color)}, tamanho ${state.size}: ${stockText(stockOf(state.size))}`;
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

  /* ---------- prazo por CEP (usa a mesma integração do checkout) ---------- */
  const CEP_KEY = 'vulto-cep';
  const cepIn = $('s-cep');
  try { cepIn.value = sessionStorage.getItem(CEP_KEY) || ''; } catch { /* sem armazenamento */ }
  cepIn.addEventListener('input', () => { const d = cepIn.value.replace(/\D/g, '').slice(0, 8); cepIn.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; });
  $('s-ship').addEventListener('submit', async e => {
    e.preventDefault();
    const out = $('s-ship-out');
    if (!/^\d{5}-\d{3}$/.test(cepIn.value)) { out.textContent = 'Digite o CEP com 8 números.'; out.classList.add('err'); cepIn.focus(); return; }
    out.classList.remove('err');
    try { sessionStorage.setItem(CEP_KEY, cepIn.value); } catch { /* sem armazenamento */ }
    const r = await S.INTEGRATIONS.quoteShipping(cepIn.value, [{ product: p, color: state.color, size: state.size, qty: 1 }]);
    out.innerHTML = r.available && r.options?.length
      ? r.options.map(o => `${esc(o.name)}: ${money(o.price)} · ${o.days} ${o.days === 1 ? 'dia útil' : 'dias úteis'}`).join('<br>')
      : `CEP ${esc(cepIn.value)} guardado para o checkout. A cotação da transportadora não está conectada nesta demonstração: com ela ligada, prazo e valor aparecem aqui.`;
  });

  /* ---------- carrinho ---------- */
  const mini = $('s-mini');
  mini.addEventListener('click', e => { if (e.target === mini || e.target.closest('[data-close]')) mini.close(); });
  const thumbOf = (x, color) => { const im = S.productImages(x, color)[0]; return im.kind === 'photo' ? `<img src="${esc(im.src)}" alt="">` : im.html.replace('<svg class="g-svg"', '<svg class="g-svg" aria-hidden="true"').replace(/<title>.*?<\/title>/, ''); };
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
    const inCart = new Set(S.cart.lines().map(l => l.productId));
    const pair = fitPicks.filter(x => !inCart.has(x.id)).slice(0, 2);
    $('s-mini-body').innerHTML = `<div class="s-line" style="grid-template-columns:84px 1fr"><div class="s-thumb">${thumbOf(p, state.color)}</div>
      <div><h3>${esc(p.name)}</h3><p>${esc(S.colorName(state.color))} · ${esc(state.size)}</p><p class="s-price" style="margin-top:8px">${money(p.price)}</p></div></div>
      <div class="s-row" style="margin-top:10px"><span>Itens no carrinho</span><span>${S.cart.count()}</span></div>
      <div class="s-row"><span>Subtotal</span><span>${money(S.cart.subtotal())}</span></div>
      ${pair.length ? `<p class="mono" style="color:var(--text-2);margin:22px 0 4px">Complete the fit</p>${pair.map(x => `<a class="s-line s-pair" href="/shop/${x.slug}"><div class="s-thumb">${thumbOf(x)}</div><div><h3>${esc(x.name)}</h3><p>${esc(S.dropLabel(x.drop))}</p></div><span class="s-price">${money(x.price)}</span></a>`).join('')}` : ''}`;
    mini.showModal();
  });

  paintGallery(); repaint();
})();
