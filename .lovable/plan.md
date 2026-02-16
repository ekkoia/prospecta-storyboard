
# KPI de Investimento Bruto + Simulador de Trafego Pago

## O que sera adicionado

### 1. Novo KPI: Investimento medio mensal bruto (trafego pago)

Adicionar um KPI card mostrando o **marketing bruto medio mensal** (antes do abatimento do teste pago). Esse e o valor real que sai do bolso para trafego pago.

- Calculo: soma de `marketingGross` dos 12 meses / 12
- Exibido na grade de KPIs da aba Aquisicao (que passa de 6 para 7 cards, reorganizando o grid)

### 2. Simulador interativo de orcamento de trafego

Uma secao nova no final da aba Aquisicao com um **slider de orcamento mensal** que calcula em tempo real:

- Quantos clientes novos esse orcamento geraria por mes (baseado no CAC blended bruto)
- Quantos clientes novos por plano (aplicando o mix atual)
- Receita mensal estimada desses novos clientes (ARPU x novos)

O usuario arrasta o slider (de R$ 1.000 a R$ 50.000) e ve instantaneamente o resultado.

---

## Detalhes Tecnicos

### Arquivo: `src/components/dashboard/AcquisitionView.tsx`

**1. Calcular e exibir KPI de marketing bruto medio:**

```typescript
const totalMarketingGross = projectionRows.reduce((acc, r) => acc + r.marketingGross, 0);
const avgMonthlyGross = totalMarketingGross / 12;
```

Adicionar um KpiCard:
```
KpiCard title="Investimento medio/mes" value={brl(avgMonthlyGross)} sub="trafego pago (bruto)" tone="pink"
```

Grid de KPIs reorganizado para acomodar 7 cards (muda para grid de 7 colunas ou mantem 6 e empilha).

**2. Simulador de trafego pago:**

- Importar `Slider` de `@/components/ui/slider` e `ASSUMPTIONS` do engine
- Adicionar estado local: `const [budget, setBudget] = useState(5000)`
- Calcular CAC blended bruto: media ponderada pelo mix dos planos
- `clientesNovos = budget / cacBlendedGross`
- Distribuir por plano usando o mix
- Calcular receita estimada dos novos clientes

Renderizar dentro de uma `Section` com:
- Slider de R$ 1.000 a R$ 50.000 (step R$ 500)
- Label mostrando o valor selecionado
- 3-4 metricas resultado: clientes novos, distribuicao por plano, receita gerada, ROI estimado (receita / investimento)

**3. Importacoes novas necessarias:**
- `useState` do React
- `Slider` de `@/components/ui/slider`
- `ASSUMPTIONS` de `@/lib/financial-engine`
