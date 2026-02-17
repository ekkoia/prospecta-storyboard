

# Ajustes no Grafico de Pizza Mobile

## Problemas

1. **Grafico pequeno demais** -- `outerRadius` de 80 e `fontSize` de 9 deixam o grafico e os labels muito pequenos no mobile.
2. **Quadrado ao redor da fatia ao clicar** -- O Recharts aplica um `stroke` branco nas fatias do `<Pie>` por padrao, e ao interagir aparece um contorno retangular (cursor/outline). Precisa remover o `activeShape` e o cursor do Tooltip.

## Solucao

### Arquivo: `src/components/dashboard/InvestorView.tsx`

**1. Aumentar o grafico no mobile:**
- `outerRadius`: de 80 para 100
- `fontSize`: de 9 para 10

**2. Remover o quadrado/contorno ao clicar na fatia:**
- Adicionar `activeShape={undefined}` (ou `activeIndex={-1}`) no `<Pie>` para desabilitar o efeito de destaque da fatia ativa
- Adicionar `cursor={false}` no `<Tooltip>` para remover o cursor retangular que aparece ao interagir
- Adicionar `stroke="none"` nas `<Cell>` para remover o contorno branco das fatias

### Codigo resultante (trecho relevante):

```tsx
<Pie data={distribution} cx="50%" cy="55%" labelLine={false}
  activeIndex={-1}
  label={({ name, percent, x, y, textAnchor, fill }: any) => {
    const displayName = isMobile ? name.split(' (')[0] : name;
    return (
      <text x={x} y={y} textAnchor={textAnchor} fill={fill} fontSize={isMobile ? 10 : 11}>
        {`${displayName}: ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  }}
  outerRadius={isMobile ? 100 : 110} dataKey="value">
  {distribution.map((entry, idx) => (
    <Cell key={idx} fill={entry.color} stroke="none" />
  ))}
</Pie>
<Tooltip
  cursor={false}
  formatter={(v: any) => `${v} clientes`}
  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
  itemStyle={{ color: "hsl(var(--foreground))" }}
  labelStyle={{ color: "hsl(var(--foreground))" }}
/>
```

## Resumo

- Um unico arquivo modificado
- Grafico maior e mais legivel no mobile (outerRadius 100, fontSize 10)
- Quadrado/contorno removido ao interagir com fatias (activeIndex={-1}, cursor={false}, stroke="none")
- Tooltip continua funcionando normalmente mostrando os dados

