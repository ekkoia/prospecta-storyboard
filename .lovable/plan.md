

# Redesign Executivo do Dashboard Financeiro

## Problema Atual
O dashboard tem aparencia amadora: emojis nos titulos (🍰, 🔥, 👥, 🧠, etc.), cards com gradientes coloridos demais (verde, laranja, roxo, rosa), botoes com gradiente azul/roxo, e layout visual que nao transmite seriedade para um investidor.

## Diretrizes do Novo Visual

- **Paleta restrita**: tons de slate/zinc para fundo, branco para texto principal, um unico accent azul corporativo (ex: `#2563EB` / blue-600) para destaques e elementos ativos
- **Zero emojis**: todos os titulos de secao e abas perdem emojis; icones Lucide substituem onde necessario (ex: `Users`, `TrendingUp`, `DollarSign`, `BarChart3`, `Briefcase`)
- **KPI Cards monocromaticos**: fundo `slate-800` com borda sutil, valor em branco, label em `slate-400`. Sem gradientes coloridos
- **Tipografia executiva**: titulos em `text-lg font-semibold tracking-tight`, sem bold exagerado
- **Botoes de controle**: estilo pill com borda, fundo transparente quando inativo, fundo `blue-600` quando ativo. Sem gradiente
- **Secoes (Section)**: borda `border border-slate-700/50` + `bg-slate-800/50`, cantos arredondados, sem sombra pesada
- **Tabelas**: linhas zebradas sutis (`slate-800/30`), header com `uppercase text-xs tracking-wider text-slate-500`
- **Graficos**: tooltips com fundo `slate-900`, cores de dados reduzidas a 3-4 tons de azul/cinza/verde sutil

## Arquivos Modificados

### 1. `src/components/dashboard/KpiCard.tsx`
- Remover sistema de `tone` com gradientes coloridos
- Novo visual: `bg-slate-800 border border-slate-700/50 rounded-xl p-5`
- Valor em `text-2xl font-semibold text-white`, label em `text-xs uppercase tracking-wider text-slate-500`
- Icone opcional via Lucide (prop `icon`) em `text-blue-500` ao lado do titulo

### 2. `src/components/dashboard/Section.tsx`
- Trocar `bg-slate-800 rounded-xl p-6 shadow-xl` por `bg-slate-800/50 border border-slate-700/50 rounded-xl p-6`
- Titulo: `text-lg font-semibold text-slate-100 tracking-tight`

### 3. `src/components/dashboard/FinancialDashboard.tsx`
- **Header**: subtitulo mais curto, sem "Financial Storyboard" -- usar "Painel Financeiro" ou "Dashboard Financeiro"
- **Abas**: remover todos os emojis dos labels. Usar texto limpo: "Investor View", "Aquisicao", "Monetizacao", "Custo Unitario", "DRE", "Custos Fixos", "Aporte & Fases"
- **Botoes**: substituir `bg-gradient-to-r from-blue-600 to-purple-600` por `bg-blue-600 text-white` (ativo) e `bg-transparent border border-slate-600 text-slate-300` (inativo)
- **Paineis de controle**: bordas mais suaves, sem `shadow-xl`

### 4. `src/components/dashboard/InvestorView.tsx`
- Remover emojis de todos os titulos de Section: "Resumo Financeiro Mensal", "Distribuicao de clientes por plano", "Comparacao (100 vs 200 vs 500)", "Por que a margem sobe com escala"
- Remover emoji de alerta amarelo (⚠) -- usar icone `AlertTriangle` do Lucide
- Cards de explicacao ("Fixos diluem", etc.): fundo `slate-800/60 border border-slate-700/40`

### 5. `src/components/dashboard/AcquisitionView.tsx`
- Remover emojis: "Evolucao de Clientes", "Marketing -- Mensal vs Acumulado", "CAC por Cliente", "Simulador de Orcamento de Trafego Pago"
- Remover emoji ℹ️ da nota explicativa
- Simulador: visual mais contido, sem `text-amber-400` em destaque

### 6. `src/components/dashboard/MonetizationView.tsx`
- Remover emojis: "Receita total vs Assinaturas", "Mini-mapa Hormozi", "Receita por componente"
- Manter o conteudo, apenas limpar visual

### 7. `src/components/dashboard/DreView.tsx`
- Remover emojis de titulos: "DRE (detalhada)", "Evolucao -- Receita vs Lucro", "Projecao 12 meses"
- Resultado final (lucro liquido): borda `border-blue-600/50` mais sutil, sem gradiente `from-blue-900 to-purple-900`

### 8. `src/components/dashboard/FixedCostsView.tsx`
- Remover emojis: "Recursos Humanos", "Ferramentas & Infra (BRL)", "SaaS (USD)", "Parametros de Cambio", "Custo Variavel -- Numeros Twilio"
- Usar icones Lucide: `Users`, `Wrench`, `Globe`, `ArrowLeftRight`, `Phone`

### 9. `src/components/dashboard/UnitCostView.tsx`
- Remover emojis de titulos

### 10. `src/components/dashboard/InvestmentView.tsx`
- Remover emojis de todos os titulos e fases (🏗️, 🚀, 📈)
- Fases: substituir gradientes coloridos por cards com borda colorida sutil (ex: `border-l-4 border-amber-500 bg-slate-800`)
- Remover emoji ✅ -- usar icone `CheckCircle`
- Burn Rate: remover emoji 🔥 -- usar icone `Flame` do Lucide

## Resultado Esperado

Dashboard com aparencia de ferramenta financeira profissional -- como um Bloomberg Terminal ou Carta -- clean, monocromatico, com accent azul unico, zero emojis, tipografia precisa. Transmite confianca e seriedade para apresentacao a investidor.

