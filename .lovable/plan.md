

# Ajuste de Custos Reais no Motor Financeiro

## Resumo das Alteracoes

Atualizar o objeto `ASSUMPTIONS` em `src/lib/financial-engine.ts` para refletir os custos reais da operacao, removendo ferramentas nao utilizadas e adicionando novas despesas fixas e custos de infraestrutura de servicos.

## 1. Custos Fixos Mensais (BRL) — Adicionar

| Item | Valor |
|------|-------|
| Social Media | R$ 1.000 |
| Marcos Simao | R$ 3.000 |
| Gestor do Projeto/Estrategia | R$ 4.000 |
| **Total adicionado** | **R$ 8.000/mes** |

## 2. Ferramentas USD — Remover

| Item | Valor USD | Motivo |
|------|-----------|--------|
| Tally | $26 | Nao utilizado mais |
| ClickUp | $30 | Nao utilizado mais |

## 3. Ferramentas USD — Adicionar/Manter

| Item | Valor USD | Observacao |
|------|-----------|------------|
| SerpAPI | $250 | Plano Big Data (30k buscas) — NOVO |
| Instantly | $97 | Ja existe, manter |
| VAPI + Twilio (base) | Variavel | Custo por minuto adicionado ao COGS dos planos com voz |

## 4. COGS por Plano — Atualizar com custo de voz

Somente Pro e Enterprise incluem IA de ligacao. Custo real por minuto: $0.32, convertido a BRL (× 5.69 × 1.08 = ~R$1.97/min).

| Plano | COGS atual | Minutos voz incluidos | Custo voz (BRL) | Novo COGS |
|-------|------------|----------------------|-----------------|-----------|
| Lite | R$ 95 | 0 | R$ 0 | R$ 95 |
| Starter | R$ 140 | 0 | R$ 0 | R$ 140 |
| Pro | R$ 290 | 150 min/mes | ~R$ 296 | R$ 586 |
| Enterprise | R$ 780 | 350 min/mes | ~R$ 690 | R$ 1.470 |

## 5. Impacto nos Custos Fixos Totais

Antes (base fixa sem Twilio variavel):

```text
Custos BRL:  1000 + 1300 + 500 + 450 + 1800 + 245 + 1000 + 300 + 180 + 150 = R$ 7.125
Custos USD:  (26 + 30 + 97) × 5.69 × 1.08 = ~R$ 940
Total base:  ~R$ 8.065/mes
```

Depois:

```text
Custos BRL:  7.125 + 1.000 + 3.000 + 4.000 = R$ 15.125
Custos USD:  (250 + 97) × 5.69 × 1.08 = ~R$ 2.133
Total base:  ~R$ 17.258/mes (+R$ 9.193)
```

## Detalhes Tecnicos

### Arquivo: `src/lib/financial-engine.ts`

**1. `fixedMonthlyCosts` — Atualizar objeto (linhas 42-48):**

- Remover: `tallyUsd: 26`, `clickupUsd: 30`
- Adicionar BRL: `socialMedia: 1000`, `marcosSimao: 3000`, `gestorProjeto: 4000`
- Adicionar USD: `serpApiUsd: 250`
- Manter: `instantlyUsd: 97`

**2. `cogsByPlan` — Atualizar valores (linha 41):**

- Pro: 290 → 586
- Enterprise: 780 → 1470

**3. `sumFixedCosts` — Atualizar formula (linhas 69-78):**

- No calculo de `baseFixed`, substituir `f.tallyUsd + f.clickupUsd + f.instantlyUsd` por `f.serpApiUsd + f.instantlyUsd`
- Adicionar `f.socialMedia + f.marcosSimao + f.gestorProjeto` na soma dos custos BRL

Nenhuma alteracao nos arquivos de componentes — todas as views ja consomem os dados calculados pelo engine.

