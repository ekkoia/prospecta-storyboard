

# Renomear titulo do painel de resumo na Investor View

## O que muda

Trocar o titulo atual **"📌 1 tela / 8 números (o resumo que o investidor quer)"** por algo mais descritivo e direto, como:

**"📊 Resumo Financeiro Mensal"**

Isso reflete melhor o conteudo do card (metricas financeiras do mes) sem referenciar a quantidade de itens (que agora sao 9, nao mais 8).

## Detalhe Tecnico

### Arquivo: `src/components/dashboard/InvestorView.tsx`

Alterar a prop `title` do componente `Section` (linha ~44) de `"📌 1 tela / 8 números (o resumo que o investidor quer)"` para `"📊 Resumo Financeiro Mensal"`.

