
# Aba de Custos Fixos Interativa — Editar, Adicionar e Excluir

## Resumo

Transformar a aba "Custos Fixos" em uma interface totalmente interativa onde o usuario pode **editar valores**, **adicionar novos itens** e **excluir itens existentes** em cada categoria (RH, Ferramentas BRL, Ferramentas USD). Todas as alteracoes propagam automaticamente para as demais abas do dashboard.

## Arquitetura da Solucao

O problema principal e que `ASSUMPTIONS` e `as const` (imutavel). A solucao e mover os custos fixos para um **estado React** no `FinancialDashboard`, e fazer o engine aceitar esses custos como parametro em vez de ler direto do `ASSUMPTIONS`.

### Modelo de dados dos itens editaveis

Cada categoria tera uma lista dinamica de itens:

```text
CostItem = { id: string, label: string, value: number }       // BRL
UsdCostItem = { id: string, label: string, usd: number }      // USD
```

O estado no Dashboard sera:

```text
{
  rhItems: CostItem[],
  toolsBrlItems: CostItem[],
  toolsUsdItems: UsdCostItem[],
  usdFx: number,
  iofAndFeesRate: number,
  twilioNumberUsdPerCustomer: number,
  twilioNumberShareOfCustomers: number
}
```

## Funcionalidades da Interface

### Editar
- Clicar no valor abre um input numerico inline
- Enter ou blur confirma a edicao
- Valores alterados ficam destacados com borda azul

### Adicionar
- Botao "+ Adicionar" no rodape de cada tabela de categoria
- Abre uma linha com dois campos: nome do item e valor
- Enter ou botao de confirmar salva o novo item

### Excluir
- Icone de lixeira (X) ao lado de cada item
- Confirmacao visual antes de remover (hover vermelho)
- Item removido desaparece e totais recalculam

### Resetar
- Botao "Resetar valores originais" restaura todos os itens ao estado padrao do engine

## Propagacao ao Dashboard

Quando qualquer item e editado/adicionado/excluido:
1. O estado `editableCosts` atualiza no `FinancialDashboard`
2. Uma funcao `overrideFixedCosts()` calcula o novo total fixo a partir dos itens do estado
3. Os `useMemo` de `staticScenarios` e `projection` dependem desse estado, forcando recalculo
4. Todas as abas (Investor, DRE, Custo por Cliente, etc.) refletem os novos valores

## Detalhes Tecnicos

### 1. `src/lib/financial-engine.ts` — Exportar defaults e aceitar override

- Exportar `DEFAULT_FIXED_COSTS` com os valores originais do `fixedMonthlyCosts`
- Remover `as const` do `ASSUMPTIONS` para permitir tipagem flexivel
- Criar funcao `sumFixedCostsFromItems(rhItems, toolsBrlItems, toolsUsdItems, params, activeCustomers)` que calcula o total a partir de listas dinamicas em vez de ler `ASSUMPTIONS.fixedMonthlyCosts`
- Adicionar parametro opcional `fixedCostOverride?: number` a `monthModel` e `build12MonthProjection` para substituir o calculo interno de custos fixos

### 2. `src/components/dashboard/FixedCostsView.tsx` — Reescrever com CRUD

- Receber como props: `rhItems`, `toolsBrlItems`, `toolsUsdItems`, parametros de cambio/Twilio, e callbacks `onUpdate`, `onReset`
- Componente `EditableCell`: input inline para edicao de valores
- Componente `AddItemRow`: linha com inputs de nome + valor para adicionar novo item
- Botao de excluir (icone X) em cada linha
- Parametros editaveis: cambio, IOF, custo Twilio, penetracao Twilio
- Botao "Resetar valores originais"

### 3. `src/components/dashboard/FinancialDashboard.tsx` — Estado centralizado

- Criar estado `editableCosts` com `useState` inicializado a partir dos defaults
- Funcao `calcFixedTotal()` que soma todos os itens do estado + conversao USD + Twilio
- Passar `fixedCostOverride` para `monthModel` e `build12MonthProjection`
- Passar items e callbacks para `FixedCostsView`
- Incluir `editableCosts` nas dependencias dos `useMemo`

### Fluxo completo

```text
Usuario edita/adiciona/exclui item na aba Custos
  -> Callback atualiza estado editableCosts no Dashboard
  -> useMemo recalcula calcFixedTotal()
  -> monthModel e build12MonthProjection recebem novo fixedCostOverride
  -> Todas as abas re-renderizam com novos valores
```
