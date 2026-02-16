
# Adicionar Pro-labore dos Socios ao RH

## O que muda

Adicionar um novo item **"Pro-labore Socios"** com valor padrao de **R$ 12.000** na lista de itens de RH dentro de `DEFAULT_FIXED_COSTS`.

Com isso, a folha de pagamento total sobe de R$ 13.050 para **R$ 25.050**, o que impacta o Fator R:

- **100 clientes** (~R$ 86k receita): Fator R = 25.050/86.000 = ~29% -- **Anexo III** (aliquota ~11,2%)
- **200 clientes** (~R$ 172k receita): Fator R = 25.050/172.000 = ~14,6% -- Anexo V, mas Lucro Presumido (~16,3%) sera mais vantajoso
- **500 clientes** (~R$ 509k receita): Fator R = 25.050/509.000 = ~4,9% -- **Lucro Presumido** (~16,3%)

O cenario de 100 clientes agora se beneficia do Simples Anexo III com aliquota muito menor.

## Detalhe Tecnico

### Arquivo: `src/lib/financial-engine.ts`

Adicionar uma linha ao array `rhItems` dentro de `DEFAULT_FIXED_COSTS`:

```
{ id: "prolaboreSocios", label: "Pro-labore Socios", value: 12000 },
```

Nenhuma outra alteracao e necessaria -- o item sera automaticamente somado na folha de pagamento e considerado no calculo do Fator R. O usuario podera editar ou remover esse item na aba de Custos Fixos como qualquer outro item de RH.
