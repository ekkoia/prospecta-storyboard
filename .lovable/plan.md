

# Implementar Fator R do Simples Nacional na Engine Financeira

## Contexto

Hoje o motor financeiro usa faixas de imposto genéricas. A proposta é substituí-las pela lógica real do **Simples Nacional**, considerando o **Fator R** (razão entre folha de pagamento e faturamento bruto) para determinar se a empresa se enquadra no **Anexo III** (alíquotas menores) ou no **Anexo V** (alíquotas maiores).

**Fator R = Folha de Pagamento / Receita Bruta**
- Se Fator R >= 28%: **Anexo III** (alíquotas de ~6% a ~13,5%)
- Se Fator R < 28%: **Anexo V** (alíquotas de ~15,5% a ~19,5%)

## Como vai funcionar

1. A "folha de pagamento" será calculada automaticamente a partir dos itens de RH já cadastrados nos custos fixos (Suporte, Gestor de Automação, Closer, etc.)
2. A cada cálculo de imposto, o motor compara a folha com a receita mensal para determinar o Fator R
3. Com base no Fator R, escolhe Anexo III ou V e aplica a alíquota correspondente à faixa de faturamento anualizado
4. O resultado (Fator R, Anexo escolhido e alíquota) será visível no dashboard

## Detalhe Técnico

### Arquivo: `src/lib/financial-engine.ts`

**1. Substituir `taxBrackets` por duas tabelas (Anexo III e V):**

```text
taxSimples: {
  fatorRThreshold: 0.28,
  anexoIII: [
    { capAnual: 180_000,   rate: 0.06 },
    { capAnual: 360_000,   rate: 0.112 },
    { capAnual: 720_000,   rate: 0.135 },
    { capAnual: 1_800_000, rate: 0.16 },
    { capAnual: 3_600_000, rate: 0.21 },
    { capAnual: 4_800_000, rate: 0.33 },
  ],
  anexoV: [
    { capAnual: 180_000,   rate: 0.155 },
    { capAnual: 360_000,   rate: 0.18 },
    { capAnual: 720_000,   rate: 0.195 },
    { capAnual: 1_800_000, rate: 0.205 },
    { capAnual: 3_600_000, rate: 0.23 },
    { capAnual: 4_800_000, rate: 0.305 },
  ],
}
```

**2. Atualizar `calcTaxProgressive`** para receber a folha de pagamento mensal (soma dos itens de RH) e calcular o Fator R:

- Calcular `fatorR = folhaMensal / receitaMensal`
- Escolher anexo III ou V conforme o threshold de 28%
- Buscar a faixa com base na receita anualizada (`receitaMensal * 12`)
- Retornar `{ rate, tax, fatorR, anexo }`

**3. Atualizar `monthModel`** para passar a folha de pagamento ao cálculo de imposto. A folha será extraída dos custos fixos (soma dos `rhItems`), ou dos valores default quando não houver override.

**4. Atualizar `MonthResult`** para incluir `fatorR` e `anexo` ("III" ou "V"), permitindo exibição no dashboard.

### Arquivo: `src/components/dashboard/InvestorView.tsx`

- Adicionar uma linha no painel de Resumo Financeiro mostrando: **"Regime tributário"** com valor tipo `"Anexo III (Fator R: 32%)"` ou `"Anexo V (Fator R: 18%)"`
- A linha de "Margem líquida" já refletirá o imposto correto automaticamente

### Arquivo: `src/components/dashboard/DreView.tsx`

- Na linha de impostos da DRE, exibir o anexo e Fator R como contexto adicional

### Impacto esperado

- Nos cenários de 100 e 200 clientes, a folha de RH (~R$ 13k) tende a representar mais de 28% da receita, enquadrando no **Anexo III** (alíquotas menores)
- No cenário de 500 clientes, a receita sobe muito e o Fator R cai abaixo de 28%, podendo migrar para o **Anexo V** (alíquotas maiores) -- isso explica comportamentos de margem e adiciona realismo ao modelo
