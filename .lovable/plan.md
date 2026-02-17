

# Corrigir Cores dos Labels do Pie Chart

## Problema
O label customizado atual usa `fill="hsl(var(--foreground))"` para todos os textos, deixando tudo branco. Na versao anterior (imagem 2), cada label usava a cor do seu respectivo segmento do grafico (Lite em cinza claro, Starter em cinza, Pro em amarelo, Enterprise em amarelo).

## Solucao

### Arquivo: `src/components/dashboard/InvestorView.tsx`

Unica mudanca: no render function do `label`, trocar `fill="hsl(var(--foreground))"` por `fill={entry.color}` usando o parametro `fill` que o Recharts ja passa para o label (que corresponde a cor do segmento):

```tsx
label={({ name, percent, x, y, textAnchor, fill }: any) => (
  <text x={x} y={y} textAnchor={textAnchor} fill={fill} fontSize={11}>
    {`${name}: ${(percent * 100).toFixed(0)}%`}
  </text>
)}
```

O Recharts passa automaticamente a cor do segmento como `fill` no callback do label, entao basta usa-lo diretamente.

