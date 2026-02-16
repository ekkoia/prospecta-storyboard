

# Nova Aba: Aporte Faseado por KPIs (com Historico Real)

## Contexto

O projeto ja tem historico comprovado de receita e validacao. O investidor precisa ver que **nao esta entrando do zero** -- o produto ja rodou, ja faturou, e o deficit atual e minimo (R$ -1.952). Isso muda completamente a narrativa: o aporte nao e para "construir", e para **escalar**.

## Dados Historicos (fixos no codigo)

Serao exibidos como contexto antes das fases futuras:

| Metrica | Valor |
|---------|-------|
| Investimento total ate aqui | R$ 34.383 |
| Receita bruta gerada | R$ 47.863 |
| Receita liquida | R$ 40.875 |
| Custos fixos V2 | R$ 8.444 |
| Resultado atual | -R$ 1.952 |
| MRR validado (V2) | R$ 2.713/mes |
| Periodo de validacao | Jun/24 - Dez/24 (~6 meses) |

## Estrutura da Aba

### 1. Painel "Track Record" (topo)
Cards destacando que o projeto ja tem traction:
- **Investido ate aqui**: R$ 34.383
- **Receita gerada**: R$ 47.863
- **Gap atual**: -R$ 1.952 (quase breakeven)
- **MRR validado**: R$ 2.713/mes

### 2. KPI Cards de Projecao
- **Aporte adicional necessario** (calculado do fluxo de caixa dos 12 meses)
- **Meses ate breakeven**
- **Margem no mes 12**
- **Payback estimado**

### 3. Painel de 3 Fases
Cada fase com:
- Valor do aporte (soma dos deficits de caixa daqueles meses, ou zero se positivo)
- KPIs de liberacao (clientes, receita, churn)
- Clientes esperados ao final

### 4. Grafico de fluxo de caixa acumulado
- Linha mostrando o acumulado mes a mes
- Marca visual do ponto de breakeven
- Inicio no deficit historico de -R$ 1.952

### 5. Tabela resumida mes a mes
- Receita, despesas totais, fluxo do mes, acumulado

## Detalhe Tecnico

### Novo arquivo: `src/components/dashboard/InvestmentView.tsx`

Recebe `projectionRows: MonthResult[]` como prop.

**Constantes do historico:**
```typescript
const TRACK_RECORD = {
  totalInvested: 34383,
  grossRevenue: 47863,
  netRevenue: 40875,
  fixedCostsV2: 8444,
  currentResult: -1952,
  validatedMRR: 2713,
  period: "Jun/24 - Dez/24",
};
```

**Calculo das fases:**
- Itera sobre `projectionRows` (12 meses)
- Calcula fluxo acumulado comecando de `TRACK_RECORD.currentResult`
- Divide em 3 fases de 4 meses
- Para cada fase: soma dos deficits negativos = aporte necessario
- Breakeven = primeiro mes onde acumulado >= 0
- Payback = meses do breakeven ao ponto onde acumulado recupera o aporte total

**Renderiza:**
- 4 KPI cards de track record (tom cinza/neutro para "passado")
- 4 KPI cards de projecao (tons coloridos para "futuro")
- 3 cards de fase com KPIs de liberacao dinamicos baseados nos dados reais da projecao
- Grafico `AreaChart` (recharts) do fluxo acumulado
- Tabela resumida com ScrollArea

### Arquivo: `src/components/dashboard/FinancialDashboard.tsx`

- Adicionar tab `{ key: "investment", label: "💰 Aporte & Fases" }` ao array `TABS`
- Importar e renderizar `InvestmentView` passando `projectionRows`
- Atualizar `TabKey` type automaticamente (ja e inferido do array)

### Nenhuma alteracao em `financial-engine.ts`

Todos os dados necessarios ja existem no `MonthResult` (profit, revenueTotal, fixedCosts, etc).

## Narrativa para o Investidor

A aba conta a seguinte historia:

1. "Ja investimos R$ 34k e geramos R$ 48k de receita -- o produto esta validado"
2. "Estamos a R$ 2k do breakeven historico"
3. "Para escalar de 50 para 200 clientes, precisamos de R$ X adicional"
4. "Esse aporte e faseado: voce so libera a proxima tranche quando batermos os KPIs"
5. "No mes Y a operacao se paga sozinha e comeca a gerar retorno"

