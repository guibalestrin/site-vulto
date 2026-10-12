# Pacote de design: Vulto, Drop Nº 1: Exclusividade

Nível 2 (jornada encadeada de 3 trechos de 6 segundos). Marca fictícia. Formulário só de demonstração.

## 1. A premissa da marca

"Vulto" é o que você vê de relance e some. A Vulto faz dez anos de rua em 2026 e abre a série numerada com o Drop Nº 1: Exclusividade. Poucas peças, todas numeradas: quem viu, viu. Mas a exclusividade aqui não é de bot nem de grupo VIP: é de quem está na lista. A lista é a fila de quem é de casa. Cada seção vende essas duas metades juntas, a peça que poucos vão ter e a comunidade que chega antes.

## 2. A paleta como tokens CSS (direção; valores finais amostrados da filmagem aprovada)

Mundo do filme: algodão preto, tinta branca rachada, concreto bruto paulista, escuro texturizado. Monocromático de propósito; nada de neon. O acento é o branco-giz da tinta, usado com raridade sobre o escuro.

```css
:root{
  --canvas:#0f0f0e;        /* carvão com grão, tingido para a filmagem, nunca preto puro */
  --panel:#1a1a18;         /* concreto no escuro */
  --accent:#f2efe6;        /* branco-giz da tinta: CTA e ênfase rara */
  --accent-hover:#ffffff;
  --accent-muted:rgba(242,239,230,.16);
  --text-secondary:#9a978f;
  --text-primary:#e9e6dd;
}
```

## 3. O trio de fontes

- Display: **Dela Gothic One** 400 (gótica pesada para os momentos grandes, parente do blackletter da estampa).
- Texto e rótulos largos: **Schibsted Grotesk** 400, 500, 700; versal com tracking largo para kickers (como na referência "ENTRE NA LISTA DE ESPERA").
- Mono: **IBM Plex Mono** 400, 500 (numeração, senha, contador).
- O logotipo VULTO é redesenhado à mão em SVG.

## 4. O mapa de faixas (jornada encadeada de 18s, hero de ~1000vh; intervalos são pontos de partida)

Storyboard: K1 camiseta preta oversized com caveira e VULTO em tinta branca rachada, pendurada no concreto brutalista de São Paulo → S1 a câmera avança até a estampa → K2 macro da tinta rachada na caveira → S2 a tinta se solta do algodão, vira líquido, fumaça e fragmentos girando em volta de um centro, acelerando até formar um portal com profundidade → K3 dentro do portal → S3 a câmera atravessa, desacelera e sai num escuro texturizado → K4 repouso: um anel fino de tinta seca, resquício do portal.

| Faixa | Intervalo | Momento da filmagem | Texto (ao pé da letra) | Entrada |
|---|---|---|---|---|
| 1 | 0.00 a 0.22 | camiseta no concreto, câmera começando a avançar | kicker "VULTO · DROP Nº 1" / título "Quem viu, viu." / sub "Uma peça. Numerada. Só para quem está na lista." | (g) aproximação da profundidade, com rampa de carregamento |
| 2 | 0.27 a 0.50 | macro da estampa, a tinta começa a rachar e soltar | título "Esgota em minutos." / sub "Sem gincana. Sem bot. Sem senha no grupo VIP." | (a) dispersão: letras se juntam como lascas de tinta |
| 3 | 0.55 a 0.76 | a tinta gira e forma o portal | título "A fila é de quem é de casa." / sub "Dez anos de rua. A lista chega antes." | rotação: palavras entram girando em torno do centro, ecoando o vórtice |
| 4 | 0.86 a 1.00 | repouso no escuro com o anel | kicker "VULTO® · PRÓXIMO DROP" / título "Drop Nº 1: Exclusividade" / sub "Entre na lista de espera. Seja o primeiro a saber." / CTA "Quero acesso ao drop" | (e) subida em etapas |

Composição: a ação vive no centro; as faixas 1 a 3 ladeiam (esquerda, direita, esquerda). O assentamento senta centrado em volta do anel.

## 5. Hero estático (celular e movimento reduzido)

Kicker "VULTO · DROP Nº 1" / título "Quem viu, viu." / sub "Drop Nº 1: Exclusividade. Uma peça numerada, só para quem está na lista." / CTA "Entrar na lista" e link "Ver o drop".

## 6. Esboço abaixo da dobra

**Nav:** logo VULTO · O drop · A lista · Lojas · Perguntas · botão "Entrar na lista".

**A. O drop (as peças)** — kicker "DROP Nº 1 · EXCLUSIVIDADE" / título "Três peças. Nenhuma repete." / lede "Cada peça sai com o número dela bordado por dentro. Acabou o número, acabou a peça."
- Camiseta Caveira · "A do filme. Algodão de 260 g, corte oversized, caveira em tinta branca rachada." · R$ 229 · 300 peças
- Moletom Portal · "Moletom pesado de 480 g com o anel de tinta bordado nas costas." · R$ 459 · 150 peças
- Jeans Concreto · "Lavagem clara, desgaste feito à mão, corte reto." · R$ 349 · 200 peças
Cada cartão tem a placa numerada estilo vitrine (mono): "Nº 001 a 300".

**B. A lista (como funciona + o momento interativo)** — título "Como a lista funciona" / 3 passos:
1. "Entra na lista." "Nome, e-mail e o seu tamanho. Leva trinta segundos."
2. "Pega a sua senha." "Um dia antes, chega um link só seu. Não dá para repassar, não dá para bot."
3. "Compra sem correr." "Uma peça de cada por pessoa. Online ou na loja, você escolhe."
Momento interativo: abrir o portal. "Segura para abrir" → enquanto o visitante segura, o anel de tinta se desenha em volta do botão; soltar cedo faz o anel recuar suave. Ao fechar o anel, uma senha impressa desliza de dentro dele: "Sua senha: Nº 12.481" e "Na fila da porta, você estaria lá atrás. Na lista, você entra antes." Os três passos acendem em sequência.

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
- O anel de tinta seca do fim do filme como motivo recorrente (selo, botão, carregamento).
- Linha pontilhada de picote de senha que se desenha entre os passos da lista.
- "Nº 1" gigante em contorno no fundo da seção do drop, derivando devagar.
- Ambiente fixo: grão de carvão + uma névoa cinza de fumaça de tinta derivando em ciclo de 70s, em nível de sussurro.
Tudo honra movimento reduzido.

## 8. Lista de engenharia

Blob com anel (se acima de 8 MB), interpolação normalizada por dt, seeks travados, DOM por delta, faixas ritmadas + teste de flick, legibilidade em quatro camadas, cinco portões vivos, completo sem vídeo, piso de qualidade, site inteiro animado.

## 9. Gate de texto

Todo texto acima embarca ao pé da letra. A página passa no grep de travessões e palavras de estoque, e na varredura de sinais de IA, antes de alguém ver. O staccato "Sem gincana. Sem bot. Sem senha no grupo VIP." é dispositivo de marca deliberado.
