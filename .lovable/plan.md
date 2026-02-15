

# Melhorias na Visualizacao da Aba Aquisicao

## Problemas Atuais

1. **Grafico unico sobrecarregado**: 4 metricas com escalas muito diferentes (clientes vs R$) num unico grafico, tornando o CAC por cliente praticamente invisivel.
2. **Linhas planas**: Como o solver calcula um numero constante de novos clientes/mes, "Novos clientes", "Marketing liquido" e "CAC" ficam como linhas retas horizontais — sem dinamismo visual.
3. **Falta de contexto acumulado**: O investidor nao ve o investimento total acumulado em marketing ao longo dos 12 meses.

## Solucao Proposta

Substituir o grafico unico por **3 graficos separados e complementares**, cada um com escala propria:

### Grafico 1: Evolucao de Clientes (Area)
- **Tipo**: AreaChart com gradiente
- **Dados**: Clientes ativos (area preenchida) + Novos clientes/mes (linha)
- **Objetivo**: Mostrar a curva de crescimento da base — unica metrica que realmente varia mes a mes

### Grafico 2: Marketing Mensal vs Acumulado (ComposedChart)
- **Tipo**: Barras + Linha
- **Dados**: Marketing liquido mensal (barras) + Marketing acumulado (linha crescente)
- **Objetivo**: Visualizar o investimento mensal e o total acumulado ao longo de 12 meses, dando nocao do "burn" total

### Grafico 3: CAC e Teste Pago (BarChart)
- **Tipo**: Barras empilhadas
- **Dados**: CAC bruto (barra) com destaque do abatimento do teste pago, mostrando o CAC liquido resultante
- **Objetivo**: Ilustrar como o teste pago reduz o CAC efetivo — atualmente essa informacao esta escondida

### KPIs Adicionais
- Adicionar um 5o KPI: **"Investimento total 12 meses"** — soma acumulada do marketing liquido, para o investidor ter a visao do capital necessario

### Nota Explicativa Atualizada
- Explicar que o modelo usa aquisicao constante (solver) e por isso os valores mensais sao fixos
- Destacar que a variacao real esta no crescimento da base de clientes

## Detalhes Tecnicos

### Arquivo: `src/components/dashboard/AcquisitionView.tsx`

1. Importar `Area`, `AreaChart`, `Bar`, `BarChart`, `ComposedChart` do recharts
2. Calcular `marketingAccumulated` a partir de `projectionRows` com reduce acumulativo
3. Criar 3 `Section` com `ResponsiveContainer` separados (height 260 cada)
4. Adicionar KPI de investimento total: `projectionRows.reduce((acc, r) => acc + r.marketingNet, 0)`

### Arquivo: `src/lib/financial-engine.ts`

Nenhuma alteracao — os dados ja existem no `MonthResult`, apenas precisam ser melhor apresentados.

