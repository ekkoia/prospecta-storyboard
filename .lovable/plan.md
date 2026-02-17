

# Ajustes de Responsividade Mobile

## Problemas Identificados

1. **Grafico de pizza (Investor View)**: Os labels longos como "Enterprise (R$4497): 5%" e "Starter (R$997): 35%" estao sendo cortados nas laterais em telas pequenas (390px). O outerRadius de 110px combinado com labels longos transborda o container.

2. **Grids de KPI cards**: Varias abas usam `md:grid-cols-4` ou `md:grid-cols-5`, pulando direto de 1 coluna para 4-5 sem um passo intermediario. Em telas medias isso pode ficar apertado.

3. **Padding geral**: O container principal usa `p-6` que ocupa muito espaco em mobile.

## Solucao

### 1. InvestorView.tsx — Pie Chart responsivo

- Reduzir o `outerRadius` para 80px em mobile e manter 110px em desktop usando um estado que verifica a largura
- Alternativa mais simples: reduzir o `fontSize` dos labels para 9px e o `outerRadius` para 90px, aumentando a `height` do container para 380px para dar mais espaco vertical aos labels
- Usar `labelLine={false}` ja esta correto

Abordagem escolhida: reduzir `outerRadius` para 90, `fontSize` para 9 em mobile. Adicionar uma verificacao com `useIsMobile()` hook que ja existe no projeto para ajustar dinamicamente.

Em mobile:
- `outerRadius`: 80
- `fontSize`: 9
- `height`: 350 (mais espaco vertical)

Em desktop:
- Manter valores atuais (outerRadius 110, fontSize 11, height 320)

### 2. InvestorView.tsx — KPI grid

- Mudar `md:grid-cols-4` para `grid-cols-2 md:grid-cols-4` nos KPI cards para ter 2 colunas em mobile

### 3. AcquisitionView.tsx — KPI grid

- Mudar `md:grid-cols-3 lg:grid-cols-4` para `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`

### 4. DreView.tsx — KPI grid

- Mudar `md:grid-cols-5` para `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`

### 5. MonetizationView.tsx — KPI grid

- Mudar `md:grid-cols-5` para `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`

### 6. UnitCostView.tsx — KPI grid

- Mudar `md:grid-cols-5` para `grid-cols-2 md:grid-cols-3 lg:grid-cols-5`

### 7. FixedCostsView.tsx — KPI grid

- Mudar `md:grid-cols-4` para `grid-cols-2 md:grid-cols-4`

### 8. FinancialDashboard.tsx — Padding

- Mudar `p-6` para `p-3 md:p-6` no container principal para reduzir padding em mobile

## Arquivos Modificados

- `src/components/dashboard/InvestorView.tsx`
- `src/components/dashboard/AcquisitionView.tsx`
- `src/components/dashboard/DreView.tsx`
- `src/components/dashboard/MonetizationView.tsx`
- `src/components/dashboard/UnitCostView.tsx`
- `src/components/dashboard/FixedCostsView.tsx`
- `src/components/dashboard/FinancialDashboard.tsx`

