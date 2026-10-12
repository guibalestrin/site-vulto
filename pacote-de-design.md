# Pacote de design: Vulto, Drop Nº 1: Exclusividade

Nível 1 (jornada única de 6 segundos). Marca fictícia. Formulário só de demonstração.

## 1. A premissa da marca

"Vulto" é o que você vê de relance e some. A Vulto faz dez anos de rua em 2026 e abre a série numerada com o Drop Nº 1: Exclusividade. Poucas peças, todas numeradas: quem viu, viu. Mas a exclusividade aqui não é de bot nem de grupo VIP: é de quem está na lista. A lista é a fila de quem é de casa. Cada seção vende essas duas metades juntas, a peça que poucos vão ter e a comunidade que chega antes.

## 2. A paleta como tokens CSS (direção; valores finais amostrados da filmagem aprovada)

Mundo das fotos de referência: concreto cinza molhado, fachada preta, vidro, céu nublado, creme das camisetas, e uma explosão de cor de grafite usada só no acento.

```css
:root{
  --canvas:#16181a;        /* concreto escuro, nunca preto puro */
  --panel:#202326;         /* placa de concreto */
  --accent:#ff3f86;        /* rosa spray do grafite: CTA e ênfase rara */
  --accent-hover:#ff6aa1;
  --accent-muted:rgba(255,63,134,.22);
  --text-secondary:#a8a59d;
  --text-primary:#efe9dc;  /* creme das camisetas */
}
```

## 3. O trio de fontes

- Display: **Dela Gothic One** 400 (gótica japonesa pesada, desenha o katakana ヴルト e o latim no mesmo peso; eco da origem dos drops em Tóquio e da camiseta da referência).
- Texto: **Schibsted Grotesk** 400, 500, 700.
- Mono: **IBM Plex Mono** 400, 500 (placas numeradas, senhas, rótulos).
- O logotipo VULTO é redesenhado à mão em SVG (as letras pesadas com os cortes em ângulo no V e no T).

## 4. O mapa de faixas (hero de 400vh; intervalos são pontos de partida)

| Faixa | Intervalo | Momento da filmagem | Texto (ao pé da letra) | Entrada |
|---|---|---|---|---|
| 1 | 0.00 a 0.27 | céu nublado entre torres de vidro, câmera começando a descer | kicker "VULTO · DROP Nº 1" / título "Quem viu, viu." / sub "Uma peça. Numerada. Só para quem está na lista." | (f) deriva para baixo, com rampa de carregamento |
| 2 | 0.31 a 0.58 | descendo pelas fachadas de concreto e vidro | título "Esgota em minutos." / sub "Sem gincana. Sem bot. Sem senha no grupo VIP." | (d) soco de palavra no "minutos" |
| 3 | 0.62 a 0.84 | chegando na calçada, a fila aparece | título "A fila é de quem é de casa." / sub "Dez anos de rua. A lista chega antes." | (b) alinhamento em grade, letras entrando em fila |
| 4 | 0.88 a 1.00 | repouso: fachada preta, vitrine com a caixa de vidro | kicker "SEXTA, 13 DE NOVEMBRO · 11H" / título "Drop Nº 1: Exclusividade" / sub "Entra na lista e vê antes de todo mundo." / CTA "Entrar na lista" | (e) subida em etapas |

Composição: a ação desce pela faixa central; as legendas 1 a 3 ladeiam (esquerda, direita, esquerda). O assentamento senta sobre a fachada preta, que é a região calma do quadro final.

## 5. Hero estático (celular e movimento reduzido)

Kicker "VULTO · DROP Nº 1" / título "Quem viu, viu." / sub "Drop Nº 1: Exclusividade. Uma peça numerada, só para quem está na lista." / CTA "Entrar na lista" e link "Ver o drop".

## 6. Esboço abaixo da dobra

**Nav:** logo VULTO · O drop · A lista · Lojas · Perguntas · botão "Entrar na lista".

**A. O drop (as peças)** — kicker "DROP Nº 1 · EXCLUSIVIDADE" / título "Três peças. Nenhuma repete." / lede "Cada peça sai com o número dela bordado por dentro. Acabou o número, acabou a peça."
- Moletom Vitrine · "O da caixa de vidro. Grafite pintado em cima de moletom pesado de 480 g." · R$ 459 · 300 peças
- Camiseta ヴルト · "Algodão grosso, corte largo, caveira e katakana na frente." · R$ 189 · 500 peças
- Jeans Concreto · "Lavagem clara, desgaste feito à mão, corte reto." · R$ 349 · 200 peças
Cada cartão tem a placa numerada estilo vitrine (mono): "Nº 001 a 300".

