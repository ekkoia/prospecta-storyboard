

# Tornar o Aporte por Fase Transparente

## Problema atual

O card de cada fase mostra apenas o valor total do aporte (ex: R$ 23.065), mas nao explica o que compoe esse valor. O investidor precisa entender que esse aporte cobre custos fixos, marketing (trafego), COGS e impostos nos meses em que a receita ainda nao cobre tudo.

## Solucao

Adicionar um **detalhamento mensal** dentro de cada card de fase, mostrando para cada mes deficitario: a receita, os custos e o gap (deficit) daquele mes. Tambem adicionar uma nota explicativa sobre o que o aporte cobre.

## Alteracoes

### Arquivo: `src/components/dashboard/InvestmentView.tsx`

**1. Expandir os dados por fase para incluir breakdown mensal**

Na funcao `computePhases`, alem de calcular o deficit total, armazenar o detalhamento mes a mes de cada fase:

```typescript
// Para cada mes da fase, guardar:
monthDetail: {
  month: number,
  revenue: number,
  costs: number,       // COGS + fixos + marketing + comissao + impostos
  gap: number,         // profit (negativo = deficit)
}[]
```

**2. Exibir breakdown dentro do card de fase**

Abaixo do valor do aporte e dos KPIs, adicionar uma mini-tabela ou lista mostrando:

```
Composicao:
  Mes 1: Receita R$ 5k | Custos R$ 35k | Gap -R$ 30k
  Mes 2: Receita R$ 12k | Custos R$ 36k | Gap -R$ 24k
  Mes 3: Receita R$ 22k | Custos R$ 37k | Gap -R$ 15k
  Mes 4: Receita R$ 35k | Custos R$ 38k | Gap +R$ 3k (sem deficit)
```

Apenas meses com gap negativo contam para o aporte.

**3. Adicionar nota explicativa**

No topo da secao de fases, adicionar texto:

> "O aporte de cada fase cobre o deficit operacional dos meses em que a receita ainda nao paga todos os custos (RH, ferramentas, trafego pago, COGS e impostos). O investidor so libera a proxima fase quando os KPIs forem atingidos."

**4. Destacar os componentes de custo no tooltip do grafico**

No grafico de fluxo acumulado, expandir o tooltip para mostrar a decomposicao do fluxo do mes (receita vs custos).

## Detalhes tecnicos

### Interface `PhaseData` — adicionar campo

```typescript
interface PhaseData {
  // ... campos existentes
  monthDetails: {
    month: number;
    revenue: number;
    totalCosts: number;  // cogsTotal + fixedCosts + marketingNet + closerCommission + taxes
    gap: number;         // profit do mes
  }[];
}
```

### No `.map()` de `phaseConfig` — coletar detalhes

```typescript
const monthDetails = phaseRows.map(r => ({
  month: r.month,
  revenue: r.revenueTotal,
  totalCosts: r.cogsTotal + r.fixedCosts + r.marketingNet + r.closerCommission + r.taxes,
  gap: r.profit,
}));
```

### Na renderizacao do card de fase — adicionar mini-tabela

Abaixo da secao de KPIs, renderizar uma lista compacta dos meses com seus valores. Usar cores condicionais: vermelho para meses deficitarios, verde para positivos. Apenas mostrar se houver pelo menos 1 mes com deficit (se todos sao positivos, a fase ja mostra "Auto-sustentavel").

### Tooltip do grafico — expandir

Atualizar `CustomTooltip` para exibir tambem o fluxo do mes alem do acumulado, usando o campo `flow` que ja existe no `cumulativeData`.

## Resultado esperado

O investidor vera claramente:
- "Nos meses 1 e 2 a receita e baixa e os custos sao altos — preciso de R$ 54k"
- "No mes 3 o gap ja diminui"
- "No mes 4 a operacao quase se paga"
- "Total da fase: R$ 54k + R$ 1.952 (historico) = R$ 56k"

Isso da total transparencia e confianca ao investidor de que o dinheiro esta indo para custos operacionais reais (equipe, ferramentas, trafego) e nao para um "buraco negro".
