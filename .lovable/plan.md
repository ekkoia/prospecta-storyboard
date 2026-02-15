

# Nota Explicativa na Aba Custo por Cliente

## O que sera feito

Adicionar uma nota explicativa abaixo do grafico de evolucao de custos (12 meses) na aba Custo por Cliente, esclarecendo que a margem mostrada reflete a fase de crescimento (partindo de 50 clientes ate o target) e nao o estado estacionario apresentado na aba Investor View.

## Detalhes Tecnicos

### Arquivo: `src/components/dashboard/UnitCostView.tsx`

Adicionar um paragrafo explicativo logo apos a nota existente do grafico de evolucao (linha ~80), com o seguinte conteudo:

> "Importante: A margem liquida neste grafico reflete a fase de crescimento (50 → [target] clientes), onde os custos de marketing e aquisicao sao maiores. A margem no Investor View assume a base ja estabilizada no target, com marketing apenas de reposicao de churn — por isso e naturalmente mais alta."

O texto usara o valor `last.activeCustomers` para mostrar o target real do cenario selecionado. Sera estilizado com `text-amber-400` para o destaque e `text-slate-400` para o corpo, seguindo o padrao visual das outras notas do dashboard.

Nenhum outro arquivo sera alterado.

