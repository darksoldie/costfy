# COSTFY — DESIGN OVERHAUL RESEARCH & ARCHITECTURAL SYNTHESIS

**Documento:** DESIGN_OVERHAUL_RESEARCH.md  
**Autoria:** Principal Product Designer, Design Systems Architect & UX Architect  
**Data:** 02 de Setembro de 2026  
**Status:** Aprovado para Execução Global  
**Versão:** 2.0 (Executive Cockpit / Digital Business Operating System)

---

## 1. INTRODUÇÃO E NORTH STAR

O **Costfy** não é um dashboard administrativo genérico, nem um chatbot com gráficos, nem um clone de bibliotecas de componentes.  
O Costfy é o **Intelligent Operating System for Digital Businesses** — o ambiente único onde o empreendedor digital, gestor de tráfego, infoprodutor e fundador de e-commerce operam a totalidade do seu negócio.

### A Equação Mental do Produto:
$$\text{MacBook Pro} + \text{macOS} + \text{Software Corporativo de Precisão} + \text{Cockpit Executivo} = \mathbf{COSTFY}$$

### Princípio Reitor:
> **POWER UNDER THE HOOD. SIMPLICITY ON THE SURFACE.**  
> A enorme complexidade subjacente (mídia, vendas, DRE, CMV, atribuição first-party, automações e inteligência contextual) é organizada por meio de **divulgação progressiva (progressive disclosure)**, densidade informacional calibrada e hierarquia visual rigorosa.

---

## 2. ESTUDO DOS REPOSITÓRIOS DE REFERÊNCIA (GITHUB)

| Repositório | Stack Chave | Padrões Mais Fortes Identificados | Padrões Rejeitados | Motivo da Rejeição | Adaptação Canônica no Costfy |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Kiranism/tanstack-start-dashboard** | TanStack Start, TanStack Router, Radix UI, Tailwind | Shell com SSR hydration-safe, breadcrumb inteligente, roteamento tipado, layout estruturado em cascata. | Cartões genéricos sem hierarquia numérica, paleta cinza desbotada, tabelas sem alinhamento monetário estrito. | Falta de distinção para métricas financeiras; parece um esqueleto vazio sem personalidade executiva. | Estruturação do `AppShell` com navegação em 4 blocos operacionais, atalhos globais de teclado (`⌘K`, `⌘B`) e números tabulares (`tnum`). |
| **2. arhamkhnz/tanstack-shadcn-admin-dashboard** | TanStack Query, Radix, Tailwind | Densidade em interfaces de finanças e analytics, badges de variação percentual (deltas), filtros temporais inline. | Poluição visual por excesso de minigráficos decorativos (sparklines desnecessárias) e bordas redundantes em caixas isoladas. | Poluição visual (visual noise); dispersa o foco do tomador de decisão. | Faixa executiva unificada (`editorial-card`), onde métricas compartilham divisores sutis sem caixas brancas repetitivas. |
| **3. draco-china/shadcn-admin-template** | React, Tailwind, Lucide, Radix | Diálogos contextuais, sheets/drawers para edição sem perder a tela principal, trap de foco e acessibilidade WAI-ARIA. | Estética de template shadcn padrão (copiar/colar); botões com azul elétrico saturado em excesso; formulários gigantes. | O Costfy deve ter identidade própria inconfundível, não a aparência de um template pré-fabricado. | Drawers contextuais (Quick Brain) e modais com elevação em camadas, tipografia editorial e foco refinado. |
| **4. Radian-OS/radianui** | Radix Primitives, Tailwind, Design Tokens | Arquitetura de tokens consistente, microinterações refinadas em hover/active, escala harmoniosa de espaçamento. | Metáforas de janelas flutuantes simulando sistema operacional de desktop dos anos 90. | Ineficiente para SaaS web moderno de alta velocidade; adiciona atrito cognitivo. | Transposição da sensação tátil de fluidez do macOS para componentes web nativos, rápidos e previsíveis. |
| **5. eqtylab/equality** | Tailwind v4, Semantic CSS, Tokens | Mapeamento estrito em `@theme inline`, cores perceptualmente uniformes via OKLCH, eliminação total de classes arbitrárias. | Contraste acadêmico estéril, ausência de calor e sofisticação tátil. | Falta a sensação de "software caro e maduro". | Sistema de tokens OKLCH em `src/styles.css` com Deep Slate/Obsidian no Dark Mode e Branco Puro/Grafite no Light Mode. |
| **6. ropean/shadcn-admin-template** | TanStack, Tailwind, Tables | Alinhamento tabular estrito, paginação compacta, sticky headers em tabelas longas. | Conversão indiscriminada de tabelas em cards no mobile, destruindo a capacidade de comparação lado a lado. | Usuários corporativos precisam comparar linhas de dados mesmo em telas menores. | Tabelas com scroll horizontal suave com colunas fixas e alinhamento à direita para valores monetários. |

