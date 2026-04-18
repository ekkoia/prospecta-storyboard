
## Ajuste no teste pago: separar conversores de não-conversores

Refinar a lógica do teste pago de R$ 49 para distinguir quem converte (vira desconto na 1ª mensalidade) de quem não converte (vira receita líquida).

## Alterações em `src/lib/financial-engine.ts`

**1. `ASSUMPTIONS.paidTest`** — adicionar `conversionRate`:
```ts
paidTest: { 
  enabled: true, 
  price: 49, 
  attachRateOfNewCustomers: 0.7,
  conversionRate: 0.5,
  creditToCAC: 0 
},
```

**2. `monthModel`** — substituir cálculo do teste pago e aplicar desconto na receita:
```ts
const testersTotal = newTotal * ASSUMPTIONS.paidTest.attachRateOfNewCustomers;
const paidTestRevenue = testersTotal * ASSUMPTIONS.paidTest.price;

const converters = testersTotal * ASSUMPTIONS.paidTest.conversionRate;
const nonConverters = testersTotal * (1 - ASSUMPTIONS.paidTest.conversionRate);

const paidTestDiscount = converters * ASSUMPTIONS.paidTest.price;
const paidTestNetRevenue = nonConverters * ASSUMPTIONS.paidTest.price;

const subscriptionRevenue = revenueFromPlans(activeCounts) - paidTestDiscount;
```

**3. Retorno do `monthModel`** — manter `paidTestRevenue` (bruto) para compatibilidade com as views já existentes. O valor virá do cálculo local acima, substituindo o que vinha de `acquisitionSpend`.

## Observações de integração

- A função `acquisitionSpend` hoje calcula `paidTestRevenue` internamente. Como `creditToCAC: 0`, esse valor não influencia mais o `marketingNet` (multiplicação por zero), então não precisa mexer nela. O `monthModel` passa a usar o `paidTestRevenue` calculado localmente no retorno.
- `paidTestNetRevenue` fica calculado mas não é exposto no retorno (não foi pedido). Se quiser expor depois para alguma view, é trivial adicionar.

## Impacto
- **Receita de assinaturas cai** pelo desconto dos conversores (50% dos testers × R$ 49).
- **`paidTestRevenue` (bruto)** continua aparecendo nas views como antes.
- **CAC líquido** permanece igual ao bruto (creditToCAC já é 0).
- Reflete em DRE, ARPU, margens e Resumo Financeiro automaticamente.
- Nenhuma outra lógica é alterada.
