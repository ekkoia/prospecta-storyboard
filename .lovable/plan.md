
# Conectar Burn Rate aos Custos Fixos Editaveis

## Problema

O painel de Burn Rate na aba "Aporte & Fases" usa `DEFAULT_FIXED_COSTS` (valores estaticos). Quando voce edita os custos na aba "Custos Fixos", o Burn Rate nao atualiza.

## Solucao

Passar o estado `editableCosts` do `FinancialDashboard` para o `InvestmentView`, que por sua vez repassa ao `BurnRatePanel`.

## Alteracoes

### 1. `src/components/dashboard/FinancialDashboard.tsx`

Passar a prop `editableCosts` ao `InvestmentView`:

```
// De:
<InvestmentView projectionRows={projectionRows} />

// Para:
<InvestmentView projectionRows={projectionRows} editableCosts={editableCosts} />
```

### 2. `src/components/dashboard/InvestmentView.tsx`

- Atualizar a interface de props para aceitar `editableCosts`:

```typescript
export function InvestmentView({ projectionRows, editableCosts }: {
  projectionRows: MonthResult[];
  editableCosts: EditableCostsState;
})
```

- Na linha 321, trocar `DEFAULT_FIXED_COSTS` por `editableCosts`:

```
// De:
<BurnRatePanel costs={DEFAULT_FIXED_COSTS} marketingMonth1={marketingMonth1} />

// Para:
<BurnRatePanel costs={editableCosts} marketingMonth1={marketingMonth1} />
```

- Remover `DEFAULT_FIXED_COSTS` do import (se nao for usado em outro lugar do arquivo).

## Resultado

Ao editar qualquer custo na aba "Custos Fixos" (RH, ferramentas BRL, ferramentas USD, taxa de cambio), o painel de Burn Rate na aba "Aporte & Fases" atualizara automaticamente com os novos valores.
