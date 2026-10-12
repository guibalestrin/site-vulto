/* VULTO SHOP · catálogo: categorias, filtros e ordenação sobre os produtos listados. */
(() => {
  'use strict';
  const S = window.VultoShop;
  const { D, esc, money } = S;
  S.mountChrome('shop');

  const PRICE = [
    { id: 'ate-150', label: 'Até R$ 150', test: v => v <= 150 },
    { id: '150-300', label: 'R$ 150 a R$ 300', test: v => v > 150 && v <= 300 },
    { id: 'acima-300', label: 'Acima de R$ 300', test: v => v > 300 }
  ];
  const AVAIL = [{ id: 'disponivel', label: 'Disponível' }, { id: 'esgotado', label: 'Sold out' }];
  const KEYS = ['tamanho', 'cor', 'preco', 'disp', 'drop'];

  // categoria vem da rota /shop/category/[categoria] (ou ?categoria= como recuo)
  const m = location.pathname.match(/\/shop\/category\/([^/?#]+)/);
  const catId = decodeURIComponent(m ? m[1] : (new URLSearchParams(location.search).get('categoria') || ''));
  const category = catId ? S.catById[catId] : null;
  // Salvos: a mesma grade, só com o que a pessoa guardou neste aparelho
  const savedView = !category && new URLSearchParams(location.search).get('salvos') === '1';

  const all = S.listedProducts();
  const base = savedView ? S.saved.products() : category ? all.filter(p => p.category === category.id) : all;

  // estado a partir da URL, para filtros compartilháveis
  const params = new URLSearchParams(location.search);
  const state = Object.fromEntries(KEYS.map(k => [k, new Set((params.get(k) || '').split(',').filter(Boolean))]));
  let sort = params.get('ordem') || 'recentes';

  const $ = id => document.getElementById(id);
  const grid = $('s-grid');

  /* ---------- cabeçalho da página ---------- */
  if (catId && !category) {
    document.title = 'Categoria não encontrada · Vulto';
    $('s-title').textContent = 'Categoria não encontrada';
  } else if (category) {
    document.title = `${category.name} · Shop · Vulto`;
    $('s-title').textContent = category.name;
    $('s-kicker').hidden = false;
  } else if (savedView) {
    document.title = 'Salvos · Shop · Vulto';
    $('s-title').textContent = 'Salvos';
    $('s-kicker').hidden = false;
    $('s-lede').textContent = 'As peças que você guardou neste aparelho.';
  }
  const catsWithItems = D.categories.filter(c => all.some(p => p.category === c.id));
  $('s-cats').innerHTML = `<a href="/shop" ${!category && !savedView ? 'aria-current="page"' : ''}>Tudo</a>` +
    catsWithItems.map(c => `<a href="/shop/category/${c.id}" ${category && category.id === c.id ? 'aria-current="page"' : ''}>${esc(c.name)}</a>`).join('') +
    `<a href="/shop?salvos=1" ${savedView ? 'aria-current="page"' : ''}>Salvos<span data-saved-count></span></a>`;
  $('s-sort').value = sort;

  /* ---------- próximo drop e semana de teasers ---------- */
  $('s-next-slot').innerHTML = S.nextDropHTML();
  const teasers = !category && !savedView ? S.teaserProducts() : [];
  if (teasers.length) {
    const d = teasers[0].drop;
    $('s-teasers').innerHTML = `<h2 class="mono">Coming soon · ${esc(S.dropLabel(d))} · só no app</h2>
      <div class="s-grid">${teasers.map(p => S.card(p, 'h3')).join('')}</div>`;
    $('s-teasers').hidden = false;
  }
  S.V.startClocks();

  /* ---------- regras de filtro ---------- */
  function sizeMatch(p) {
    if (!state.tamanho.size) return true;
    const colors = state.cor.size ? [...state.cor] : p.colors;
    return p.variants.some(v => state.tamanho.has(v.size) && colors.includes(v.color) && v.stock > 0);
  }
  const tests = {
    tamanho: sizeMatch,
    cor: p => !state.cor.size || p.colors.some(c => state.cor.has(c)),
    preco: p => !state.preco.size || PRICE.some(r => state.preco.has(r.id) && r.test(p.price)),
    disp: p => !state.disp.size || (state.disp.has('disponivel') && !p.soldOut) || (state.disp.has('esgotado') && p.soldOut),
    drop: p => !state.drop.size || state.drop.has(p.dropId)
  };
  const passes = (p, skip) => KEYS.every(k => k === skip || tests[k](p));
  const filtered = () => base.filter(p => passes(p));

  function sorted(list) {
    const idx = new Map(D.products.map((p, i) => [p.id, i]));
    const byRecent = (a, b) => Date.parse(b.releaseDate) - Date.parse(a.releaseDate) || idx.get(a.id) - idx.get(b.id);
    const out = [...list];
    if (sort === 'preco-asc') out.sort((a, b) => a.price - b.price || byRecent(a, b));
    else if (sort === 'preco-desc') out.sort((a, b) => b.price - a.price || byRecent(a, b));
    else out.sort(byRecent);
    // esgotados sempre depois dos disponíveis
    return out.sort((a, b) => a.soldOut - b.soldOut);
  }

  const card = p => S.card(p, 'h2');

  /* ---------- filtros (gaveta) ---------- */
  function optionsFor(key) {
    const pool = base.filter(p => passes(p, key));
    const count = fn => pool.filter(fn).length;
    if (key === 'tamanho') {
      const order = [];
      base.forEach(p => p.sizes.forEach(s => { if (!order.includes(s)) order.push(s); }));
      return order.map(s => ({ id: s, label: s, n: count(p => p.variants.some(v => v.size === s && v.stock > 0)) }));
    }
    if (key === 'cor') {
      const ids = [...new Set(base.flatMap(p => p.colors))];
      return ids.map(c => ({ id: c, label: S.colorName(c), swatch: S.colorHex(c), n: count(p => p.colors.includes(c)) }));
    }
    if (key === 'preco') return PRICE.map(r => ({ id: r.id, label: r.label, n: count(p => r.test(p.price)) }));
    if (key === 'disp') return AVAIL.map(a => ({ id: a.id, label: a.label, n: count(p => a.id === 'esgotado' ? p.soldOut : !p.soldOut) }));
    if (key === 'drop') {
      const ids = [...new Set(base.map(p => p.dropId))].sort((a, b) => S.dropById[b].number - S.dropById[a].number);
      return ids.map(d => ({ id: d, label: S.dropLabel(S.dropById[d]), n: count(p => p.dropId === d) }));
    }
    return [];
  }
  const LEG = { tamanho: 'Tamanho', cor: 'Cor', preco: 'Preço', disp: 'Disponibilidade', drop: 'Drop' };
  function renderFilters() {
    $('s-filter-form').innerHTML = KEYS.map(k => {
      const opts = optionsFor(k);
      if (opts.length < 2 && !state[k].size) return '';
      return `<fieldset class="s-fg"><legend>${LEG[k]}</legend><div class="s-opts">` + opts.map(o =>
        `<label class="s-opt"><input type="checkbox" name="${k}" value="${esc(o.id)}" ${state[k].has(o.id) ? 'checked' : ''} ${!o.n && !state[k].has(o.id) ? 'disabled' : ''}>
          <span>${o.swatch ? `<i style="background:${o.swatch}"></i>` : ''}${esc(o.label)}<small>${o.n}</small></span></label>`).join('') + '</div></fieldset>';
    }).join('');
  }

  /* ---------- pintura ---------- */
  function syncURL() {
    const q = new URLSearchParams();
    KEYS.forEach(k => { if (state[k].size) q.set(k, [...state[k]].join(',')); });
    if (savedView) q.set('salvos', '1');
    if (sort !== 'recentes') q.set('ordem', sort);
    const s = q.toString();
    history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
  }
  function labelOf(k, id) {
    if (k === 'cor') return S.colorName(id);
    if (k === 'preco') return PRICE.find(r => r.id === id)?.label || id;
    if (k === 'disp') return AVAIL.find(a => a.id === id)?.label || id;
    if (k === 'drop') return S.dropById[id] ? S.dropLabel(S.dropById[id]) : id;
    return `Tamanho ${id}`;
  }
  function render() {
    const list = sorted(filtered());
    const n = KEYS.reduce((s, k) => s + state[k].size, 0);
    $('s-fcount').textContent = n ? ` (${n})` : '';
    $('s-total').textContent = `${list.length} ${list.length === 1 ? 'peça' : 'peças'}`;
    $('s-see').textContent = `Ver ${list.length} ${list.length === 1 ? 'peça' : 'peças'}`;
    $('s-active').innerHTML = KEYS.flatMap(k => [...state[k]].map(id =>
      `<button class="s-pill" type="button" data-k="${k}" data-v="${esc(id)}" aria-label="Remover filtro ${esc(labelOf(k, id))}">${esc(labelOf(k, id))}<b aria-hidden="true">×</b></button>`)).join('') +
      (n ? '<button class="s-link" type="button" data-clear-all style="margin-left:6px">Limpar tudo</button>' : '');
    if (catId && !category) {
      grid.innerHTML = `<div class="s-empty"><h2>Essa categoria não existe.</h2><p>Volte para o shop e escolha outra.</p><p><a class="s-btn ghost" href="/shop">Ver tudo</a></p></div>`;
    } else if (savedView && !base.length) {
      grid.innerHTML = `<div class="s-empty"><h2>Nada salvo ainda.</h2><p>Toque no marcador de uma peça para guardar aqui e voltar depois.</p><p><a class="s-btn ghost" href="/shop">Ver o shop</a></p></div>`;
    } else if (!base.length) {
      grid.innerHTML = `<div class="s-empty"><h2>Nada aqui por enquanto.</h2><p>As peças entram no shop depois que o drop acontece no app.</p><p><a class="s-btn ghost" href="/shop">Ver tudo</a></p></div>`;
    } else if (!list.length) {
      grid.innerHTML = `<div class="s-empty"><h2>Nenhuma peça com esses filtros.</h2><p>Tire um filtro ou limpe tudo para ver mais.</p><p><button class="s-btn ghost" type="button" data-clear-all>Limpar filtros</button></p></div>`;
    } else {
      grid.innerHTML = list.map(card).join('');
    }
    syncURL();
  }

  /* ---------- eventos ---------- */
  const dlg = $('s-filters');
  $('s-open-filters').addEventListener('click', () => { renderFilters(); dlg.showModal(); });
  dlg.addEventListener('click', e => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });
  $('s-filter-form').addEventListener('change', e => {
    const i = e.target; if (!i.name) return;
    i.checked ? state[i.name].add(i.value) : state[i.name].delete(i.value);
    render(); renderFilters();
    const again = $('s-filter-form').querySelector(`input[name="${i.name}"][value="${CSS.escape(i.value)}"]`); if (again) again.focus();
  });
  const clearAll = () => { KEYS.forEach(k => state[k].clear()); render(); if (dlg.open) renderFilters(); };
  $('s-clear').addEventListener('click', clearAll);
  document.addEventListener('click', e => {
    const pill = e.target.closest('.s-pill'); if (pill) { state[pill.dataset.k].delete(pill.dataset.v); render(); return; }
    if (e.target.closest('[data-clear-all]')) clearAll();
  });
  $('s-sort').addEventListener('change', e => { sort = e.target.value; render(); });

  render();
})();
