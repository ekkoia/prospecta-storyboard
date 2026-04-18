
Atualizar custos no `financial-engine.ts` conforme especificado.

## Alterações em `src/lib/financial-engine.ts`

**1. `cogsByPlan`** — atualizar todos os valores:
```ts
cogsByPlan: { basic: 28, lite: 96, starter: 176, pro: 810, enterprise: 2005 } as Record<PlanKey, number>,
```

**2. `toolsBrlItems`** (dentro de `DEFAULT_FIXED_COSTS`) — adicionar item ao final:
```ts
{ id: "leadsReceita", label: "Leads Receita (CNPJ)", value: 29.90 },
```

**3. `toolsUsdItems`** (dentro de `DEFAULT_FIXED_COSTS`) — adicionar dois itens ao final:
```ts
{ id: "resend", label: "Resend (email)", usd: 90 },
{ id: "unipile", label: "Unipile LinkedIn API", usd: 5.5 },
```

## Impacto
- COGS sobe ligeiramente em todos os planos → margens brutas/líquidas recalculam automaticamente em `UnitCostView`, `DreView`, `InvestorView`.
- Custos fixos sobem em R$ 29,90 + (USD 95,5 × 5,22 × 1,08 ≈ R$ 538) → reflete em DRE, rateio fixo/cliente e Resumo Financeiro.
- Itens aparecem editáveis na aba de Custos Fixos.
- Nenhuma outra lógica é alterada.
