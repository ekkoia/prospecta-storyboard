

# Correcao do Bug: Cenario Fixo em 200 no Modo Moderado

## Problema Identificado

Na aba "Investor View", ao selecionar os cenarios 100 ou 500 no modo Moderado, os dados ficam fixados no cenario de 200.

**Causa raiz:** O `currentStatic` tenta encontrar o cenario correto comparando `activeCustomers === target`. Porem, o calculo do `monthModel` aplica churn e novos clientes, resultando em valores ligeiramente diferentes do target original:

- 100 clientes -> `activeCustomers = 101` (nao bate com 100)
- 200 clientes -> `activeCustomers = 200` (bate por coincidencia)
- 500 clientes -> `activeCustomers = 501` (nao bate com 500)

Quando o `find` falha, o fallback `staticScenarios[1]` sempre retorna o cenario de 200.

## Solucao

Alterar o `currentStatic` para usar o indice do array baseado no cenario selecionado, em vez de buscar pelo valor de `activeCustomers`.

### Alteracao em `src/components/dashboard/FinancialDashboard.tsx`

Substituir:

```typescript
const currentStatic = useMemo(() => {
  const target = scenarioTargets[scenario];
  return staticScenarios.find((s) => s.activeCustomers === target) || staticScenarios[1];
}, [scenario, staticScenarios]);
```

Por:

```typescript
const currentStatic = useMemo(() => {
  const scenarioIndex = { "100": 0, "200": 1, "500": 2 } as const;
  return staticScenarios[scenarioIndex[scenario]];
}, [scenario, staticScenarios]);
```

Essa abordagem mapeia diretamente o cenario selecionado ao indice correto do array `staticScenarios`, eliminando o problema de comparacao por valor arredondado.

## Impacto

- Correcao simples de 1 linha logica
- Nenhuma mudanca no motor financeiro ou nos demais componentes
- Funciona corretamente em todos os modos (Moderado, Pessimista, Hormozi)
