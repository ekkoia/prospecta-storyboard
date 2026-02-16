
# Integrar Custos Reais de Voz (VAPI + Twilio) ao Motor Financeiro

## Dados Informados

**Custo real por minuto de chamada: $0.175/min**
- VAPI Platform: $0.055/min
- TTS (Text-to-Speech): $0.027/min
- LLM: $0.027/min
- STT (Speech-to-Text): $0.009/min
- Twilio outbound: $0.066/min
- Twilio Phone Number: $4.25/mes (ja modelado)

**Minutos inclusos nos planos:**
- Lite: 0 (sem voz)
- Starter: 0 (sem voz)
- Pro: 150 min/mes
- Enterprise: 350 min/mes

**Packs de voz (venda avulsa):**

| Pack | Preco | Min inclusos | Custo real (COGS) | Margem |
|------|-------|-------------|-------------------|--------|
| R$ 250 | 100 min | ~R$ 99 | 60% |
| R$ 650 | 300 min | ~R$ 296 | 54% |
| R$ 1.100 | 600 min | ~R$ 592 | 46% |
| R$ 1.700 | 1.000 min | ~R$ 986 | 42% |
| R$ 2.900 | 2.000 min | ~R$ 1.972 | 32% |

(COGS calculado a R$ 5,22 + 8% IOF = R$ 0,986/min)

## O que muda no modelo

### 1. Adicionar COGS de voz aos planos Pro e Enterprise

Os minutos inclusos nos planos geram custo variavel que precisa ser somado ao `cogsByPlan`:

- **Pro**: 150 min x R$ 0,986 = **+R$ 148/mes** por cliente Pro
  - cogsByPlan.pro: 586 -> **734**
- **Enterprise**: 350 min x R$ 0,986 = **+R$ 345/mes** por cliente Enterprise
  - cogsByPlan.enterprise: 1470 -> **1.815**

### 2. Corrigir COGS dos voice packs

O modelo atual usa `cogsRateOfVoiceRevenue: 0.32` (32%), mas os dados reais mostram que a taxa de COGS varia de 32% a 60% dependendo do pack.

Usando uma media ponderada razoavel (assumindo que packs menores vendem mais), o COGS medio fica em torno de **50%** em vez de 32%.

- `voicePacks.cogsRateOfVoiceRevenue`: 0.32 -> **0.50**

### 3. Adicionar constante de custo por minuto ao engine

Para referencia e uso futuro, registrar:
- `voiceCostPerMinuteUsd: 0.175` no ASSUMPTIONS

## Detalhes Tecnicos

### `src/lib/financial-engine.ts`

1. Adicionar campo `voiceCostPerMinuteUsd: 0.175` e `includedVoiceMinutes` por plano ao `ASSUMPTIONS`:

```text
plans: {
  lite:       { ..., includedVoiceMinutes: 0 },
  starter:    { ..., includedVoiceMinutes: 0 },
  pro:        { ..., includedVoiceMinutes: 150 },
  enterprise: { ..., includedVoiceMinutes: 350 },
}
```

2. Atualizar `cogsByPlan` para incluir o custo dos minutos:
   - pro: 586 + 148 = 734
   - enterprise: 1470 + 345 = 1815

3. Atualizar `voicePacks.cogsRateOfVoiceRevenue` de 0.32 para 0.50

4. Adicionar array de packs de voz para referencia na aba de monetizacao:

```text
voicePackOptions: [
  { price: 250, minutes: 100 },
  { price: 650, minutes: 300 },
  { price: 1100, minutes: 600 },
  { price: 1700, minutes: 1000 },
  { price: 2900, minutes: 2000 },
]
```

### Impacto nas abas

- **Investor View / DRE**: COGS total aumenta (Pro e Enterprise ficam mais caros), reduzindo margem
- **Custo por Cliente**: `cogsPerActive` sobe para refletir os minutos inclusos
- **Monetizacao (Hormozi)**: Voice packs com COGS corrigido mostra margem real dos packs
- **Custos Fixos**: Sem alteracao (custos de voz sao variaveis, nao fixos)
