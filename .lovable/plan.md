
# Corrigir Labels Cortados no Pie Chart

## Problema
No grafico de pizza "Distribuicao de clientes por plano", o label "Enterprise (R$4497): 5%" esta sendo cortado na borda direita do container. Isso acontece porque o `outerRadius` de 110px combinado com labels longos nao cabe dentro do `ResponsiveContainer` de 320px de altura.

## Solucao

### Arquivo: `src/components/dashboard/InvestorView.tsx`

1. **Reduzir o `outerRadius`** de 110 para 90, dando mais espaco para os labels ao redor
2. **Aumentar a altura do container** de 320 para 360px para acomodar melhor os labels
3. **Encurtar os labels** removendo o preco do label inline (que ja aparece no tooltip) — exibir apenas o nome do plano e percentual, ex: "Enterprise: 5%" em vez de "Enterprise (R$4497): 5%"

A opcao 3 e a mais elegante pois resolve o problema na raiz (labels longos demais) e deixa o grafico mais limpo. O preco ja esta disponivel no tooltip ao passar o mouse.

### Mudancas especificas
- Linha 21: simplificar o `name` no array de distribution para usar apenas o label do plano (sem preco)
- Linha 78: ajustar o `outerRadius` para 90
- Linha 75: aumentar height para 360

Isso resolve o corte sem impactar outros graficos do dashboard.
