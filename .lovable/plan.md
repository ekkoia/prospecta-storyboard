
# Rampa de Aquisicao Progressiva

## Objetivo

Substituir o solver de aquisicao constante por uma **rampa progressiva**, onde o numero de novos clientes comeca menor e cresce gradualmente ao longo dos 12 meses ate atingir a meta. Isso torna os graficos de marketing, CAC e novos clientes dinamicos em vez de linhas planas.

## Abordagem

Usar uma **rampa linear** onde o mes 1 adquire menos e o mes 12 adquire mais. O solver encontra o valor base `b` tal que a sequencia `b, b+d, b+2d, ..., b+11d` (com incremento `d` proporcional a `b`) resulte no target de clientes ativos ao final de 12 meses.

A proporcao sera: mes 1 recebe ~50% do valor medio, mes 12 recebe ~150%. Isso cria uma curva realista de "aquecimento" do marketing.

## Alteracoes

### Arquivo: `src/lib/financial-engine.ts`

**Novo solver com rampa (`build12MonthProjection`)**:

- Substituir `solveNewPerMonth` (que retorna um unico valor constante) por `solveRamp` que retorna um **array de 12 valores crescentes**.
- Logica da rampa:
  - Definir fator de rampa: mes 1 = 0.5x da media, mes 12 = 1.5x da media
  - O peso de cada mes `m` (1-12) sera: `weight(m) = 0.5 + (1.0 * (m-1) / 11)`
  - O solver encontra o valor `avgNew` tal que, aplicando `newForMonth(m) = round(avgNew * weight(m))`, a base atinja o target
  - Retornar `newPerMonth` como array de 12 valores em vez de um unico numero
- Atualizar o loop de projecao para usar `newSchedule[m-1]` em vez de `newPerMonth` constante
- Retorno muda de `{ rows, newPerMonth: number }` para `{ rows, newSchedule: number[], avgNewPerMonth: number }`

**Interface `build12MonthProjection` retorno**:
```text
Antes:  { rows: MonthResult[], newPerMonth: number }
Depois: { rows: MonthResult[], newSchedule: number[], avgNewPerMonth: number }
```

### Arquivo: `src/components/dashboard/AcquisitionView.tsx`

- Atualizar Props: `newPerMonth` vira `avgNewPerMonth` e adicionar `newSchedule`
- KPI "Novos clientes/mes": mostrar `avgNewPerMonth` com sub "media (rampa progressiva)"
- Adicionar KPIs: "Novos mes 1" e "Novos mes 12" para mostrar o range da rampa
- A nota explicativa passa a mencionar a rampa progressiva em vez de aquisicao constante
- Os graficos ja usam `projectionRows` que terao valores variados -- funcionam automaticamente

### Arquivo: `src/components/dashboard/FinancialDashboard.tsx`

- Atualizar o destructuring de `projection` para usar `avgNewPerMonth` e `newSchedule`
- Passar as novas props para `AcquisitionView`

## Impacto nos Graficos

- **Evolucao de Clientes**: A linha "Novos/mes" passa de reta horizontal para curva ascendente
- **Marketing Mensal vs Acumulado**: As barras crescem progressivamente, criando uma escada visual
- **CAC Bruto vs Liquido**: Permanece constante (CAC por cliente nao muda com volume neste modelo)

## Detalhes Tecnicos do Solver

```text
Peso do mes m: w(m) = 0.5 + (m - 1) / 11
Novos no mes m: round(avg * w(m))
Solver: busca binaria em avg ate que base final = target

Exemplo (target 200, start 50, churn 3.5%):
  Mes 1:  ~9 novos (0.50x)
  Mes 6:  ~14 novos (0.95x)
  Mes 12: ~22 novos (1.50x)
```

Nenhuma alteracao nas abas Investor, Monetizacao, Unit Cost ou DRE -- elas usam o snapshot estatico ou os `projectionRows` que ja refletirao a rampa.
