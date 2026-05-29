# HDI Seguros — Mapa do Evento São João Caruaru 2026

## O que é este projeto

QR Code interativo para o stand da HDI Seguros no São João de Caruaru 2026. O QR aponta para uma landing page com o mapa do evento, itens proibidos e telefones de emergência. Um dashboard interno monitora os scans e interações em tempo real.

**Responsável:** Berg (glaustemberg@gmail.com) — dot. IAS

---

## URLs

| Destino | URL |
|---|---|
| Landing page (usuários) | https://hdi-mapa-junino.github.io/HDI.mapa.junino/ |
| Dashboard (interno HDI) | https://hdi-mapa-junino.github.io/HDI.mapa.junino/dashboard.html |
| Repositório GitHub | https://github.com/HDI-mapa-junino/HDI.mapa.junino |
| Dev local | http://localhost:3456 |

---

## Stack

**100% estático.** Sem framework, sem build step, sem servidor.

- HTML + CSS + JS puro
- Hospedagem: GitHub Pages (deploy automático via GitHub Actions a cada push em `main`)
- Fontes: Google Fonts — Outfit (títulos) + Inter (corpo)
- Gráficos: Chart.js 4.4.3 via CDN
- Mapa: Leaflet 1.9.4 via CDN (CartoCDN Light tiles)
- QR Code gerado localmente com `qrcode` + `jimp` (Node.js, apenas em dev)

**Deploy:** `git push origin main` → GitHub Actions (`.github/workflows/deploy.yml`) → GitHub Pages. Leva ~1 minuto para propagar.

---

## Arquivos

```
index.html          Landing page — o que o usuário vê ao escanear o QR
style.css           Estilos da landing page
app.js              Interatividade da landing page (modais, parallax, haptic)
analytics-config.js Configuração do GA4 (ainda não conectado)
analytics.js        Sistema de tracking: CounterAPI + ipapi.co + localStorage
dashboard.html      Dashboard interno HDI (auto-contido: CSS e JS inline)
generate-qr.js      Script Node.js para gerar qr-code.png (rodar manualmente)
qr-code.png         QR Code gerado apontando para a landing page
map-section.png     Imagem do mapa do evento (com hotspots clicáveis)
mapa-regiao.png     Mapa alternativo da região (não usado na landing atual)
HDI mapa.jpeg       Imagem original do mapa recebida do cliente
```

---

## Sistema de Analytics

### Camadas de tracking

1. **CounterAPI** — banco de dados principal, zero configuração, persistente entre dispositivos
2. **localStorage** — log de eventos do dispositivo atual (feed no dashboard)
3. **GA4** — configurado mas ainda não conectado (`GA4_MEASUREMENT_ID: 'G-XXXXXXXXXX'` em analytics-config.js)

### CounterAPI

**Namespace:** `hdi_saojoao_caruaru_2026`  
**Base URL:** `https://api.counterapi.dev/v1/hdi_saojoao_caruaru_2026`

**Incrementar:** `GET /{key}/up` → retorna `{ count: N }`  
**Ler:** `GET /{key}/` → retorna `{ count: N }`

**CORS:** usar `/up` sem barra final (com barra causa redirect 301 que quebra CORS).

### Counters existentes

| Chave | O que conta |
|---|---|
| `scans` | Cada acesso à landing page (= scan do QR) |
| `maps_clicks` | Cliques em "Como Chegar" |
| `stand_opens` | Abertura do modal Stand HDI |
| `cat_opens` | Abertura do modal C.A.T. Turista |
| `phone_samu` | Clique em SAMU 192 |
| `phone_defesa` | Clique em Defesa Civil 199 |
| `phone_bombeiros` | Clique em Corpo de Bombeiros 193 |
| `phone_civil` | Clique em Polícia Civil 197 |
| `phone_militar` | Clique em Polícia Militar 190 |
| `geo_{uf}` | Scans por estado brasileiro (ex: `geo_pe`, `geo_sp`) |
| `geo_internacional` | Scans fora do Brasil |
| `geo_city_{slug}` | Scans por cidade (ex: `geo_city_caruaru`) |
| `geo_city_outros` | Cidades não mapeadas na lista de ~80 cidades |

