/* VULTO SHOP · checkout demonstrativo em etapas.
   Nenhum pedido é criado e nenhum pagamento é processado. Frete e pagamento
   ficam atrás de INTEGRATIONS, desligados, para serem ligados a serviços reais. */
(() => {
  'use strict';
  const S = window.VultoShop;
  const { esc, money } = S;
  S.mountChrome('cart');

  /* Pontos de integração. Hoje nada está conectado: cada função responde que o serviço não existe. */
  const INTEGRATIONS = {
    quoteShipping: async (/* cep, linhas */) => ({ available: false }),
    createPayment: async (/* pedido, método */) => ({ available: false }),
    reserveStock: async (/* linhas */) => ({ available: false })
  };

  const root = document.getElementById('s-co-root');
  const UF = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');
  const PAY = [
    { id: 'pix', label: 'Pix', note: 'O código seria gerado pelo meio de pagamento, que não está conectado nesta demonstração.' },
    { id: 'cartao', label: 'Cartão de crédito', note: 'Os dados do cartão seriam pedidos pelo meio de pagamento, fora deste site.' },
    { id: 'boleto', label: 'Boleto', note: 'O boleto seria emitido pelo meio de pagamento, que não está conectado.' }
  ];
  const data = { email: '', tel: '', nome: '', cep: '', rua: '', num: '', comp: '', bairro: '', cidade: '', uf: '', pay: 'pix' };
  let step = 1, done = 0, result = '';

  const val = {
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Digite um e-mail válido.',
    tel: v => !v || v.replace(/\D/g, '').length >= 10 || 'Digite o telefone com DDD.',
    nome: v => v.trim().split(/\s+/).length >= 2 || 'Digite nome e sobrenome.',
    cep: v => /^\d{5}-?\d{3}$/.test(v) || 'Digite o CEP com 8 números.',
    rua: v => v.trim().length > 2 || 'Digite o endereço.',
    num: v => v.trim().length > 0 || 'Digite o número (ou s/n).',
    bairro: v => v.trim().length > 1 || 'Digite o bairro.',
    cidade: v => v.trim().length > 1 || 'Digite a cidade.',
    uf: v => UF.includes(v) || 'Escolha o estado.'
  };
  const field = (id, label, cls = '', type = 'text', extra = '') =>
    `<div class="f ${cls}"><label for="c-${id}">${label}</label><input id="c-${id}" name="${id}" type="${type}" value="${esc(data[id])}" ${extra} aria-describedby="e-${id}"><span class="s-err" id="e-${id}"></span></div>`;

  function summary() {
    const lines = S.cart.lines().filter(l => !l.unavailable);
    const sub = S.cart.subtotal();
    return `<aside class="s-sum" aria-label="Resumo do pedido"><h2>Resumo do pedido</h2>
      ${lines.map(l => `<div class="s-row"><span>${esc(l.product.name)} <span style="color:var(--text-2)">· ${esc(S.colorName(l.color))} · ${esc(l.size)} · ${l.qty}x</span></span><span>${money(l.qty * l.product.price)}</span></div>`).join('')}
      <div class="s-row total"><span>Subtotal</span><span>${money(sub)}</span></div>
      <div class="s-row"><span>Frete</span><span style="font-family:var(--body);color:var(--text-2)">Transportadora não conectada</span></div>
      <p class="s-note">O total final só sai com o frete calculado. <a class="s-link" href="/cart">Editar carrinho</a></p></aside>`;
  }

  const stepHead = (n, title, sum) => {
    const cls = step === n ? 'is-active' : done >= n ? 'is-done' : '';
    return `<li class="s-step ${cls}"><h2><span class="n">${done >= n && step !== n ? '✓' : n}</span>${title}${done >= n && step !== n && !result ? `<button class="s-link edit" type="button" data-edit="${n}">Editar</button>` : ''}</h2>
      ${done >= n && step !== n ? `<div class="done-sum">${sum}</div>` : ''}`;
  };

  function render() {
    S.cart.normalize();
    if (!S.cart.count()) {
      root.innerHTML = `<div class="s-empty" style="grid-column:1/-1;text-align:left;padding:30px 0 80px"><h2>Não há nada para finalizar.</h2><p>Seu carrinho está vazio ou as peças saíram de estoque.</p><p style="margin-top:22px"><a class="s-btn" href="/shop">Ir para o shop</a></p></div>`;
      return;
    }
    const addr = `${esc(data.nome)}<br>${esc(data.rua)}, ${esc(data.num)}${data.comp ? ' · ' + esc(data.comp) : ''}<br>${esc(data.bairro)} · ${esc(data.cidade)}/${esc(data.uf)} · ${esc(data.cep)}`;
    root.innerHTML = `<section aria-label="Etapas do checkout">
      <div class="s-banner"><strong>Checkout de demonstração.</strong> Nenhum pedido é criado e nenhum pagamento é processado. Frete e pagamento aparecem como pontos de integração ainda desligados.</div>
      <ol class="s-steps">
        ${stepHead(1, 'Contato', esc(data.email) + (data.tel ? ' · ' + esc(data.tel) : ''))}
          ${step === 1 ? `<form class="panel s-form" data-step="1" novalidate>
            ${field('email', 'E-mail', '', 'email', 'autocomplete="email" required')}
            ${field('tel', 'Telefone (opcional)', '', 'tel', 'autocomplete="tel" inputmode="tel"')}
            <div class="f"><button class="s-btn" type="submit">Continuar para entrega</button></div></form>` : ''}</li>
        ${stepHead(2, 'Entrega', addr)}
          ${step === 2 ? `<form class="panel s-form" data-step="2" novalidate>
            ${field('nome', 'Nome completo', '', 'text', 'autocomplete="name" required')}
            ${field('cep', 'CEP', 't', 'text', 'autocomplete="postal-code" inputmode="numeric" maxlength="9" required')}
            ${field('rua', 'Endereço', 'q', 'text', 'autocomplete="address-line1" required')}
            ${field('num', 'Número', 't', 'text', 'required')}
            ${field('comp', 'Complemento (opcional)', 'q', 'text', 'autocomplete="address-line2"')}
            ${field('bairro', 'Bairro', 'h', 'text', 'required')}
            ${field('cidade', 'Cidade', 'h', 'text', 'autocomplete="address-level2" required')}
            <div class="f t"><label for="c-uf">Estado</label><select id="c-uf" name="uf" autocomplete="address-level1" required aria-describedby="e-uf"><option value="">UF</option>${UF.map(u => `<option ${data.uf === u ? 'selected' : ''}>${u}</option>`).join('')}</select><span class="s-err" id="e-uf"></span></div>
            <div class="f"><p class="s-note" style="margin:0">O valor e o prazo do frete viriam da transportadora, que não está conectada nesta demonstração. Em semana de drop, o prazo pode ser maior que o normal.</p></div>
            <div class="f"><button class="s-btn" type="submit">Continuar para pagamento</button></div></form>` : ''}</li>
        ${stepHead(3, 'Pagamento', esc(PAY.find(x => x.id === data.pay).label))}
          ${step === 3 ? `<form class="panel s-form" data-step="3" novalidate><fieldset class="s-pay" style="border:0;padding:0;margin:0"><legend class="lbl" style="margin-bottom:10px">Forma de pagamento</legend>
            ${PAY.map(x => `<label><input type="radio" name="pay" value="${x.id}" ${data.pay === x.id ? 'checked' : ''}><span>${x.label}<small>${x.note}</small></span></label>`).join('')}</fieldset>
            <div class="f"><button class="s-btn" type="submit">Revisar pedido</button></div></form>` : ''}</li>
        ${stepHead(4, 'Revisão', '')}
          ${step === 4 ? `<div class="panel">
            <div class="s-row"><span>Contato</span><span style="font-family:var(--body)">${esc(data.email)}</span></div>
            <div class="s-row"><span>Entrega</span><span style="font-family:var(--body)">${addr}</span></div>
            <div class="s-row"><span>Pagamento</span><span style="font-family:var(--body)">${esc(PAY.find(x => x.id === data.pay).label)}</span></div>
            <div class="s-row total"><span>Subtotal sem frete</span><span>${money(S.cart.subtotal())}</span></div>
            ${result ? result : `<button class="s-btn full" type="button" id="c-finish" style="margin-top:18px">Concluir (demonstração)</button>
            <p class="s-note">Ao concluir, nada é enviado nem cobrado. Você vê o que aconteceria num checkout de verdade.</p>`}
          </div>` : ''}</li>
      </ol></section>${summary()}`;
    const f = root.querySelector('form.panel input, form.panel select, #c-finish');
    if (f && document.activeElement === document.body) f.focus({ preventScroll: true });
  }

  function validate(form) {
    let ok = true, first = null;
    form.querySelectorAll('input[name], select[name]').forEach(i => {
      if (i.type === 'radio') { if (i.checked) data[i.name] = i.value; return; }
      data[i.name] = i.value.trim();
      const rule = val[i.name];
      const r = rule ? rule(data[i.name]) : true;
      const msg = r === true ? '' : r;
      const err = form.querySelector('#e-' + i.name);
      if (err) err.textContent = msg;
      i.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg && !first) first = i;
      if (msg) ok = false;
    });
    if (first) first.focus();
    return ok;
  }

  root.addEventListener('input', e => {
    if (e.target.name === 'cep') { const d = e.target.value.replace(/\D/g, '').slice(0, 8); e.target.value = d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; }
  });
  root.addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target; const n = Number(form.dataset.step);
    if (!validate(form)) return;
    if (n === 2) await INTEGRATIONS.quoteShipping(data.cep, S.cart.lines());
    done = Math.max(done, n); step = n + 1; render();
    root.querySelector('.s-step.is-active')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    root.querySelector('.s-step.is-active input, .s-step.is-active select, #c-finish')?.focus({ preventScroll: true });
  });
  root.addEventListener('click', async e => {
    const ed = e.target.closest('[data-edit]'); if (ed) { step = Number(ed.dataset.edit); render(); return; }
    if (e.target.id === 'c-finish') {
      const before = S.cart.count(); S.cart.normalize();
      const stock = await INTEGRATIONS.reserveStock(S.cart.lines());
      const pay = await INTEGRATIONS.createPayment(data, data.pay);
      const changed = S.cart.count() !== before;
      result = `<div class="s-result" role="status" tabindex="-1" id="c-result"><h3>Nenhum pedido foi criado.</h3>
        <p>Isto é uma demonstração: ${pay.available ? '' : 'o meio de pagamento não está conectado, '}${stock.available ? '' : 'o estoque não foi reservado '}e nada foi cobrado.</p>
        <p>${changed ? 'Algumas quantidades mudaram porque o estoque mudou. Confira o resumo.' : 'Seu carrinho continua igual, caso queira revisar.'}</p>
        <p style="margin-top:14px"><a class="s-btn ghost" href="/shop">Voltar para o shop</a></p></div>`;
      done = 4; render();
      document.getElementById('c-result')?.focus();
    }
  });
  S.cart.subscribe(() => { if (!document.activeElement || !root.contains(document.activeElement)) render(); });
  render();
})();
