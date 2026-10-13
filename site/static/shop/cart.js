/* VULTO SHOP · carrinho: quantidades limitadas ao estoque, itens fora de venda sinalizados. */
(() => {
  'use strict';
  const S = window.VultoShop;
  const { esc, money } = S;
  S.mountChrome('cart');
  const root = document.getElementById('s-cart-root');

  function thumb(line) {
    const im = S.productImages(line.product, line.color)[0];
    return im.kind === 'photo' ? `<img src="${esc(im.src)}" alt="" loading="lazy" decoding="async">` : im.html.replace('<svg class="g-svg"', '<svg class="g-svg" aria-hidden="true"').replace(/<title>.*?<\/title>/, '');
  }

  function render() {
    const lines = S.cart.lines();
    if (!lines.length) {
      // Retomar de onde parou: salvos primeiro, depois o que foi visto.
      const savedList = S.saved.products().slice(0, 4);
      const seen = S.viewed.products().filter(x => !savedList.some(y => y.id === x.id)).slice(0, 4);
      const rail = (t, l) => l.length ? `<section class="s-related" style="grid-column:1/-1;margin:0 calc(var(--gut) * -1)"><h2>${t}</h2><div class="s-grid">${l.map(x => S.card(x, 'h3')).join('')}</div></section>` : '';
      root.innerHTML = `<div class="s-empty" style="grid-column:1/-1;text-align:left;padding:30px 0 ${savedList.length || seen.length ? 40 : 80}px"><h2>Seu carrinho está vazio.</h2><p>As peças de drops que já aconteceram ficam no shop enquanto houver estoque.</p><p style="margin-top:22px"><a class="s-btn" href="/shop">Ir para o shop</a></p></div>` +
        rail('Seus salvos', savedList) + rail('Vistos por você', seen);
      return;
    }
    const sub = S.cart.subtotal();
    const anyBad = lines.some(l => l.unavailable);
    root.innerHTML = `<section aria-label="Itens do carrinho"><ul style="list-style:none;margin:0;padding:0;border-top:1px solid var(--line)">${lines.map((l, i) => {
      if (l.unavailable) {
        return `<li class="s-line"><div class="s-thumb">${l.product ? thumb(l) : ''}</div><div><h3>${esc(l.product ? l.product.name : 'Peça indisponível')}</h3>
          <p>${esc(S.colorName(l.color))} · ${esc(l.size)}</p><p class="s-warn">Esta peça não está mais à venda e não entra no total.</p>
          <button class="s-link s-rm" type="button" data-rm="${i}">Remover</button></div><span></span></li>`;
      }
      return `<li class="s-line"><a class="s-thumb" href="/shop/${l.product.slug}" tabindex="-1" aria-hidden="true">${thumb(l)}</a>
        <div><h3><a href="/shop/${l.product.slug}">${esc(l.product.name)}</a></h3>
          <p>${esc(S.colorName(l.color))} · Tamanho ${esc(l.size)}</p><p>${money(l.product.price)} cada</p>
          <div class="s-qty" role="group" aria-label="Quantidade de ${esc(l.product.name)}">
            <button type="button" data-dec="${i}" ${l.qty <= 1 ? 'disabled' : ''} aria-label="Diminuir quantidade">−</button>
            <output aria-live="polite">${l.qty}</output>
            <button type="button" data-inc="${i}" ${l.qty >= l.max ? 'disabled' : ''} aria-label="Aumentar quantidade">+</button>
          </div>
          ${l.qty >= l.max ? `<p class="s-note">Quantidade máxima em estoque.</p>` : ''}
          ${l.reduced ? `<p class="s-warn">O estoque diminuiu. Ajustamos a quantidade para ${l.qty}.</p>` : ''}
          <button class="s-link s-rm" type="button" data-rm="${i}">Remover</button>
        </div>
        <span class="s-price">${money(l.qty * l.product.price)}</span></li>`;
    }).join('')}</ul>
    <p style="margin-top:22px"><a class="s-link" href="/shop">Continuar comprando</a></p></section>
    <aside class="s-sum" aria-label="Resumo">
      <h2>Resumo</h2>
      <div class="s-row"><span>Subtotal</span><span>${money(sub)}</span></div>
      <div class="s-row"><span>Frete</span><span style="font-family:var(--body);color:var(--text-2)">Calculado no checkout</span></div>
      <div class="s-row total"><span>Total parcial</span><span>${money(sub)}</span></div>
      ${S.bumpSlot(lines.filter(l => !l.unavailable).map(l => l.product))}
      <a class="s-btn full" href="/checkout" ${S.cart.count() ? '' : 'aria-disabled="true" style="pointer-events:none;opacity:.4"'}>Ir para o checkout</a>
      ${anyBad ? '<p class="s-warn">Remova os itens indisponíveis para seguir.</p>' : ''}
      <p class="s-note">Os itens do carrinho não ficam reservados. O estoque é conferido de novo antes de concluir.</p>
      ${S.dropWeekNote()}
      <ul class="s-assure">${(r => r ? `<li>Nota ${S.rateText(r.avg)} em ${r.count} avaliações do shop</li>` : '')(S.shopRating())}<li>Compra sem cadastro, só com e-mail</li><li>Pix, cartão ou boleto</li><li>Devolução em até 7 dias do recebimento</li></ul>
    </aside>`;
  }

  root.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t) return;
    if (t.dataset.rm) { const l = S.cart.lines()[t.dataset.rm]; S.cart.remove(Number(t.dataset.rm)); S.announce(`${l?.product?.name || 'Item'} removido do carrinho.`); }
    const keep = sel => { const b = root.querySelector(sel); (b && !b.disabled ? b : b?.closest('.s-qty')?.querySelector('button:not([disabled])'))?.focus(); };
    if (t.dataset.inc) { const i = Number(t.dataset.inc); S.cart.setQty(i, S.cart.lines()[i].qty + 1); keep(`[data-inc="${i}"]`); }
    if (t.dataset.dec) { const i = Number(t.dataset.dec); S.cart.setQty(i, S.cart.lines()[i].qty - 1); keep(`[data-dec="${i}"]`); }
    if (t.dataset.rm) root.querySelector('.s-rm, .s-btn')?.focus();
  });
  S.cart.subscribe(render);
  render();
})();