### Geolocalização (analytics.js)

No evento `qr_scan`, o script chama `https://ipapi.co/json/` (grátis, 1.000 req/dia) e em paralelo incrementa:
- o counter do estado: `geo_{region_code.toLowerCase()}`
- o counter da cidade: `geo_city_{slug}` ou `geo_city_outros`

**Sanitização do nome da cidade:**
```javascript
city.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')  // remove acentos
  .replace(/[^a-z0-9]+/g, '_')                        // espaços → _
  .replace(/^_+|_+$/g, '')                             // limpa bordas
```

**Limite do ipapi.co:** 1.000 chamadas/dia no plano gratuito. Para um evento local, é suficiente. Alternativa com mais quota: `https://ipwho.is/` (10.000/mês).

### Cidades mapeadas (80+)

Prioridade: toda Pernambuco (especialmente entorno de Caruaru), capitais do Nordeste, capitais nacionais e grandes cidades. Cidades não mapeadas → `geo_city_outros`.

A lista está em dois lugares (precisam ficar sincronizadas):
- `analytics.js` — array `KNOWN_CITIES` (slug keys)
- `dashboard.html` — objeto `CITY_MAP` (slug → nome display + UF)

**Para adicionar uma nova cidade:** adicionar o slug em `KNOWN_CITIES` no analytics.js e a entrada em `CITY_MAP` no dashboard.html.

---

## Design System

### Cores

| Variável | Hex | Uso |
|---|---|---|
| `--green` | `#006a2c` | Background principal, texto de destaque |
| `--green-light` | `#008f53` | Acentos, gradientes, ícones |
| `--green-dark` | `#00511f` | Background scroll/dark |
| `--white` | `#ffffff` | Cards, texto sobre verde |
| `--text-dark` | `#1c2e1c` | Texto principal em cards brancos |
| `--text-muted` | `#6b8a6b` | Texto secundário |

### Tipografia

- **Títulos:** Outfit (wght 400–800)
- **Corpo:** Inter (wght 300–700)

### Princípios visuais

- Fundo verde `#006a2c` + cards brancos `border-radius: 24px`
- Parallax: 4 orbs brancos translúcidos (`opacity: 0.055`) movidos via `requestAnimationFrame`
- Scroll reveal: `IntersectionObserver` com `opacity: 0 → 1` + `translateY(28px → 0)`
- Animação de entrada do hero: CSS `@keyframes heroIn`
- Easing: `--ease: cubic-bezier(0.4, 0, 0.2, 1)` | `--spring: cubic-bezier(0.34, 1.15, 0.64, 1)`
- Sombras: `box-shadow: 0 10px 40px rgba(0,0,0,0.18)` nos cards

---

## Landing Page (index.html)

### Estrutura de seções (ordem fixa — não alterar)

1. **Hero card** — logo HDI + divider gradiente + "Mapa do Evento" + "São João · Caruaru"
2. **Mapa** — `map-section.png` com dois hotspots clicáveis sobrepostos
3. **Botão "Como Chegar"** — link Google Maps (Pátio de Eventos Luiz Gonzaga, Caruaru)
4. **Itens Proibidos** — grid 2 colunas de chips com `✕` vermelho + aviso amarelo de crianças
5. **Telefones Úteis** — 5 cards de linha clicáveis (ligação direta)
6. **QR Badge** — texto de rodapé

### Hotspots do mapa

```css
.hotspot-stand { left: 28.5%; width: 28%; top: 83%; height: 14%; }
.hotspot-cat   { left: 58.5%; width: 31%; top: 83%; height: 14%; }
```

Posições calculadas em % sobre `map-section.png`. Se a imagem mudar, recalcular.

### Modais

- `#modal-stand` — Stand HDI Seguros
- `#modal-cat` — C.A.T. Turista
- Abrem com `.active`, fecham com backdrop click ou ESC

---

## Dashboard (dashboard.html)

### Acesso

Qualquer pessoa com o link consegue abrir. Sem autenticação.

### O que exibe (seções, ordem fixa)

