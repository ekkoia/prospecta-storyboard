

# Adicionar Plano Basic ao Financial Engine

## Escopo
Adicionar o novo plano "Basic" (R$ 147) como o primeiro tier, antes do Lite. Verifiquei e apenas dois arquivos referenciam planos diretamente — os demais (UnitCostView, etc.) iteram dinamicamente via `Object.keys(ASSUMPTIONS.plans)` e vão absorver o novo plano automaticamente.

## Alterações

### 1. `src/lib/financial-engine.ts`

**Linha 15** — Adicionar `basic` ao tipo:
```ts
export type PlanKey = "basic" | "lite" | "starter" | "pro" | "enterprise";
```

**Bloco `plans` (linhas 88-92)** — Adicionar Basic antes do Lite:
```ts
basic: { label: "Basic", price: 147, includedSearches: 300, includedWhatsApps: 1, includedVoiceMinutes: 0 },
lite: { label: "Lite", price: 397, ... },
// ... demais planos
```

**Linha 93** — Rebalancear o mix:
```ts
mix: { basic: 0.25, lite: 0.35, starter: 0.28, pro: 0.09, enterprise: 0.03 } as Record<PlanKey, number>,
```

**Linha 96** — CAC bruto:
```ts
cacByPlanGross: { basic: 120, lite: 220, starter: 350, pro: 700, enterprise: 1600 } as Record<PlanKey, number>,
```

**Linha 110** — COGS por plano:
```ts
cogsByPlan: { basic: 28, lite: 95, starter: 140, pro: 734, enterprise: 1815 } as Record<PlanKey, number>,
```

**Linha 185** — Inicialização do `out` no `planCounts`:
```ts
const out: Record<PlanKey, number> = { basic: 0, lite: 0, starter: 0, pro: 0, enterprise: 0 };
```

### 2. `src/components/dashboard/InvestorView.tsx`

**Linha 19** — Adicionar cor do Basic ao mapa de cores do gráfico de pizza:
```ts
const colors: Record<PlanKey, string> = { basic: "#cbd5e1", lite: "#94a3b8", starter: "#64748b", pro: "hsl(45, 95%, 63%)", enterprise: "hsl(45, 89%, 57%)" };
```

## Verificação de Outros Arquivos

Busquei por todas as referências a `PlanKey`, `ASSUMPTIONS.plans`, `cogsByPlan` e `cacByPlanGross`:

- **`UnitCostView.tsx`** — Itera com `Object.keys(ASSUMPTIONS.plans)`. Sem mudanças necessárias, vai exibir Basic automaticamente na tabela e no cálculo de margem ponderada.
- **`InvestorView.tsx`** — Apenas o objeto `colors` precisa de update (acima).
- **Demais views (Dre, Acquisition, FixedCosts, etc.)** — Não referenciam planos individualmente; consomem `MonthResult` agregado.

Soma do novo mix: 0.25 + 0.35 + 0.28 + 0.09 + 0.03 = **1.00** ✓