---

## 3. ESTUDO DOS PRODUTOS DE REFERÊNCIA DE CLASSE MUNDIAL

### 3.1 Apple (apple.com / macOS Sonoma & Sequoia)
- **O que extraímos:**
  - **Restrição visual e respiro calibrado:** o espaço em branco não é vazio desperdiçado; é estrutura de leitura.
  - **Qualidade de sombra (Apple Shadows):** sombras suaves, multicamadas, com dispersão ampla e baixa opacidade, combinadas com bordas ultrafinas de 1px.
  - **Sensação de material:** superfícies que parecem físicas, sólidas e precisas.
  - **Tipografia confiante:** títulos nítidos, peso semibold em vez de bold pesado, números destacados.
- **O que não copiar:** Estilo puramente de marketing de consumo; o Costfy precisa de maior densidade de dados do que uma página de produto da Apple.

### 3.2 Vercel (vercel.com)
- **O que extraímos:**
  - **Disciplina monocromática:** o preto, branco e grafite conduzem 90% da interface; a cor de destaque (Royal Blue) é cirúrgica.
  - **Precisão de linhas (hairlines):** divisores de 1px que separam blocos sem necessidade de criar caixas pesadas.
  - **Tipografia com números tabulares (`tnum`):** colunas de métricas que nunca oscilam na tela.
- **O que não copiar:** Estética fria voltada exclusivamente a desenvolvedores de infraestrutura; o Costfy conversa com empreendedores e líderes de negócios.

### 3.3 Notion (notion.com)
- **O que extraímos:**
  - **Mentalidade de Workspace:** o usuário sente que está dentro do seu espaço de trabalho, não em um navegador web.
  - **Simplicidade de comandos:** busca global rápida e comandos contextuais.
  - **Divulgação progressiva:** ações avançadas aparecem sob demanda sem poluir a visão inicial.
- **O que não copiar:** Visual informal de documento em branco; o Costfy é um cockpit operacional com métricas financeiras críticas.

### 3.4 UTMify (utmify.com.br)
- **O que extraímos:**
  - **Densidade operacional prática:** visão clara de campanhas, pedidos e cliques de forma direta.
  - **Foco na dor do cliente:** exibição imediata do ROAS, CPA e Lucro Real sem rodeios.
- **O que não copiar:** Layout saturado, estética de marketing direto agressivo e cards coloridos excessivos.

---

## 4. MATRIZ DE DECISÕES DE DESIGN DO COSTFY

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                COSTFY VISUAL SYSTEM                                    │
│                                                                                        │
│   [Estrutura]       Deep Navy / Slate / Charcoal (Dark)  •  Pure White / Slate (Light) │
│   [Acento]          Discreet Royal Blue (oklch 0.48 0.22 265)                          │
│   [Semântica]       Refined Emerald (Lucro/Sucesso) • Crimson (Alerta) • Amber (Aviso) │
│   [Tipografia]      Inter UI + Tabular Figures + Micro-Tracking Geométrico             │
│   [Superfície]      Hairline 1px + Multi-layer Soft Shadows + Radius 8px/12px/16px     │
│   [Inteligência]    Brain Contextual (Sem Robôs, Sem Brilhos Roxos, Sem AI-Slop)       │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Tipografia
- **Família:** `Inter`, com fallbacks do sistema macOS (`-apple-system`, `BlinkMacSystemFont`, `SF Pro Text`).
- **Números e Métricas:** Obrigatório uso de `font-variant-numeric: tabular-nums` e `font-feature-settings: "tnum", "cv02", "cv03", "cv04"`.
- **Escala:**
  - `type-metric-hero`: 28px - 36px (Semibold, tabular, tracking -0.03em) — Usado exclusivamente no topo do Dashboard e DRE.
  - `type-metric-card`: 20px - 24px (Semibold, tabular, tracking -0.025em).
  - `type-h1`: 24px - 32px (Semibold, tracking -0.028em).
  - `type-h2`: 18px - 22px (Semibold, tracking -0.02em).
  - `type-h3`: 14px - 16px (Semibold, tracking -0.015em).
  - `type-body`: 14px (Regular, line-height 1.6).
  - `type-body-sm`: 13px (Regular, line-height 1.5).
  - `type-label-subtle`: 11px (Medium, uppercase, tracking 0.05em, text-muted-foreground).