1. **Header** — logo + título + live chip + horário da última atualização + botões CSV / PDF / Atualizar
2. **KPI Grid (4 cards)** — Scans totais | Taxa de engajamento | Rotas solicitadas | Ligações
3. **Interações + Telefones** — gráfico de barras Chart.js (Como Chegar / Stand / CAT) + ranking de ligações
4. **Mapa + Estados** — Leaflet Brasil com círculos proporcionais + ranking de estados
5. **Cidades** — grade responsiva com todas as cidades detectadas, ordenadas por volume
6. **Status bar** — fonte dos dados + countdown de próxima atualização

### Auto-refresh

A cada 30 segundos, busca todos os counters em paralelo. O countdown fica visível no header e no status bar. O botão "Atualizar" força uma atualização imediata.

### Fetch paralelo por ciclo

1. `fetchCounters()` — 9 counters principais
2. `fetchGeoData()` — 27 estados + 1 internacional
3. `fetchCityData()` — ~80 cidades

Total: ~117 fetches paralelos por ciclo. Completam em ~200ms.

### Exportação

- **CSV:** BOM UTF-8 (compatível Excel), inclui métricas gerais + interações + ligações + estados + cidades
- **PDF:** `window.print()` com CSS de impressão (`@media print`) — fundo branco, sem botões

---

## Mapa Leaflet (no dashboard)

- Tiles: CartoCDN Light (`cartocdn.com/light_all`)
- Centro: `[-14.24, -51.93]` zoom 4 (Brasil inteiro visível)
- Marcadores: `L.circleMarker` verde, raio proporcional ao volume (10–40px)
- Tooltip: nome do estado + UF + contagem

---

## Regras de desenvolvimento

### O que manter

- Cores exatas do design system (sem escurecer ou clarear sem motivo)
- Ordem das seções em ambas as páginas
- Todos os counters do CounterAPI (nunca apagar, só adicionar)
- Listas `KNOWN_CITIES` e `CITY_MAP` sincronizadas
- Dados 100% reais no dashboard — sem modo simulado ou dados inventados

### O que evitar

- Adicionar backend ou banco de dados (projeto é 100% estático)
- Mudar o namespace do CounterAPI (`hdi_saojoao_caruaru_2026`) — isso zeraria todos os dados históricos
- Usar `background-attachment: fixed` (não funciona em iOS Safari)
- `backdrop-filter` antes de `-webkit-backdrop-filter` (CSS lint warning)
- Usar `git push --force` no repositório

### Deploy

```bash
git add .
git commit -m "feat/fix/chore: descrição"
git push origin main
# Aguardar ~1 min para GitHub Actions propagar
```

### Servidor de desenvolvimento local

```bash
node -e "
  const http=require('http'),fs=require('fs'),path=require('path');
  const mime={'html':'text/html','css':'text/css','js':'text/javascript','png':'image/png'};
  http.createServer((req,res)=>{
    let f=path.join('.',req.url==='/'?'/index.html':req.url);
    try{const d=fs.readFileSync(f);res.writeHead(200,{'Content-Type':mime[f.split('.').pop()]||'text/plain'});res.end(d);}
    catch(e){res.writeHead(404);res.end('Not found');}
  }).listen(3456,()=>console.log('http://localhost:3456'));
"
```

### Regenerar QR Code

```bash
node generate-qr.js
# Gera qr-code.png apontando para SITE_URL
```

---

## Limitações conhecidas

| Limitação | Detalhe |
|---|---|
| ipapi.co: 1.000 req/dia grátis | Para eventos > 1.000 scans/dia, trocar por `ipwho.is` (10k/mês) |
| Cidades fora da lista → `outros` | Adicionar manualmente em `KNOWN_CITIES` + `CITY_MAP` para rastrear |
| GA4 não conectado | `analytics-config.js` ainda tem `G-XXXXXXXXXX` placeholder |
| CounterAPI sem autenticação | Qualquer pessoa com a URL pode ler (aceitável, dados são públicos) |
| Histórico sem timestamp | CounterAPI armazena apenas contagem total, sem série temporal |
| Localização por IP | IP pode estar mascarado por VPN; acurácia ~90% no nível de cidade |
