

# Nova Aba "Churn" no Dashboard

## Objetivo
Adicionar uma aba "Churn" ao dashboard financeiro para exibir a analise completa de churn das versoes V1 e V2 do Prospecta, incluindo dados agregados, perfis individuais e insights estrategicos.

## Estrutura da Aba

A aba tera 4 secoes principais:

### 1. KPI Cards (topo)
- **V1 - Total Vendas**: 41
- **V2 - Total Vendas**: 17
- **V1 - Faturamento**: R$ 9.477
- **V2 - Faturamento**: R$ 29.995

### 2. Secao "Contexto V1 vs V2"
Dois cards lado a lado com resumo de cada versao:
- V1: MVP embrionario, processo manual, busca GMB + fluxo SDR/BDR, tempo entrega ~3 dias, bugs frequentes
- V2: SaaS estruturado, salto de faturamento, desafios operacionais e de experiencia

### 3. Secao "Categorias de Churn" (V2)
- Grafico de pizza ou barras horizontais mostrando a distribuicao por categoria (Pre-Ativacao 28.6%, Imaturidade 14.3%, Contexto Externo 14.3%, Silencioso 14.3%, Fantasma 14.3%, Fraudulento 14.3%)
- Tabela resumo com categoria, clientes e percentual

### 4. Secao "Perfis de Churn" (V2)
Cards expansiveis (collapsible) para cada cliente com:
- Nome, plano, permanencia, uso, motivo
- Diagnostico detalhado
- Status de resolucao (quando aplicavel)

### 5. Secao "Causas Principais V2"
Lista das 7 causas com status (resolvido, em andamento, pendente) usando badges coloridos

### 6. Secao "Insight Principal"
Card destacado com o insight de que 43% do churn ocorre antes da ativacao

## Detalhes Tecnicos

### Arquivos a criar:
1. **`src/lib/churn-data.ts`** — Dados estaticos do churn (V1, V2, perfis de clientes, categorias, causas). Tudo tipado com interfaces TypeScript.

2. **`src/components/dashboard/ChurnView.tsx`** — Componente da aba, usando os mesmos padroes visuais do dashboard (Section, KpiCard, cards com bg-card/border-border/rounded-2xl). Incluira:
   - Graficos Recharts para distribuicao de categorias
   - Collapsible do Radix para perfis individuais
   - Badges para status das causas

### Arquivos a modificar:
1. **`src/components/dashboard/FinancialDashboard.tsx`**:
   - Adicionar `{ key: "churn", label: "Churn" }` ao array TABS
   - Importar e renderizar `ChurnView` quando `tab === "churn"`

### Padroes seguidos:
- Mesmo estilo visual dos outros views (Section, KpiCard, cards com shadow-card)
- Responsivo mobile com grids adaptativos (grid-cols-1 sm:grid-cols-2)
- Dados hardcoded em arquivo separado (sem backend necessario)
- Componentes Radix ja instalados (Collapsible) para os perfis expansiveis
