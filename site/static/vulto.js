/* =========================================================================
   VULTO · AGENDA DE DROPS, CANAIS OFICIAIS E COMUNIDADE
   -------------------------------------------------------------------------
   Fonte única, carregada pela Home e pelo shop (antes de data.js).

   Regras que este arquivo garante:
   - Contagem regressiva, teaser no shop e lembrete na agenda só existem para
     drop com confirmed: true. Sem drop confirmado, o site diz "data a anunciar".
     Nunca presuma que toda quinta tem drop: cada data entra aqui à mão.
   - Links do app e de atendimento ficam null até existir o endereço oficial.
     Sem link do app, os botões levam para a lista de espera.
   - Foto da comunidade só entra real, autorizada e ligada à peça certa.

   Testes (ficam guardados na aba até ?simular=limpar):
     ?simular-data=2026-10-28T18:00   muda o "agora"
     ?simular-confirmado=1            trata datas cadastradas como confirmadas
   Qualquer simulação ativa mostra a etiqueta SIMULAÇÃO na tela.
   ========================================================================= */
window.VULTO = (() => {
  'use strict';

  /* Drops abrem na quinta-feira, às 19h (Brasília), só no app.
     Datas, nomes e conceitos são demonstrativos (ver data.js). */
  const drops = [
    { id: 'drop-10', number: 10, name: 'Asfalto',  launchAt: '2026-07-02T19:00:00-03:00', confirmed: true },
    { id: 'drop-11', number: 11, name: 'Concreto', launchAt: '2026-08-06T19:00:00-03:00', confirmed: true },
    { id: 'drop-12', number: 12, name: 'Garoa',    launchAt: '2026-09-03T19:00:00-03:00', confirmed: true },
    { id: 'drop-13', number: 13, name: 'Tinta',    launchAt: '2026-10-01T19:00:00-03:00', confirmed: true,
      // Conceito tirado do pacote de design (o mundo do filme). Troque pelo texto oficial do drop.
      concept: 'A tinta branca do filme da Vulto, sobre algodão preto e concreto paulista. Na camiseta ela racha em volta da caveira; no moletom ela seca e vira o anel que fecha o portal.' },
    // Data cadastrada, ainda não anunciada: sem contagem e sem teaser até confirmed: true.
    { id: 'drop-14', number: 14, name: 'Portal',   launchAt: '2026-10-29T19:00:00-03:00', confirmed: false }
  ];

  /* Canais oficiais. null = ainda não há endereço oficial, e o site não inventa um.
     Grupos independentes (WhatsApp, Telegram) nunca entram aqui. */
  const links = {
    appIOS: null,      // https://apps.apple.com/br/app/...
    appAndroid: null,  // https://play.google.com/store/apps/details?id=...
    appScheme: null,   // ex.: 'vulto://' → abre vulto://drop/drop-14 e vulto://peca/slug
    support: null,     // atendimento oficial
    tracking: null     // rastreio de pedido
  };

  /* Fotos de quem veste Vulto (UGC). Formato:
     { src, alt, author: '@perfil', product: 'slug-da-peca', authorized: true }
     Sem authorized: true a foto não aparece. */
  const community = [];

  const DAY = 864e5;
  const TEASER_DAYS = 7;     // uma semana de teasers antes do drop
  const DROP_WEEK_DAYS = 7;  // semana com mais pedidos e prazos maiores
  const OPEN_HOURS = 6;      // por quanto tempo a Home diz "abriu hoje"

  /* ---------- simulação (só para testes) ---------- */
  const SIM_KEY = 'vulto-sim-v1';
  const sim = (() => {
    const q = new URLSearchParams(location.search);
    let s = {};
    try { s = JSON.parse(sessionStorage.getItem(SIM_KEY) || '{}') || {}; } catch { s = {}; }
    if (q.get('simular') === 'limpar') s = {};
    if (q.get('simular-data')) s.data = q.get('simular-data');
    if (q.get('simular-confirmado')) s.confirmado = q.get('simular-confirmado') === '1';
    try { Object.keys(s).length ? sessionStorage.setItem(SIM_KEY, JSON.stringify(s)) : sessionStorage.removeItem(SIM_KEY); } catch { /* sem armazenamento: vale só nesta página */ }
    return s;
  })();
  const simulating = !!(sim.data || sim.confirmado);
  // O relógio simulado anda junto com o real, para a contagem regressiva continuar viva.
  const offset = (() => {
    const q = sim.data;
    if (!q) return 0;
    const t = Date.parse(q.length <= 10 ? q + 'T12:00:00-03:00' : (/[zZ]|[+-]\d\d:?\d\d$/.test(q) ? q : q + '-03:00'));
    return isNaN(t) ? 0 : t - Date.now();
  })();
  const now = () => Date.now() + offset;

  /* ---------- calendário ---------- */
  const byId = Object.fromEntries(drops.map(d => [d.id, d]));
  const at = d => Date.parse(d.launchAt);
  const isConfirmed = d => !!d && (d.confirmed || !!sim.confirmado);
  const nextDrop = (t = now()) => drops.filter(d => isConfirmed(d) && at(d) > t).sort((a, b) => at(a) - at(b))[0] || null;
  const inTeaser = (d, t = now()) => isConfirmed(d) && at(d) > t && t >= at(d) - TEASER_DAYS * DAY;
  const dropWeek = (t = now()) => drops.find(d => t >= at(d) && t < at(d) + DROP_WEEK_DAYS * DAY) || null;
  const justOpened = (t = now()) => drops.find(d => t >= at(d) && t < at(d) + OPEN_HOURS * 36e5) || null;

  /* ---------- texto ---------- */
  const TZ = 'America/Sao_Paulo';
  const dropLabel = d => `Drop ${d.number} · ${d.name}`;
  const weekday = d => { const w = new Date(at(d)).toLocaleDateString('pt-BR', { weekday: 'long', timeZone: TZ }).split('-')[0]; return w[0].toUpperCase() + w.slice(1); };
  const dayMonth = d => new Date(at(d)).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: TZ });
  const hour = d => new Date(at(d)).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: TZ });
  const whenLabel = d => `${weekday(d)}, ${dayMonth(d)} · ${hour(d)}`;          // Quinta, 29/10 · 19:00
  const whenShort = d => `${weekday(d).toLowerCase()}, ${dayMonth(d)}, ${hour(d).replace(':00', 'h')}`; // quinta, 29/10, 19h

  /* ---------- contagem regressiva ---------- */
  const pad = n => String(n).padStart(2, '0');
  function left(d, t = now()) {
    const ms = Math.max(0, at(d) - t);
    return { ms, d: Math.floor(ms / DAY), h: Math.floor(ms / 36e5) % 24, m: Math.floor(ms / 6e4) % 60, s: Math.floor(ms / 1e3) % 60 };
  }
  const clockHTML = d => `<span class="nd-clock" role="timer" data-cd="${d.id}"></span>`;
  function paintClocks() {
    const els = document.querySelectorAll('[data-cd]');
    els.forEach(el => {
      const d = byId[el.dataset.cd]; if (!d) return;
      const r = left(d);
      const u = (n, l) => `<span class="u"><b>${pad(n)}</b><small>${l}</small></span>`;
      const sep = '<span class="sep" aria-hidden="true">:</span>';
      const html = !r.ms ? '<span class="u"><b>Aberto no app</b></span>'
        : r.d ? u(r.d, 'D') + sep + u(r.h, 'H') + sep + u(r.m, 'M')
        : u(r.h, 'H') + sep + u(r.m, 'M') + sep + u(r.s, 'S');
      if (el.innerHTML !== html) el.innerHTML = html;
      const label = !r.ms ? 'O drop já abriu no app.' : `Faltam ${r.d ? r.d + (r.d === 1 ? ' dia, ' : ' dias, ') : ''}${r.h} ${r.h === 1 ? 'hora' : 'horas'} e ${r.m} ${r.m === 1 ? 'minuto' : 'minutos'}.`;
      if (el.getAttribute('aria-label') !== label) el.setAttribute('aria-label', label);
    });
    return els.length;
  }
  let clockTimer = null;
  function startClocks() {
    if (!paintClocks() || clockTimer) return;
    clockTimer = setInterval(() => { if (!document.hidden && !paintClocks()) { clearInterval(clockTimer); clockTimer = null; } }, 1000);
  }

  /* ---------- lembrete na agenda (.ics, gerado no aparelho) ---------- */
  function downloadICS(d) {
    if (!isConfirmed(d)) return;
    const stamp = x => x.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Vulto//Drops//PT-BR', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
      `UID:${d.id}@vulto`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(new Date(at(d)))}`, `DTEND:${stamp(new Date(at(d) + 36e5))}`,
      `SUMMARY:Vulto · ${dropLabel(d)} abre no app`, 'DESCRIPTION:O drop abre às 19h\\, só no app da Vulto.',
      'BEGIN:VALARM', 'TRIGGER:-PT30M', 'ACTION:DISPLAY', 'DESCRIPTION:Drop da Vulto em 30 minutos', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: `vulto-drop-${d.number}.ics` });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ics]'); if (!b) return;
    e.preventDefault(); downloadICS(byId[b.dataset.ics]);
  });

  /* ---------- app: loja certa para o aparelho, deep link quando existir ---------- */
  function platform() {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'ios';
    if (/Android/i.test(ua)) return 'android';
    return 'desktop';
  }
  const hasApp = () => !!(links.appIOS || links.appAndroid);
  /* Botões do app em HTML, ou '' quando não há link oficial. path: 'drop/drop-14', 'peca/slug'. */
  function appButtons(path = '', primary = '', secondary = '') {
    const p = platform();
    const store = p === 'ios' ? links.appIOS : p === 'android' ? links.appAndroid : null;
    const out = [];
    if (store) {
      if (links.appScheme) out.push(`<a class="${primary}" href="${links.appScheme}${path}">Abrir app</a>`);
      out.push(`<a class="${links.appScheme ? secondary : primary}" href="${store}" rel="noopener">Baixar app</a>`);
    } else if (p === 'desktop') {
      if (links.appIOS) out.push(`<a class="${secondary}" href="${links.appIOS}" rel="noopener">App Store</a>`);
      if (links.appAndroid) out.push(`<a class="${secondary}" href="${links.appAndroid}" rel="noopener">Google Play</a>`);
    }
    return out.join('');
  }

  const authorizedCommunity = (slug) => community.filter(c => c.authorized && c.src && (!slug || c.product === slug));

  /* Etiqueta de simulação: nunca deixa um teste parecer dado real. */
  if (simulating) {
    const tag = () => {
      const el = document.createElement('a');
      el.href = '?simular=limpar'; el.className = 'v-sim';
      el.textContent = 'Simulação · sair';
      el.setAttribute('style', 'position:fixed;left:12px;bottom:12px;z-index:300;font:500 10px/1 "IBM Plex Mono",monospace;letter-spacing:.18em;text-transform:uppercase;background:#f2efe6;color:#0b0b0a;padding:8px 10px;text-decoration:none');
      document.body.appendChild(el);
    };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', tag) : tag();
  }

  return { drops, byId, links, now, simulating, isConfirmed, nextDrop, inTeaser, dropWeek, justOpened,
    dropLabel, whenLabel, whenShort, dayMonth, clockHTML, paintClocks, startClocks, downloadICS, platform, hasApp, appButtons,
    community: authorizedCommunity, TEASER_DAYS };
})();
