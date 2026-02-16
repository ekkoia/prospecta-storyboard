

# Repricing: Planos Pro/Enterprise e Voice Packs

## Diagnostico Atual (com COGS de voz integrados)

### Planos - Margem Bruta Atual

| Plano | Preco | COGS | Margem Bruta |
|-------|-------|------|-------------|
| Lite | R$ 397 | R$ 95 | **76%** |
| Starter | R$ 897 | R$ 140 | **84%** |
| Pro | R$ 1.497 | R$ 734 | **51%** |
| Enterprise | R$ 2.997 | R$ 1.815 | **39%** |

O Enterprise tem margem inferior a 40% — inaceitavel para SaaS B2B. O Pro esta na zona de risco.

### Voice Packs - Margem Atual

| Pack | Preco | COGS (R$ 0,986/min) | Margem |
|------|-------|---------------------|--------|
| 100 min | R$ 250 | R$ 99 | **60%** |
| 300 min | R$ 650 | R$ 296 | **54%** |
| 600 min | R$ 1.100 | R$ 592 | **46%** |
| 1.000 min | R$ 1.700 | R$ 986 | **42%** |
| 2.000 min | R$ 2.900 | R$ 1.972 | **32%** |

Os packs maiores subsidiam o cliente — quanto mais compra, pior a margem. O pack de 2.000 min tem apenas 32%.

---

## Proposta de Repricing

### Planos

O objetivo e levar todos os planos para margem bruta minima de 60%.

| Plano | Preco Atual | Preco Novo | COGS | Nova Margem |
|-------|-------------|------------|------|-------------|
| Lite | R$ 397 | R$ 397 | R$ 95 | 76% (sem mudanca) |
| Starter | R$ 897 | R$ 897 | R$ 140 | 84% (sem mudanca) |
| **Pro** | R$ 1.497 | **R$ 1.997** | R$ 734 | **63%** |
| **Enterprise** | R$ 2.997 | **R$ 4.497** | R$ 1.815 | **60%** |

**Justificativa do aumento:**
- Pro sobe R$ 500 (+33%): justificavel pelos 150 min de voz inclusos, que valem R$ 148/mes em custo real
- Enterprise sobe R$ 1.500 (+50%): os 350 min de voz + 18.000 buscas + 4 WhatsApps justificam o premium. Margem sai de 39% para 60%

### Voice Packs

O objetivo e manter margem minima de 50% em todos os packs, preservando o desconto por volume (mas moderado).

| Pack | Preco Atual | Preco Novo | COGS | Nova Margem |
|------|-------------|------------|------|-------------|
| 100 min | R$ 250 | R$ 250 | R$ 99 | 60% (sem mudanca) |
| 300 min | R$ 650 | R$ 650 | R$ 296 | 54% (sem mudanca) |
| 600 min | R$ 1.100 | **R$ 1.200** | R$ 592 | **51%** |
| 1.000 min | R$ 1.700 | **R$ 1.997** | R$ 986 | **51%** |
| 2.000 min | R$ 2.900 | **R$ 3.997** | R$ 1.972 | **51%** |

**Nota sobre avgRevenuePerBuyer**: Com os novos precos, a receita media por comprador de voice pack sobe. Assumindo a mesma distribuicao de compras, o `avgRevenuePerBuyer` sera atualizado de R$ 980 para **R$ 1.250** (estimativa conservadora).

---

## Detalhes Tecnicos

### Arquivo: `src/lib/financial-engine.ts`

1. **Atualizar precos dos planos** (linhas 89-90):
   - `pro.price`: 1497 -> **1997**
   - `enterprise.price`: 2997 -> **4497**

2. **Atualizar voice pack options** (linhas 79-85):
   - Pack 600 min: 1100 -> **1200**
   - Pack 1000 min: 1700 -> **1997**
   - Pack 2000 min: 2900 -> **3997**

3. **Atualizar avgRevenuePerBuyer** (linha 106):
   - 980 -> **1250**

### Impacto no Dashboard

- **ARPU sobe**: Pro e Enterprise geram mais receita por cliente
- **Margem bruta melhora**: de ~65% para ~70%+ no cenario de 200 clientes
- **DRE**: Lucro operacional aumenta significativamente, especialmente nos cenarios com maior proporcao de Pro/Enterprise
- **Investor View**: Todos os KPIs de margem melhoram
- **Monetizacao (Hormozi)**: Voice packs mostram margens mais saudaveis e consistentes

