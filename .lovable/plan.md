

# Correcao da Logica de Novos Clientes no Cenario Pessimista

## Problema

No snapshot estatico (aba Investor), o calculo de novos clientes usa `newCustomers = base * churnRate`. No modo pessimista (churn 6%), isso resulta em MAIS novos clientes do que no moderado (churn 3.5%), o que e contraintuitivo para o usuario.

- Moderado (200 clientes): `200 * 0.035 = 7 novos`
- Pessimista (200 clientes): `200 * 0.06 = 12 novos`

O investidor le "12 novos no pessimista" e pensa: "como pessimista tem mais clientes novos?"

## Causa Raiz

O snapshot estatico assume estado estavel (novos = churn replacement). A logica matematica esta correta (precisa repor mais), mas a apresentacao confunde.

## Solucao

Manter o calculo de reposicao (e correto para o DRE estatico), mas:

1. **Renomear o campo** de "Novos no mes (estimado)" para "Novos necessarios (reposicao churn)" — deixando claro que e quantos PRECISA adquirir, nao quantos VAI adquirir.

2. **Adicionar nota explicativa** no resumo do investidor dizendo que no pessimista o custo de reposicao e maior (mais novos necessarios + CAC x2).

3. **Ajustar o KPI de "Clientes Ativos"** para incluir no subtitulo a quantidade de novos necessarios, dando contexto.

### Alteracoes

**Arquivo: `src/components/dashboard/InvestorView.tsx`**

Na secao "1 tela / 8 numeros", alterar o label:
- De: `"Novos no mes (estimado)"`
- Para: `"Novos necessarios (repos. churn)"`

Adicionar nota contextual apos os 8 numeros explicando:
- "No cenario pessimista, o churn maior exige mais reposicoes, e o CAC dobrado encarece cada aquisicao — por isso o custo de marketing sobe desproporcionalmente."

**Arquivo: `src/components/dashboard/FinancialDashboard.tsx`**

Nenhuma alteracao no calculo — a logica de reposicao esta correta para o DRE estatico. O problema e de comunicacao, nao de calculo.

## Impacto

- Correcao apenas de labels e textos explicativos
- Nenhuma mudanca no motor financeiro
- O investidor entende que "pessimista" = precisa de mais reposicoes + cada uma custa o dobro

