# Combate de Presidentes — Guia

Overlay interativo para TikTok LIVE onde os presentes do público viram golpes
entre dois lutadores (padrão: Lula x Flávio Bolsonaro).

## Estrutura

```
src/
  routes/
    index.tsx            Painel do streamer (configuração, testes, histórico)
    overlay.tsx          Overlay transparente para o OBS (motor do jogo)
  components/game/
    FighterSprite.tsx    Sprite + animações (idle, soco, chute, especial, KO)
    HealthBar.tsx        Barra de vida + barra de energia
    GiftFeed.tsx         Feed lateral dos últimos presentes
  lib/game/
    types.ts             Tipos do jogo
    fighters.ts          Personagens (skins) + mapeamento padrão + settings
    gifts → fighters.ts  DEFAULT_RULES (presente → ação/dano/energia)
    bus.ts               Comunicação painel ↔ overlay (BroadcastChannel)
    sfx.ts               Sons sintetizados (soco, especial, KO, plateia)
    useFightEngine.ts    Regras da luta, HP, energia, combos, KO e reinício
    useTikTokLive.ts     Cliente WebSocket dos eventos da live
  assets/                Sprites dos lutadores (CDN)
```

## Conectar com a TikTok LIVE

1. Instale o **TikFinity** (ou Streamer.bot com plugin de TikTok) no PC.
2. Faça login com sua conta e ative o servidor de eventos
   (TikFinity: *Settings → Enable WebSocket server*, porta padrão `21213`).
3. No painel do app, informe seu `@` e a URL `ws://localhost:21213/`.
4. Deixe a aba do **overlay** aberta — ela é quem conecta e roda a luta.
   O status aparece no topo do overlay e no painel (conectado / conectando /
   reconectando / desconectado). A reconexão é automática.

Formatos de mensagem aceitos:

```json
{ "event": "gift", "data": { "nickname": "fulano", "giftName": "Rose",
  "repeatCount": 3, "diamondCount": 1, "giftType": 1, "repeatEnd": true } }
{ "type": "gift", "user": "fulano", "gift": "Rose", "count": 3, "coins": 1 }
```

## Colocar no OBS

1. Fontes → **Navegador**.
2. URL: `<endereço do app>/overlay`
3. Largura 1920 / Altura 1080 (ou 1280x720 — o layout é responsivo).
4. Marque "Desligar a fonte quando não estiver visível" desmarcado, para a
   luta continuar rodando.

## Presentes padrão

| Presente | Ação |
|---|---|
| Rose | Soco do lutador da esquerda |
| White Rose | Soco do lutador da direita |
| Doughnut | Especial do Lula |
| Capybara | Especial do Flávio |
| Mini Dino | Combo de 3 golpes |
| Perfume | Dano x2 por 20s |
| Sunglasses / Galaxy | Efeitos fortes (tremor, flash, partículas) |
| Heart Me | Cura |

Tudo é editável na tabela "Mapeamento de presentes" do painel (nome do
presente, quem ataca, ação, dano e energia). As configurações ficam salvas
no navegador.

## Empacotar para Windows (Electron)

```bash
npm install --save-dev electron @electron/packager
npx vite build
npx @electron/packager . "CombateDePresidentes" --platform=win32 --arch=x64 \
  --out=electron-release --overwrite --ignore='node_modules' --ignore='^/src'
```

Crie `electron/main.cjs` carregando `dist/index.html` (ou apontando para a
URL publicada), defina `"main": "electron/main.cjs"` no `package.json` e use
`base: './'` no `vite.config.ts` para o build local.
