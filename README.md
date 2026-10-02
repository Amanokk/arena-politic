# President's Brawl

Lula ( primeira imagem ) Flávio ( segunda imagem) Crie um aplicativo completo de overlay interativo para TikTok LIVE chamado “Combate de Presidentes”.



Conceito do jogo



É uma luta em tempo real entre dois personagens políticos (padrão: Lula vs Flávio Bolsonaro). O streamer controla a transmissão e o público interage enviando presentes (gifts) do TikTok. Cada presente dispara um ataque, especial ou efeito visual/sonoro.



Funcionalidades principais



Conexão com TikTok LIVE



O usuário digita o @ do TikTok uma vez.



O app deve se conectar aos eventos de live (comentários e presentes) em tempo real.



Preferência por solução estável (TikTok Live API oficial se disponível, ou integração com ferramentas como TikFinity, StreamElements, ou websocket customizado).



Mostrar status de conexão (conectado / desconectado / reconectando).



Personagens



Dois lutadores lado a lado na tela:



Lula (esquerda)



Flávio Bolsonaro (direita)



Cada um com:



Barra de vida (HP)



Avatar/imagem



Animações de idle, golpe normal, golpe especial e derrota



Permitir trocar os personagens depois (sistema de skins).



Sistema de presentes (gifts)



Mapear os presentes mais comuns do TikTok para ações:



Rosa → Golpe normal do personagem correspondente



Rosa branca → Golpe do outro personagem



Rosquinha → Especial do Lula



Capivara → Especial do Flávio



Mini Dino → Combo de 3 golpes



Perfume → Aumento temporário de dano



Óculos / Galáxia → Efeitos visuais fortes (tela tremendo, partículas, etc.)



Cada presente deve:



Causar dano proporcional ao valor do presente



Mostrar o nome de quem enviou + o presente na tela



Tocar um som e animação



Interface do jogo (Overlay)



Fundo transparente (para usar no OBS ou como overlay nativo)



Barras de vida no topo



Nome dos personagens



Contador de “golpes enviados”



Feed lateral mostrando os últimos presentes recebidos



Animação de KO quando um personagem chega a 0 HP (reinicia automaticamente após 5 segundos)



Painel do streamer (fora do overlay)



Botão para resetar a luta



Ajuste de volume dos efeitos



Configuração de quais presentes ativam o quê



Histórico de presentes da live atual



Seletor de personagens



Tecnologias sugeridas



Frontend do overlay: HTML + CSS + JavaScript (ou React)



Ou Godot 4 / Unity (mais fácil para animações)



Backend: Node.js simples para gerenciar a conexão com a live



Empacotar como:



App Windows (Electron ou Tauri)



App Android (opcional)



Extras importantes



Sistema de “energia” ou “especial” que carrega com presentes



Efeitos de tela (shake, flash, partículas)



Sons de soco, especial e plateia



Responsivo (funciona em 1080p e 720p)



Fácil de colocar no OBS (fonte Browser ou janela)



Entrega esperada



Estrutura completa de pastas do projeto



Código funcional do overlay



Sistema de mapeamento de presentes



Interface de configuração



Instruções de como conectar com a live do TikTok



Como empacotar para Windows

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://arena-politic.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b74f4b8b-ae95-47ef-be19-b651c6606591).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
