
# Nova Aba de Detalhamento de Custos Fixos + Correcao do Cambio

## Problema Identificado: Cambio Desatualizado

O motor financeiro usa `usdFx: 5.69`, mas o dolar atual esta **R$ 5,22**. Essa diferenca impacta todos os custos em USD (SerpAPI, Instantly, numeros Twilio). A correcao sera feita junto com a nova aba.

## Nova Aba: "Custos Fixos"

Criar uma aba dedicada que exibe cada item de custo fixo separado em tres categorias, com subtotais e total geral.

### Categorias e Itens

**Recursos Humanos (BRL)**

| Item | Valor |
|------|-------|
| Suporte | R$ 1.000 |
| Gestor de Automacao | R$ 1.300 |
| Closer (fixo) | R$ 500 |
| Contabilidade | R$ 450 |
| Producao de Video | R$ 1.800 |
| Social Media | R$ 1.000 |
| Marcos Simao | R$ 3.000 |
| Gestor do Projeto | R$ 4.000 |
| **Subtotal RH** | **R$ 13.050** |

**Ferramentas e Infra (BRL)**

| Item | Valor |
|------|-------|
| Infraestrutura | R$ 245 |
| Lovable | R$ 1.000 |
| GPT/Claude | R$ 300 |
| Banco de dados | R$ 180 |
| Dominio | R$ 150 |
| **Subtotal Ferramentas BRL** | **R$ 1.875** |

**Ferramentas (USD) — convertidas a R$ 5,22 + 8% IOF**

| Item | USD | BRL (convertido) |
|------|-----|-------------------|
| SerpAPI | $250 | ~R$ 1.409 |
| Instantly | $97 | ~R$ 547 |
| **Subtotal USD** | **$347** | **~R$ 1.956** |

**Custo Variavel por Cliente (Twilio Numbers)**

| Item | Formula |
|------|---------|
| Numero Twilio | $4,25/cliente x 15% dos clientes x cambio |

**Total Fixo Base: ~R$ 16.881/mes** (sem Twilio variavel)

### Visual

- Grid de cards por categoria com icones distintos
- Cada card mostra o item e valor em BRL
- Cards USD mostram valor original em dolares e conversao
- Rodape com total geral e nota sobre o cambio utilizado
- Indicacao do custo de Twilio variavel por numero de clientes ativos

## Detalhes Tecnicos

### 1. `src/lib/financial-engine.ts` — Corrigir cambio (1 linha)

- Linha 46: `usdFx: 5.69` → `usdFx: 5.22`

### 2. `src/components/dashboard/FixedCostsView.tsx` — Novo arquivo

- Importar `ASSUMPTIONS`, `brl`, `sumFixedCosts` do engine
- Importar `Section` e `KpiCard`
- Calcular subtotais por categoria usando os valores do `ASSUMPTIONS.fixedMonthlyCosts`
- Converter USD para BRL usando a formula do engine (`usd * usdFx * (1 + iofAndFeesRate)`)
- Renderizar tres secoes (RH, Ferramentas BRL, Ferramentas USD) com tabelas
- Mostrar total geral e nota sobre cambio e IOF
- Receber `activeCustomers` como prop para calcular custo Twilio variavel

### 3. `src/components/dashboard/FinancialDashboard.tsx` — Adicionar aba

- Importar `FixedCostsView`
- Adicionar entrada no array `TABS`: `{ key: "costs", label: "🏢 Custos Fixos" }`
- Atualizar tipo `TabKey` (automatico via `typeof TABS`)
- Renderizar `FixedCostsView` quando `tab === "costs"`, passando `activeCustomers` do cenario atual