### 4.2 Iconografia
- **Sistema Único:** `Lucide React` com espessura de traço consistente (`stroke-width: 1.5px` a `1.75px` para ícones pequenos de 14-16px).
- **Regra de Ouro:** Ícones nunca são usados como enfeites gigantes flutuantes; sempre acompanham um rótulo ou ação semântica clara.

### 4.3 Sistema de Cores (OKLCH Semântico)
- **Azul Costfy:** Uso reservado a ações primárias, estados ativos de navegação, links contextuais e seleção. **Nunca como fundo de telas inteiras.**
- **Neutros:**
  - *Light Mode:* Fundo `oklch(0.992 0.002 264)` (off-white limpo), Superfície `oklch(1 0 0)` (branco puro), Borda `oklch(0.915 0.004 264)`.
  - *Dark Mode:* Fundo `oklch(0.145 0.012 260)` (deep charcoal/navy suave), Superfície `oklch(0.175 0.014 260)`, Borda `oklch(0.25 0.014 260)`.
- **Semânticos:**
  - Sucesso/Lucro: Verde esmeralda calibrado (`oklch(0.56 0.15 156)` / dark: `oklch(0.7 0.16 158)`).
  - Prejuízo/Erro: Carmesim refinado (`oklch(0.56 0.21 27)` / dark: `oklch(0.65 0.2 25)`).
  - Aviso/Ponto de Atenção: Âmbar corporativo (`oklch(0.68 0.15 70)` / dark: `oklch(0.76 0.14 72)`).

### 4.4 Sombras & Elevação (Apple-Grade)
- `shadow-apple-subtle`: `0 1px 2px 0 rgba(0, 0, 0, 0.04)` — botões secundários, inputs.
- `shadow-apple-card`: `0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 4px 12px -2px rgba(0, 0, 0, 0.03)` — cartões principais.
- `shadow-apple-elevated`: `0 8px 24px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)` — modais, command bar.
- `shadow-apple-flyout`: `0 12px 36px -6px rgba(0, 0, 0, 0.14), 0 4px 12px -2px rgba(0, 0, 0, 0.06)` — menus e Quick Brain drawer.

### 4.5 Raio de Arredondamento (Radius Contextual)
- `sm` (4px): Badges, tags de status, tooltips.
- `md` (8px): Botões, inputs, controles de formulário, células destacadas.
- `lg` (12px): Cartões do dashboard, seções editoriais, painéis de DRE.
- `xl` (16px): Modais, Command Center, Quick Brain drawer.

---

## 5. BLACKLIST ABSOLUTA DE AI-SLOP

O Costfy Brain é **inteligência operacional real**, não uma gimmick futurista. Elementos estritamente banidos:
- ❌ Gradientes roxos/magenta estilo "SaaS de IA genérico".
- ❌ Estrelinhas (✨), brilhos fluorescentes e neons.
- ❌ Cartões de vidro translúcido flutuantes com desfoque excessivo (glassmorphism exagerado).
- ❌ Robôs literais, cérebros 3D ou ilustrações espaciais.
- ❌ Balões de conversa genéricos de chatbot que imitam o ChatGPT.
- ❌ Partículas em movimento ou linhas de conexão aleatórias.

O Brain se comunica através de **diagnósticos executivos estruturados**, dados precisos, cálculos de causa-raiz e propostas com botão de aprovação imediata.

---

## 6. PLANO DE APLICAÇÃO EM TODAS AS TELAS

1. **App Shell & Navegação:** Sidebar compacta estilo macOS, topbar ultraleve, Workspace Switcher refinado.
2. **Command Center (`⌘K`):** Centro de comando operacional completo (navegação, busca de entidades, diagnósticos e ações).
3. **Dashboard (Cockpit):** Faixa de KPIs unificada, decomposição do faturamento, bloco do Brain e links operacionais.
4. **Financeiro & DRE:** Cascata contábil de alta precisão, sem cartões redundantes, foco em margem e lucro real.
5. **Marketing, Vendas, Tracking, Analytics, Brain, Automações, Relatórios, Auditoria, Integrações, Time, Configurações:** Unificação sob o mesmo vocabulário visual.
6. **Mobile Experience:** Navegação inferior dedicada, adaptação tátil de tabelas e filtros em sheets.
