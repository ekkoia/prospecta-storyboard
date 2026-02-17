

# Corrigir Labels do Pie Chart Cortados em Mobile

## Problema
No mobile (390px), os labels do grafico de pizza estao sendo cortados nas bordas. Textos como "Enterprise (R$4497): 5%" e "Starter (R$897): 35%" sao longos demais para o espaco disponivel, mesmo com outerRadius reduzido para 80 e fontSize 9.

## Solucao

### Arquivo: `src/components/dashboard/InvestorView.tsx`

Encurtar os labels em mobile, mostrando apenas a abreviacao do plano sem o preco. O preco ja aparece no tooltip ao tocar.

**Mobile**: mostrar apenas "Lite: 45%" em vez de "Lite (R$397): 45%"
**Desktop**: manter o formato completo "Lite (R$397): 45%"

Mudancas:

1. No `useMemo` de `distribution`, adicionar um campo `shortName` com apenas o label do plano (sem preco):

```tsx
return (Object.keys(activeCounts) as PlanKey[]).map((k) => ({
  name: `${ASSUMPTIONS.plans[k].label} (R$${ASSUMPTIONS.plans[k].price})`,
  shortName: ASSUMPTIONS.plans[k].label,
  value: activeCounts[k],
  color: colors[k],
}));
```

2. No render function do `label`, usar `shortName` em mobile e `name` em desktop. Como o Recharts passa as propriedades do data item no callback, podemos acessar diretamente:

```tsx
label={({ name, percent, x, y, textAnchor, fill }: any) => {
  const displayName = isMobile ? name.split(' (')[0] : name;
  return (
    <text x={x} y={y} textAnchor={textAnchor} fill={fill} fontSize={isMobile ? 9 : 11}>
      {`${displayName}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
}}
```

Isso resolve o corte sem perder informacao (o preco continua visivel no tooltip).

## Resumo

- Um unico arquivo modificado: `InvestorView.tsx`
- Labels mobile ficam curtos ("Lite: 45%") para nao cortar
- Labels desktop mantidos completos ("Lite (R$397): 45%")
- Preco continua acessivel via tooltip

