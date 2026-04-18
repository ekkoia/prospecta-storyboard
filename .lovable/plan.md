
Adicionar coluna "Margem Líquida" na tabela de custos por plano em `UnitCostView.tsx`.

## Alterações em `src/components/dashboard/UnitCostView.tsx`

**1. No `useMemo` de `rows` (linha ~20)** — adicionar `margemLiquida` ao objeto retornado:
```ts
return {
  plano: ASSUMPTIONS.plans[k].label,
  preco: price,
  cogs,
  margemBruta: price > 0 ? (price - cogs) / price : 0,
  fixedAlloc: fixed / activeCount,
  unitCostTotal: cogs + fixed / activeCount,
  margemLiquida: price > 0 ? (price - cogs - fixed / activeCount) / price : 0,
};
```

**2. No header da tabela (linha ~92)** — adicionar "Margem Líquida" após "Margem Bruta":
```ts
["Plano", "Preço", "COGS (variável)", "Margem Bruta", "Fixos/cliente", "Custo total/cliente", "Margem Líquida"]
```

**3. No corpo da tabela (linha ~99)** — adicionar célula após `Custo total/cliente`:
```tsx
<td className="py-3 px-3 text-right text-foreground/80 font-medium">{pct(r.margemLiquida)}</td>
```

Mantém o mesmo padrão visual das demais colunas de percentual (`text-foreground/80 font-medium`). Nenhuma outra lógica é alterada.
