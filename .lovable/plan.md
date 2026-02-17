
# Corrigir Labels do Pie Chart — Reduzir Fonte, Manter Texto Original

## Problema
As alteracoes anteriores removeram o preco do label e diminuiram o grafico. O usuario quer manter o texto completo (ex: "Enterprise (R$4497): 5%") e o tamanho original do grafico, apenas reduzindo o tamanho da fonte dos labels para que caibam.

## Solucao

### Arquivo: `src/components/dashboard/InvestorView.tsx`

3 mudancas:

1. **Restaurar o `name` com preco** (linha 19): voltar para `ASSUMPTIONS.plans[k].label + " (R$" + ASSUMPTIONS.plans[k].price + ")"`
2. **Restaurar dimensoes originais** (linhas 75 e 79): `height={320}`, `outerRadius={110}`
3. **Reduzir o tamanho da fonte do label** (linha 78): usar um render function customizado no `label` que aplica `fontSize: 11` via SVG `<text>`, em vez do label string padrao que usa fonte grande

O label customizado ficara assim:

```tsx
label={({ name, percent, x, y, textAnchor }: any) => (
  <text x={x} y={y} textAnchor={textAnchor} fill="hsl(var(--foreground))" fontSize={11}>
    {`${name}: ${(percent * 100).toFixed(0)}%`}
  </text>
)}
```

Isso mantem o grafico no tamanho original, o texto completo com preco, e resolve o corte reduzindo apenas o tamanho da fonte.
