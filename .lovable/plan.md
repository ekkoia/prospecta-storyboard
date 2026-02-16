

# Adicionar Marketing Bruto (Trafego Pago) na tabela de projecao 12 meses do DRE

## O que muda

Na tabela "Projecao 12 meses — tabela resumida" da aba DRE, sera adicionada uma coluna **"Mkt Bruto (trafego)"** entre "Receita" e "Marketing (liq.)", mostrando o valor bruto investido em trafego pago antes do abatimento da receita de teste pago.

Isso da visibilidade ao valor real que sai do caixa para aquisicao de clientes.

## Detalhes Tecnicos

### Arquivo: `src/components/dashboard/DreView.tsx`

1. **Cabecalho da tabela** (linha 137): adicionar "Mkt Bruto" ao array de headers, entre "Receita" e "Marketing (liq.)"

2. **Corpo da tabela** (entre linhas 148-149): adicionar celula com `brl(r.marketingGross)` em tom laranja/pink

3. **Rodape (totais)**: adicionar a soma de `marketingGross` dos 12 meses no `useMemo` de `totals` e exibir na coluna correspondente

4. **Nota explicativa**: atualizar o texto no rodape da tabela para incluir que "Mkt Bruto" e o valor total investido em trafego pago, antes de abater a receita do teste pago

