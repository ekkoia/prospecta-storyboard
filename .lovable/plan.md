

# Aplicar Design System Crextio ao Dashboard

## Resumo
Migrar todo o dashboard do visual atual (slate escuro, fonte padrao) para o design system Crextio: fonte **Bai Jamjuree**, paleta com amarelo premium como accent, suporte a dark/light mode, cards com sombras customizadas, e layout com sidebar.

## O que muda

### 1. Fonte e index.html
- Adicionar link do Google Fonts (Bai Jamjuree) no `<head>` do `index.html`
- Configurar `fontFamily.sans` no `tailwind.config.ts`

### 2. Variaveis CSS (index.css)
- Substituir todas as variaveis `:root` e `.dark` pelos novos tokens (amarelo premium como primary, fundos claros no light mode, fundos escuros no dark)
- Adicionar tokens customizados: `--success-bg/text/border`, `--destructive-bg/border`, `--shadow-card/hover/button`, `--crextio-*`
- Adicionar utilitarios globais (font-smoothing, letter-spacing em headings, `.glass-effect`)

### 3. tailwind.config.ts
- Adicionar `fontFamily: { sans: ['Bai Jamjuree', 'system-ui', 'sans-serif'] }`
- Adicionar cores customizadas para os tokens crextio e status (success, etc.)
- Atualizar `--radius` para `1rem`

### 4. Dark Mode Toggle
- O dashboard atualmente e sempre escuro (classes hardcoded como `bg-slate-900`, `text-white`). Sera necessario migrar para usar as variaveis CSS (`bg-background`, `text-foreground`, `bg-card`, etc.) em vez de cores hardcoded
- Adicionar um botao de toggle dark/light no header usando `next-themes` (ja instalado)

### 5. Componentes do Dashboard — Migracao de cores

**KpiCard.tsx**
- `bg-slate-800` --> `bg-card border-border` com `shadow-card`
- `text-white` --> `text-foreground`
- `text-slate-500` --> `text-muted-foreground`
- Icone: `text-muted-foreground` com hover `text-foreground`
- `rounded-xl` --> `rounded-2xl`

**Section.tsx**
- `bg-slate-800/50 border-slate-700/50` --> `bg-card border-border`
- Titulo: `text-foreground`

**FinancialDashboard.tsx**
- Fundo: `bg-gradient-to-br from-slate-900...` --> `min-h-screen bg-background`
- Botoes ativos: `bg-blue-600` --> `bg-primary text-primary-foreground` (amarelo com texto preto)
- Botoes inativos: `border-slate-600 text-slate-300` --> `border-input text-muted-foreground`
- Header: `text-white` --> `text-foreground`, subtitulo `text-muted-foreground`

**InvestorView.tsx**
- Todas as classes `bg-slate-800/60`, `text-slate-400`, `text-white`, `border-slate-700` --> tokens CSS
- Tooltips dos graficos: `backgroundColor: "#0f172a"` --> `hsl(var(--card))`
- Cores dos graficos: manter tons de azul mas adaptar strokes/grids para variavel

**AcquisitionView.tsx**
- Mesma migracao de cores hardcoded para tokens
- Slider: ja usa componente shadcn, vai herdar automaticamente
- Cards do simulador: `bg-slate-800/60` --> `bg-card/60 border-border`

**MonetizationView.tsx**
- Alert: migrar cores inline para tokens
- Tooltips customizados: `bg-slate-900` --> `bg-popover border-border`

**DreView.tsx**
- Tabela: zebra `bg-slate-800/30` --> `bg-muted/30`
- Destaque lucro liquido: `border-blue-600/50` --> `border-primary/50`
- Todas as cores de texto inline

**FixedCostsView.tsx**
- Inputs editaveis: `bg-slate-700 border-blue-500` --> `bg-input border-primary`
- Botoes add/delete: `text-blue-400` --> `text-primary`
- Todas as tabelas e labels

**UnitCostView.tsx**
- Mesma migracao de cores

**InvestmentView.tsx**
- Cards de fase: `bg-slate-800 border-slate-700` --> `bg-card border-border`
- BurnRatePanel: mesma migracao
- Tooltip customizado: usar tokens
- Track Record cards: mesma migracao

### 6. Layout com Sidebar (opcional)
O design system menciona sidebar, mas o dashboard atual usa abas. Vou manter as abas como estao e nao adicionar sidebar, ja que a estrutura atual funciona bem para o caso de uso. Se quiser sidebar depois, podemos adicionar.

## Arquivos modificados
1. `index.html` — link Google Fonts
2. `src/index.css` — tokens CSS completos (light + dark)
3. `tailwind.config.ts` — font family + cores extras
4. `src/App.tsx` — wrapper ThemeProvider para dark mode
5. `src/components/dashboard/FinancialDashboard.tsx` — cores + toggle dark/light
6. `src/components/dashboard/KpiCard.tsx` — tokens CSS
7. `src/components/dashboard/Section.tsx` — tokens CSS
8. `src/components/dashboard/InvestorView.tsx` — tokens CSS
9. `src/components/dashboard/AcquisitionView.tsx` — tokens CSS
10. `src/components/dashboard/MonetizationView.tsx` — tokens CSS
11. `src/components/dashboard/DreView.tsx` — tokens CSS
12. `src/components/dashboard/FixedCostsView.tsx` — tokens CSS
13. `src/components/dashboard/UnitCostView.tsx` — tokens CSS
14. `src/components/dashboard/InvestmentView.tsx` — tokens CSS

## Detalhes tecnicos

A migracao principal e substituir ~200 ocorrencias de cores hardcoded (ex: `bg-slate-800`, `text-white`, `text-slate-400`, `border-slate-700`) pelas classes que usam variaveis CSS (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`). Isso garante que o dark/light mode funcione automaticamente.

Os graficos (Recharts) usam cores inline em props como `stroke`, `fill`, `contentStyle`. Esses serao adaptados para funcionar em ambos os modos, usando cores que contrastem bem em light e dark.

O toggle de tema sera um botao simples no header (icone Sol/Lua) usando o `next-themes` que ja esta instalado.