**B. A lista (como funciona + o momento interativo)** — título "Como a lista funciona" / 3 passos:
1. "Entra na lista." "Nome, e-mail e o seu tamanho. Leva trinta segundos."
2. "Pega a sua senha." "Um dia antes, chega um link só seu. Não dá para repassar, não dá para bot."
3. "Compra sem correr." "Uma peça de cada por pessoa. Online ou na loja, você escolhe."
Momento interativo: o dispensador de senha. "Segura para pegar sua senha" → enquanto segura, o contador gira; ao completar, uma senha impressa desliza com "Sua senha: Nº 1.249" e "Na fila de verdade, você estaria aqui. Na lista, você chega antes." Soltar cedo desce o contador suave.

**C. A rua (comunidade)** — imagem da fila na calçada / título "Dez anos de calçada." / lede "A Vulto começou na internet em 2016 e foi para a rua. Hoje são três lojas pequenas e uma fila que vira encontro." / contador "12.480 na lista" / citações:
- "Pela primeira vez não perdi drop para bot." · Lari, 19, Guarulhos
- "Fui na fila do último drop sozinho e voltei com cinco amigos." · Davi, 22, Curitiba
- "A peça acaba, mas a galera fica." · Mel, 24, Rio

**D. Lojas** — título "Três lojas. Todas pequenas." / "São Paulo · Pinheiros" "Rio · Botafogo" "Curitiba · Centro" / nota "No dia do drop, quem está na lista também retira na loja."

**E. Perguntas** (objeções reais da pesquisa)
- "É sorteio?" "Não. Quem está na lista recebe o link antes. Se a peça do seu tamanho existir, ela é sua."
- "Bot consegue entrar?" "O link é único, vale para um e-mail e uma compra. Bot não tem senha."
- "Tem limite por pessoa?" "Uma peça de cada modelo. Assim mais gente leva."
- "Vai ter reposição?" "Não. Peça numerada não volta. Esse é o ponto."
- "Entrar na lista custa alguma coisa?" "Nada. Você só paga se comprar."
- "E se eu não estiver na lista?" "O que sobrar abre para todo mundo às 11h do dia 13. Costuma não sobrar."

**F. CTA final (formulário)** — título "Entra antes de esgotar." / campos: "Nome" (placeholder "Como te chamam"), "E-mail" ("voce@email.com"), "Tamanho" (P, M, G, GG, XG), "Cidade" ("Onde você mora") / botão "Entrar na lista" / sucesso: "Você está na lista. Sua senha chega por e-mail um dia antes do drop." / destino: estado de sucesso só em JS (demonstração; nada é enviado).

**Rodapé:** logo, "Vulto · streetwear desde 2016", lojas, "Vulto é uma marca fictícia criada para demonstração. Imagens geradas por IA. O formulário não envia dados."

## 7. Camada vetorial

- Logo VULTO em SVG à mão (nav, rodapé, favicon).
- Os cortes em ângulo do logo como divisórias de seção que se traçam no scroll.
- Linha pontilhada de picote de senha que se desenha entre os passos da lista.
- Katakana ヴルト gigante em contorno no fundo da seção do drop, derivando devagar.
- Ambiente fixo: grão de concreto + névoas de spray (rosa, violeta, ciano) derivando em ciclo de 70s, em nível de sussurro.
Tudo honra movimento reduzido.

## 8. Lista de engenharia

Blob com anel (se acima de 8 MB), interpolação normalizada por dt, seeks travados, DOM por delta, faixas ritmadas + teste de flick, legibilidade em quatro camadas, cinco portões vivos, completo sem vídeo, piso de qualidade, site inteiro animado.

## 9. Gate de texto

Todo texto acima embarca ao pé da letra. A página passa no grep de travessões e palavras de estoque, e na varredura de sinais de IA, antes de alguém ver. O staccato "Sem gincana. Sem bot. Sem senha no grupo VIP." é dispositivo de marca deliberado.
