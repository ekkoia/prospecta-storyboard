
# Corrigir Tooltips dos Graficos no Dark Mode

## Problema
Os tooltips dos graficos Recharts que usam `contentStyle` inline estao com texto escuro sobre fundo escuro no dark mode, ficando ilegivel. Isso acontece porque o `contentStyle` define apenas o fundo (`backgroundColor`) mas nao define a cor do texto.

## Onde o problema ocorre
Todos os graficos que usam o Tooltip padrao do Recharts com `contentStyle` inline (sem componente customizado):

1. **InvestorView.tsx** - Pie chart (distribuicao de clientes) e Bar chart (comparacao cenarios) - 2 tooltips
2. **AcquisitionView.tsx** - 3 graficos (clientes, marketing, CAC) - 3 tooltips
3. **MonetizationView.tsx** - Area chart (receita vs assinaturas) - 1 tooltip
4. **DreView.tsx** - Composed chart (receita vs lucro) - 1 tooltip
5. **UnitCostView.tsx** - Composed chart - 1 tooltip

Total: **8 tooltips** a corrigir.

## Tooltips que ja estao corretos
- **InvestmentView.tsx** - CustomTooltip com classes CSS (`bg-popover text-foreground`)
- **MonetizationView.tsx** - PercentTooltip com classes CSS (`bg-popover text-foreground`)

## Solucao
Adicionar `itemStyle` e `labelStyle` em cada Tooltip inline para garantir que o texto use `hsl(var(--foreground))`:

```tsx
<Tooltip
  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
  itemStyle={{ color: "hsl(var(--foreground))" }}
  labelStyle={{ color: "hsl(var(--foreground))" }}
  ...
/>
```

## Arquivos modificados
1. `src/components/dashboard/InvestorView.tsx` - 2 Tooltips
2. `src/components/dashboard/AcquisitionView.tsx` - 3 Tooltips
3. `src/components/dashboard/MonetizationView.tsx` - 1 Tooltip
4. `src/components/dashboard/DreView.tsx` - 1 Tooltip
5. `src/components/dashboard/UnitCostView.tsx` - 1 Tooltip
