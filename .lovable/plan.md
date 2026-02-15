

# Melhorias na Aba Monetizacao (Hormozi)

## Problemas Identificados

1. **Dependencia oculta do modo**: Quando o usuario esta nos modos "Moderado" ou "Pessimista", todos os valores de Onboarding, Upsells e Voz sao zero. Os graficos ficam vazios/sobrepostos sem nenhum aviso ao usuario.
2. **Grafico "Receita total vs Assinaturas"**: No modo nao-Hormozi, as duas areas sao identicas e ficam sobrepostas — confuso visualmente.
3. **Grafico "Receita por componente"**: Sem Hormozi, 3 das 4 camadas sao zero — o grafico stacked perde sentido.
4. **Mini-mapa Hormozi estatico**: Mostra apenas premissas fixas do ASSUMPTIONS, sem refletir valores reais calculados para o cenario atual.
5. **Falta KPI de impacto**: Nao mostra quanto os Money Models adicionam sobre a receita pura de assinaturas (delta percentual).

## Solucao Proposta

### 1. Banner de contexto do modo ativo

Adicionar um alerta visual no topo da aba quando o modo NAO for Hormozi, explicando que os Money Models so aparecem no modo "Impacto Hormozi". Isso evita confusao com graficos vazios.

### 2. KPIs aprimorados (5 cards)

Reorganizar os KPIs para contar uma historia melhor:

| KPI | Valor | Sub |
|-----|-------|-----|
| Receita total (mes 12) | revenueTotal do last | soma de todas as fontes |
| ARPU (mes 12) | arpu do last | ticket medio por cliente ativo |
| Uplift Money Models | % de aumento sobre subscriptionRevenue | quanto os money models adicionam |
| Upsells + Voz (mes 12) | upsellRevenue + voiceRevenue | receita recorrente adicional |
| Onboarding (mes 12) | onboardingRevenue | receita nao recorrente |

### 3. Mini-mapa Hormozi com valores reais

Substituir os valores hardcoded por calculos reais do mes 12:

- **Front-end**: Mostrar receita real do teste pago do mes 12 (paidTestRevenue)
- **Upsell imediato**: Mostrar onboardingRevenue real do mes 12
- **Continuidade**: Mostrar upsellRevenue real do mes 12
- **Alavanca extra**: Mostrar voiceRevenue real do mes 12

Cada card do mini-mapa passa a ter o valor calculado ao lado da descricao.

### 4. Grafico "Receita total vs Assinaturas" melhorado

- Adicionar uma terceira area: "Delta Money Models" (revenueTotal - subscriptionRevenue) para destacar visualmente a contribuicao dos money models
- Quando delta for zero (modo nao-Hormozi), o grafico ainda faz sentido mostrando apenas assinaturas

### 5. Grafico de composicao com percentuais

No grafico "Receita por componente", adicionar um tooltip customizado que mostre o percentual de cada componente sobre o total, alem do valor absoluto.

## Detalhes Tecnicos

### Arquivo: `src/components/dashboard/MonetizationView.tsx`

1. Importar `Bar`, `BarChart`, `ComposedChart`, `Line` adicionais do recharts
2. Calcular `upliftPct` como `(last.revenueTotal - last.subscriptionRevenue) / last.subscriptionRevenue`
3. Calcular `moneyModelsDelta` para cada row: `row.revenueTotal - row.subscriptionRevenue`
4. Adicionar condicional para o banner: verificar se `last.onboardingRevenue === 0 && last.upsellRevenue === 0 && last.voiceRevenue === 0`
5. Atualizar o mini-mapa para usar valores de `last` em vez de `ASSUMPTIONS` estaticos
6. Grid de KPIs passa de 4 para 5 colunas

### Arquivo: `src/components/dashboard/FinancialDashboard.tsx`

Passar prop adicional `mode` para `MonetizationView` para que o componente saiba qual modo esta ativo e possa exibir o banner contextual.

### Nenhuma alteracao no engine

Todos os dados necessarios ja existem no `MonthResult`. As melhorias sao puramente de apresentacao.

