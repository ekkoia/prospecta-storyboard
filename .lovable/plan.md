

# Melhorias na Aba Custo por Cliente

## Problemas Atuais

1. **Rateio fixo hardcoded em 500 clientes**: A tabela sempre calcula fixos divididos por 500, ignorando o cenario selecionado (100, 200, 500). Isso mostra valores errados nos cenarios menores.
2. **Desconexao KPIs vs tabela**: KPIs usam dados reais do mes 12, mas a tabela usa premissas estaticas sem ligacao com o cenario.
3. **Sem grafico de evolucao**: Todas as outras abas tem graficos de projecao 12 meses; esta aba so tem KPIs + tabela.
4. **Falta margem bruta ponderada**: Nao mostra a margem bruta "real" considerando o mix de planos.

## Solucao Proposta

### 1. Tabela dinamica com cenario real

Substituir o hardcoded `sumFixedCosts(500)` pelo numero real de clientes do mes 12 (`last.activeCustomers`). A tabela passa a refletir o cenario selecionado.

### 2. KPI adicional: Margem bruta ponderada

Adicionar um 5o KPI mostrando a margem bruta media ponderada pelo mix de planos:

| KPI | Valor | Sub |
|-----|-------|-----|
| Margem bruta ponderada | % | media considerando mix de planos |

Calculo: `sum(mix[k] * margemBruta[k])` para cada plano.

### 3. Grafico de evolucao de custos (12 meses)

Adicionar um grafico `ComposedChart` mostrando a evolucao mensal:

- **Barras empilhadas**: COGS/cliente + Fixos/cliente (custo unitario total)
- **Linha**: Margem liquida (eixo Y direito, em %)

Isso mostra como a diluicao dos custos fixos melhora a margem a medida que a base cresce.

### 4. Passar `projectionRows` como prop

Atualmente a aba so recebe `last`. Para o grafico de evolucao, precisa de `projectionRows`.

### 5. Nota explicativa do cenario

Adicionar texto indicando quantos clientes ativos estao sendo usados no rateio da tabela.

## Detalhes Tecnicos

### Arquivo: `src/components/dashboard/UnitCostView.tsx`

1. Atualizar Props: adicionar `projectionRows: MonthResult[]`
2. Substituir `sumFixedCosts(500)` por `sumFixedCosts(last.activeCustomers)` na tabela
3. Calcular margem bruta ponderada: iterar sobre planos com mix e calcular media
4. Adicionar grafico com recharts (`ComposedChart`, `Bar`, `Line`, `ResponsiveContainer`)
5. Importar `Section` para envolver o grafico
6. Grid de KPIs passa de 4 para 5 colunas
7. Nota da tabela passa a mostrar o numero real de clientes usado no rateio

### Arquivo: `src/components/dashboard/FinancialDashboard.tsx`

Passar `projectionRows` como prop adicional para `UnitCostView`:

```text
Antes:  <UnitCostView last={last} />
Depois: <UnitCostView last={last} projectionRows={projectionRows} />
```

### Nenhuma alteracao no engine

Todos os dados necessarios (`cogsPerActive`, `fixedPerActive`, `unitCostPerActiveExMarketing`, `margin`) ja existem no `MonthResult`.

### Estrutura do grafico de evolucao

- Eixo X: Mes (1-12)
- Eixo Y esquerdo: R$ (COGS/cliente e Fixos/cliente como barras empilhadas)
- Eixo Y direito: % (Margem liquida como linha)
- Tooltip customizado mostrando os 3 valores + custo unitario total

