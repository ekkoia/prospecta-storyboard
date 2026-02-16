

# Adicionar CAC Bruto na aba Investor View

## O que muda

Mostrar o **CAC Bruto** junto com o CAC Líquido em dois lugares da Investor View:

### 1. KPI Card (topo)
- **Titulo**: "CAC por Cliente (blended)" (sem mudanca)
- **Valor principal (bold)**: CAC líquido (como esta hoje)
- **Subtítulo**: trocar o texto atual por algo como:
  `"Líquido: R$ XXX · Bruto: R$ YYY"`
  Assim o investidor ve os dois valores no mesmo card, com o líquido em destaque

### 2. Painel "8 números"
- Adicionar uma 9a linha: **"CAC por cliente (bruto)"** com `brl(currentStatic.cacBlendedGross)`
- Manter a linha existente do CAC líquido

## Detalhes Tecnicos

### Arquivo: `src/components/dashboard/InvestorView.tsx`

1. **KPI Card** (linha 37): mudar o `sub` para interpolar os dois valores:
   ```
   sub={`Líq.: ${brl(currentStatic.cacBlendedNet)} · Bruto: ${brl(currentStatic.cacBlendedGross)}`}
   ```
   E o `value` continua sendo o líquido

2. **Painel 8 numeros** (linha 51): adicionar entrada `["CAC por cliente (bruto)", brl(currentStatic.cacBlendedGross)]` logo apos a linha do CAC líquido — o painel passa a ter 9 itens

3. **Nota explicativa** (linha 56): atualizar para mencionar que CAC bruto e antes do abatimento do teste pago

