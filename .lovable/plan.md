

# Adicionar Lucro Presumido como Regime Tributario Alternativo

## Contexto

Atualmente o motor calcula apenas Simples Nacional (Anexo III ou V). Quando o Fator R e muito baixo (ex: 2,6% no cenario de 500 clientes), o Anexo V aplica aliquotas altas (~19,5%). O **Lucro Presumido** pode ser mais vantajoso nesses casos, com carga total entre ~16% e ~18%.

## Logica de Decisao

O motor vai calcular os 3 regimes e escolher automaticamente o de menor imposto:

1. **Simples Nacional - Anexo III** (se Fator R >= 28%)
2. **Simples Nacional - Anexo V** (se Fator R < 28%)
3. **Lucro Presumido** (aliquota fixa composta)

A escolha sera: entre o Anexo aplicavel (III ou V) e o Lucro Presumido, usar o que resultar em menor imposto.

## Composicao do Lucro Presumido

| Tributo | Aliquota |
|---------|----------|
| IRPJ (15% sobre 32% presuncao) | 4,80% |
| CSLL (9% sobre 32% presuncao) | 2,88% |
| PIS | 0,65% |
| COFINS | 3,00% |
| ISS (municipal, padrao) | 5,00% |
| **Total** | **~16,33%** |

Sera adicionado como parametro editavel para ajuste fino (ex: ISS varia por municipio).

## Detalhe Tecnico

### Arquivo: `src/lib/financial-engine.ts`

**1. Adicionar parametros do Lucro Presumido ao `ASSUMPTIONS`:**

```text
lucroPresumido: {
  irpjRate: 0.048,    // 15% sobre 32% presuncao
  csllRate: 0.0288,   // 9% sobre 32% presuncao
  pisRate: 0.0065,
  cofinsRate: 0.03,
  issRate: 0.05,
  // Total: ~16,33%
}
```

**2. Criar funcao `calcLucroPresumido`:**
- Soma todas as aliquotas componentes
- Retorna `{ rate, tax, regime: "LP" }`

**3. Atualizar `calcTaxSimples` para `calcTax`:**
- Calcular imposto do Simples (Anexo III ou V conforme Fator R)
- Calcular imposto do Lucro Presumido
- Comparar e retornar o menor
- Retornar `{ rate, tax, fatorR, anexo, regime }` onde regime pode ser `"Simples III"`, `"Simples V"` ou `"Lucro Presumido"`

**4. Atualizar `MonthResult`:**
- Alterar campo `anexo` para `regime: string` (ex: "Simples III", "Simples V", "Lucro Presumido")
- Manter `fatorR` para contexto

### Arquivo: `src/components/dashboard/InvestorView.tsx`

- Atualizar a linha "Regime tributario" para mostrar o regime escolhido e a aliquota
- Ex: `"Simples III (Fator R: 42%, aliq: 11,2%)"` ou `"Lucro Presumido (aliq: 16,3%)"`

### Arquivo: `src/components/dashboard/DreView.tsx`

- Atualizar a linha de impostos para refletir o novo campo `regime` em vez de `anexo`

### Arquivo: `src/components/dashboard/FinancialDashboard.tsx`

- Nenhuma alteracao necessaria (ja passa `monthlyPayroll` corretamente)

## Impacto Esperado

- **100 e 200 clientes**: Fator R alto, continua no **Simples Anexo III** (~11,2%) -- menor que Lucro Presumido
- **500 clientes**: Fator R cai para ~2,6%, Anexo V daria ~19,5%. O motor vai escolher **Lucro Presumido (~16,3%)** por ser mais vantajoso
- Isso adiciona realismo: na pratica, contadores recomendam exatamente essa migracão quando o Simples fica desvantajoso
