# COSTFY — DESIGN SYSTEM SPECIFICATION (v2.0)

**Intelligent Operating System for Digital Businesses**  
*Documento Canônico de Design Tokens, Componentes, Layout e Interação*

---

## 1. PRINCÍPIOS FUNDAMENTAIS

1. **Power Under the Hood, Simplicity on the Surface:** A interface nunca expõe toda a sua complexidade de uma só vez. Aplica-se **divulgação progressiva (progressive disclosure)** em todas as telas.
2. **MacBook Pro & macOS Mental Model:** Uma experiência tátil, sólida, precisa e de alta fidelidade. O Costfy é um **ambiente de trabalho**, não uma coleção desconexa de páginas.
3. **Data over Chrome:** O contorno e a moldura do software recuam para dar protagonismo absoluto aos números, tendências e decisões do negócio.
4. **Zero AI-Slop:** Banimento de gradientes roxos, estrelas decorativas, robôs e cartões flutuantes. A inteligência do Brain é expressa por clareza, relevância e acionabilidade.
5. **Precisão Numérica:** Toda métrica monetária e percentual utiliza alinhamento tabular (`tabular-nums`) e pesos calibrados.

---

## 2. DESIGN TOKENS (CSS & TAILWIND)

### 2.1 Tipografia & Escala de Rótulos

| Token | Tamanho / Line-Height | Peso | Tracking | Uso |
| :--- | :--- | :--- | :--- | :--- |
| `type-display` | `clamp(2.75rem, 6vw, 4.25rem)` / 1.02 | Semibold (600) | -0.035em | Hero da Landing Page |
| `type-metric-hero` | `clamp(1.75rem, 2.5vw, 2.25rem)` / 1.15 | Semibold (600) | -0.03em (tnum) | KPIs do Dashboard e Lucro Real da DRE |
| `type-metric-card` | `1.4rem` / 1.2 | Semibold (600) | -0.025em (tnum) | Cartões de métricas secundárias |
| `type-h1` | `clamp(1.5rem, 2.5vw, 1.875rem)` / 1.2 | Semibold (600) | -0.025em | Título da página no AppShell |
| `type-h2` | `1.25rem` / 1.3 | Semibold (600) | -0.02em | Títulos de seção do cockpit |
| `type-h3` | `0.9375rem` / 1.4 | Semibold (600) | -0.015em | Títulos de cartões e tabelas |
| `type-body` | `0.875rem` (14px) / 1.55 | Regular (400) | -0.006em | Texto corrido padrão |
| `type-body-sm` | `0.8125rem` (13px) / 1.5 | Regular (400) | 0 | Textos de apoio e tabelas |
| `type-label-subtle` | `0.6875rem` (11px) / 1.4 | Medium (500) | 0.05em (uppercase) | Cabeçalhos de colunas e mini-labels |

### 2.2 Cores Semânticas (Espaço OKLCH)

```css
/* Light Mode */
--background: oklch(0.992 0.002 264);        /* Base limpa off-white */
--foreground: oklch(0.18 0.015 264);         /* Grafite neutro profundo */
--surface: oklch(0.978 0.003 264);           /* Painéis e fundos de tabelas */
--card: oklch(1 0 0);                        /* Branco puro para cartões */
--border: oklch(0.915 0.004 264);            /* Hairline sutil */
--border-strong: oklch(0.84 0.008 264);     /* Bordas de controle e foco */
--primary: oklch(0.48 0.22 265);             /* Royal Blue discreto */
--primary-foreground: oklch(1 0 0);
--muted-foreground: oklch(0.48 0.014 264);   /* Texto secundário */
--success: oklch(0.56 0.15 156);             /* Esmeralda / Lucro */
--destructive: oklch(0.56 0.21 27);          /* Carmesim / Prejuízo / Erro */
--warning: oklch(0.68 0.15 70);              /* Âmbar / Alerta */

/* Dark Mode */
--background: oklch(0.145 0.012 260);        /* Deep Obsidian */
--foreground: oklch(0.96 0.004 260);         /* Branco suave */
--surface: oklch(0.175 0.014 260);           /* Superfície elevada nível 1 */
--card: oklch(0.175 0.014 260);              /* Superfície de cartão */
--elevated: oklch(0.21 0.016 260);          /* Superfície de menus e modais */
--border: oklch(0.25 0.014 260);             /* Hairline dark mode */
--border-strong: oklch(0.34 0.016 260);
--primary: oklch(0.68 0.19 258);             /* Royal Blue iluminado */
--primary-foreground: oklch(0.12 0.01 260);
--muted-foreground: oklch(0.65 0.012 260);
```

### 2.3 Raio de Arredondamento (Radius Contextual)
- `rounded-sm` (4px): Badges, tooltips, tags de status.
- `rounded-md` (8px): Botões, inputs, selects, segmented controls.
- `rounded-lg` (12px): Cartões do dashboard, seções do cockpit, blocos de DRE.
- `rounded-xl` (16px): Modais, Command Center (`⌘K`), Quick Brain Drawer (`⌘B`).

### 2.4 Sombras Apple-Grade
- `shadow-subtle`: `0 1px 2px 0 rgba(0, 0, 0, 0.04)`
- `shadow-raised`: `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.03)`
- `shadow-overlay`: `0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)`

---

## 3. PADRÕES DE COMPONENTES E HIERARQUIA

### 3.1 Cartões e Cockpits (`editorial-card`)
- Os cartões nunca são caixas brancas isoladas competindo entre si.
- Métricas correlatas compartilham faixas unificadas com divisores internos verticais (`sm:divide-x divide-border`), reduzindo ruído e facilitando comparações horizontais.

### 3.2 Tabelas Corporativas
- Tabelas operam com alinhamento tabular rigoroso:
  - Textos e identificadores alinhados à esquerda.
  - Status e datas centralizados ou discretos.
  - **Valores monetários, cliques, impressões e taxas alinhados obrigatoriamente à direita** com `type-numeric`.
  - Linhas com efeito hover sutil (`hover:bg-secondary/40 transition-colors`).

### 3.3 Barra de Comandos (`⌘K` — Costfy Control Center)
- Ponto central de navegação rápida por teclado.
- Suporta atalhos de navegação entre rotas, busca de entidades (pedidos, campanhas) e comandos rápidos de ação.

### 3.4 Quick Brain Drawer (`⌘B`)
- Painel lateral contextual com diagnóstico imediato do workspace.
- Apresenta anomalias detectadas, Health Score dinâmico e propostas de ação com prévia "Antes vs. Depois".
- Permite aprovação de ações operacionais em 1 clique com garantia de guardrails e registro em trilha de auditoria.

### 3.5 Navegação Mobile
- Barra de navegação inferior tátil e fluida para telas abaixo de 768px.
- Menu de seções complementares expansível em bottom sheet sem perda de contexto.
