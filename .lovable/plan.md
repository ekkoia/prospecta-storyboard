

# Adicionar "Custo Mensal de Operacao" (Burn Rate) na Aba de Aporte

## O que o investidor quer saber

"Quanto custa por mes tocar esse projeto?" -- uma resposta direta com a composicao clara do custo operacional mensal, antes de falar de fases e KPIs.

## Solucao

Adicionar um painel **"Custo Mensal de Operacao"** no topo da secao de fases, mostrando o burn rate mensal detalhado por categoria. Isso responde a pergunta do investidor de forma imediata.

## O que sera exibido

### Novo painel: "Quanto custa operar por mes?"

Uma caixa destacada mostrando:

```
Custo Operacional Mensal (burn rate)
Total: ~R$ 30.000/mes

Composicao:
  Equipe (RH)           R$ 25.050/mes
    - Suporte             R$ 1.000
    - Gestor Automacao    R$ 1.300
    - Closer (fixo)       R$ 500
    - Contabilidade       R$ 450
    - Producao Video      R$ 1.800
    - Social Media        R$ 1.000
    - Marcos Simao        R$ 3.000
    - Gestor Projeto      R$ 4.000
    - Pro-labore          R$ 12.000

  Ferramentas (BRL)     R$ 1.875/mes
    - Infra, Lovable, GPT, DB, Dominio

  Ferramentas (USD)     ~R$ 1.956/mes
    - SerpAPI, Instantly (convertido a R$ 5,22 + IOF)

  Trafego Pago          R$ 3.000-8.000/mes (variavel)
    - Depende do ritmo de aquisicao do cenario

  COGS (custos variaveis)  Variavel por cliente
    - Voz, APIs, etc.
```

Abaixo, uma frase clara:

> "Esse e o custo para manter a operacao rodando. Nos primeiros meses, a receita nao cobre esse custo -- por isso o aporte cobre o gap ate a receita escalar."

## Alteracoes tecnicas

### Arquivo: `src/components/dashboard/InvestmentView.tsx`

1. **Importar** `DEFAULT_FIXED_COSTS` e `sumFixedCostsFromItems` de `financial-engine.ts`

2. **Novo componente `BurnRatePanel`** renderizado antes das fases, que:
   - Lista os itens de RH com nome e valor (do `DEFAULT_FIXED_COSTS.rhItems`)
   - Lista ferramentas BRL (do `DEFAULT_FIXED_COSTS.toolsBrlItems`)
   - Lista ferramentas USD convertidas (do `DEFAULT_FIXED_COSTS.toolsUsdItems` com taxa de cambio)
   - Mostra o trafego pago estimado do mes 1 (do `projectionRows[0].marketingGross`)
   - Soma tudo e mostra o total do burn rate
   - Usa um layout com `Collapsible` (radix) para o detalhamento -- mostra o total sempre, e o detalhe pode ser expandido

3. **Posicionamento**: Entre os KPI cards de projecao e a secao de fases

### Nenhuma alteracao no motor financeiro

Os dados ja existem em `DEFAULT_FIXED_COSTS` e nos `MonthResult`. Apenas leitura.

## Resultado esperado

O investidor olha e ve:

- "A operacao custa ~R$ 30k/mes"
- "Equipe e R$ 25k, ferramentas R$ 4k, trafego R$ 5k"
- "No mes 1 a receita e R$ 5k, entao o gap e R$ 30k"
- "Esse gap diminui todo mes conforme entram clientes"
- "Total da Fase 1 (4 meses de gap): R$ 23k"

Isso responde diretamente "quanto custa tocar" e conecta com o aporte faseado que ja existe.
