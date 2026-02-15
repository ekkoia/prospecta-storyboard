

# Melhorias na Aba DRE

## Problemas Identificados

1. A DRE so mostra "Receita total" sem decompor em assinaturas, onboarding, upsells e voz
2. O Paid Test Revenue esta "escondido" dentro do marketing liquido, sem visibilidade
3. A tabela de 12 meses nao tem linha de total/media anual
4. Nao ha grafico de evolucao (receita vs lucro), diferente de todas as outras abas
5. Nao ha nota explicando a diferenca entre a DRE estatica (steady-state) e a tabela de 12 meses (fase de crescimento)

## Solucao Proposta

### 1. Decomposicao de receitas na DRE estatica

Substituir a linha unica "Receita total" por um bloco detalhado:

- (+) Assinaturas: `currentStatic.subscriptionRevenue`
- (+) Onboarding premium: `currentStatic.onboardingRevenue`
- (+) Upsells (WhatsApp + buscas): `currentStatic.upsellRevenue`
- (+) Packs de voz: `currentStatic.voiceRevenue`
- (=) Receita total: `currentStatic.revenueTotal`

Isso torna a origem da receita transparente, especialmente no modo Hormozi.

### 2. Linha explicita de Paid Test na secao de marketing

Adicionar uma sublinha abaixo de "Marketing liquido" mostrando:
- Marketing bruto: `currentStatic.marketingGross`
- (-) Receita teste pago: `currentStatic.paidTestRevenue`
- (=) Marketing liquido: `currentStatic.marketingNet`

Isso torna visivel como o teste pago reduz o custo efetivo de aquisicao.

### 3. Linha de totais na tabela de 12 meses

Adicionar uma linha final com:
- Receita acumulada: soma de todos os meses
- Marketing acumulado
- Lucro acumulado
- Margem media (lucro total / receita total)

### 4. Grafico de evolucao: Receita vs Lucro (12 meses)

Adicionar um `ComposedChart` com:
- Barras: Receita total por mes
- Linha: Lucro liquido por mes
- Eixo Y direito: Margem % como segunda linha

Isso completa a narrativa visual e mantem consistencia com as outras abas.

### 5. Nota explicativa sobre os dois modelos

Adicionar nota similar a da aba Unit Cost, explicando que a DRE estatica assume base estabilizada e a tabela de 12 meses reflete a fase de crescimento.

### 6. KPI adicional: Lucro acumulado 12 meses

Expandir de 4 para 5 KPIs, adicionando o lucro acumulado da projecao de 12 meses.

## Detalhes Tecnicos

### Arquivo: `src/components/dashboard/DreView.tsx`

1. Importar `ComposedChart`, `Bar`, `Line`, `XAxis`, `YAxis`, `CartesianGrid`, `Tooltip`, `ResponsiveContainer`, `Legend` do recharts
2. Importar `Section` (ja importado) e `ASSUMPTIONS` do engine
3. Calcular totais acumulados com `useMemo` sobre `projectionRows`
4. Decompor o bloco de receita em linhas separadas (assinaturas, onboarding, upsells, voz)
5. Adicionar sublinha de marketing bruto / paid test / marketing liquido
6. Adicionar `tfoot` na tabela com linha de totais
7. Adicionar Section com o grafico `ComposedChart`
8. Adicionar nota explicativa sobre steady-state vs crescimento
9. Grid de KPIs passa de 4 para 5 colunas com lucro acumulado

### Nenhuma alteracao no engine

Todos os dados necessarios ja existem no `MonthResult` (`subscriptionRevenue`, `onboardingRevenue`, `upsellRevenue`, `voiceRevenue`, `paidTestRevenue`, `marketingGross`).

