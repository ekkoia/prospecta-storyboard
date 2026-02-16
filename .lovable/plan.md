

# Corrigir Calculo de Aporte por Fase

## O problema

A projecao inicia com `startActive: 50` clientes pagantes, o que gera ~R$50k+ de receita desde o mes 1. Com essa receita, o lucro mensal e positivo em todos os meses, e o calculo `Math.min(0, r.profit)` retorna sempre 0 -- por isso todas as fases mostram "R$ 0 / Auto-sustentavel".

Na realidade, o produto esta parado e o MRR atual e R$ 2.713 (~3 clientes ativos). A projecao precisa refletir esse ponto de partida real.

## A solucao (2 alteracoes)

### 1. Ajustar `startActive` de 50 para 5

**Arquivo:** `src/components/dashboard/FinancialDashboard.tsx`

Alterar o parametro `startActive` de 50 para 5 na chamada de `build12MonthProjection`. Isso reflete a base real atual (~3 clientes com MRR de R$2.713).

Com apenas 5 clientes gerando ~R$5k/mes no inicio, os custos fixos (~R$30k+) e de marketing serao muito maiores que a receita nos primeiros meses, criando deficits reais que aparecerao como aporte necessario.

### 2. Incluir deficit historico na Fase 1

**Arquivo:** `src/components/dashboard/InvestmentView.tsx`

Adicionar o deficit historico de R$ -1.952 ao calculo de investimento da Fase 1, pois o investidor precisa cobrir esse gap antes de comecar.

Na funcao `computePhases`, apos calcular o deficit da Fase 1, somar o valor absoluto do `TRACK_RECORD.currentResult`.

## Impacto esperado

Com `startActive: 5` e target de 200 clientes:
- Meses 1-4: receita baixa (~R$5k-30k) vs custos fixos (~R$30k+) = deficits significativos
- Meses 5-8: receita crescente, deficits menores ou primeiros meses positivos
- Meses 9-12: operacao tende a se auto-sustentar

As fases devem mostrar valores como:
- Fase 1: R$ 80k-120k (cobrindo deficit operacional + historico)
- Fase 2: R$ 20k-40k (ou zero se ja estiver positivo)
- Fase 3: R$ 0 (auto-sustentavel)

## Detalhes tecnicos

### `FinancialDashboard.tsx` (1 linha)
```
// De:
startActive: 50
// Para:
startActive: 5
```

### `InvestmentView.tsx` (logica de fase 1)
Apos calcular o deficit da fase, adicionar na primeira fase:
```typescript
// Se for a primeira fase, incluir o deficit historico
if (i === 0) {
  investmentNeeded += Math.abs(TRACK_RECORD.currentResult);
}
```

Nota: a mudanca de `startActive` afeta TODAS as abas do dashboard (Investor View, Aquisicao, DRE, etc.), tornando todas as projecoes mais realistas em relacao ao ponto de partida atual.
