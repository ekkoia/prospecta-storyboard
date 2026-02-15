

# Prospecta IA 360 — Financial Dashboard

## Visão Geral
Implementar o dashboard financeiro completo "Prospecta IA 360" conforme o código fornecido. É um painel interativo para investidores com projeções financeiras, análise de custos e monetização.

## Funcionalidades

### 1. Controles Interativos
- **Seletor de Modo**: Moderado, Pessimista (CAC x2 + churn 6%), e Impacto Hormozi (teste + upsell)
- **Seletor de Cenário**: 100, 200 ou 500 clientes ativos
- **Abas de navegação**: 5 views diferentes do dashboard

### 2. Aba "Investor View" (👔)
- KPIs principais: clientes ativos, receita total, lucro líquido, CAC blended
- Resumo "1 tela / 8 números" para o investidor
- Gráfico de pizza com distribuição de clientes por plano (Lite, Starter, Pro, Enterprise)
- Gráfico de barras comparando cenários 100 vs 200 vs 500 clientes
- Explicação de por que a margem sobe com escala

### 3. Aba "Aquisição" (🎯)
- KPIs de aquisição: novos clientes/mês, marketing bruto, teste pago, CAC
- Gráfico de linhas 12 meses: clientes, marketing e CAC

### 4. Aba "Monetização Hormozi" (💎)
- KPIs: ARPU, onboarding, upsells, voz
- Gráfico de área: receita total vs assinaturas
- Mini-mapa do funil Hormozi (front-end → upsell → continuidade → alavanca)
- Gráfico de área empilhada: receita por componente mês a mês

### 5. Aba "Custo por Cliente" (🧾)
- KPIs: COGS/cliente, fixos/cliente, custo unitário, margem líquida
- Tabela detalhada de custo por plano (preço, COGS, margem bruta, fixos, custo total)

### 6. Aba "DRE" (📑)
- KPIs: receita, COGS, marketing, lucro
- DRE visual com receita, deduções (COGS, fixos, marketing, comissão, impostos) e lucro líquido
- Tabela de projeção 12 meses com ativos, novos, receita, marketing, CAC, lucro e margem

### 7. Motor Financeiro
- Modelo completo com planos, mix de clientes, churn, CAC por plano
- Impostos progressivos por faixa
- Money Models Hormozi (teste pago, onboarding, upsells, packs de voz)
- Cenário pessimista e projeção 12 meses com solver automático

### Design
- Tema escuro (slate-900) com gradientes e cards coloridos
- Layout responsivo com grid adaptativo
- Gráficos Recharts estilizados com tooltips customizados

