

# Corrigir Label "Enterprise" Cortado e Contorno nas Fatias

## Problemas

1. **Label "Enterprise: 5%" cortado** -- Na imagem, aparece apenas "Enterprise:" sem o "5%". O texto esta sendo renderizado em uma unica linha `<text>` SVG que ultrapassa a borda direita do container. Precisa quebrar em duas linhas no mobile.

2. **Contorno retangular ao interagir** -- Apesar de `activeIndex={-1}` e `stroke="none"` terem sido adicionados, o Recharts pode ainda aplicar um outline/stroke via CSS nos setores SVG. Precisa adicionar estilos CSS para garantir `outline: none` nos elementos `.recharts-sector`.

## Solucao

### Arquivo: `src/components/dashboard/InvestorView.tsx`

**1. Labels em duas linhas no mobile:**

Trocar o `<text>` simples por um `<text>` com dois `<tspan>` quando em mobile -- primeiro tspan com o nome do plano, segundo tspan (abaixo, com `dy="1.2em"`) com a porcentagem:

```tsx
label={({ name, percent, x, y, textAnchor, fill }: any) => {
  const displayName = isMobile ? name.split(' (')[0] : name;
  const percentage = `${(percent * 100).toFixed(0)}%`;
  if (isMobile) {
    return (
      <text x={x} y={y} textAnchor={textAnchor} fill={fill} fontSize={10}>
        <tspan x={x} dy="0">{displayName}:</tspan>
        <tspan x={x} dy="1.2em">{percentage}</tspan>
      </text>
    );
  }
  return (
    <text x={x} y={y} textAnchor={textAnchor} fill={fill} fontSize={11}>
      {`${displayName}: ${percentage}`}
    </text>
  );
}}
```

Isso garante que labels longos como "Enterprise" quebrem a porcentagem para a linha de baixo.

**2. Remover outline/contorno CSS dos setores:**

Adicionar estilo inline no `<PieChart>` via className ou style para forcar `outline: none` e `stroke: none` nos setores Recharts. A abordagem mais direta e adicionar `style` no `<PieChart>`:

```tsx
<PieChart style={{ outline: 'none' }}>
```

E tambem garantir que o `<Pie>` tenha `activeShape` desabilitado explicitamente com uma funcao vazia ou `undefined`.

### Resumo tecnico

- Um unico arquivo: `src/components/dashboard/InvestorView.tsx`
- Labels mobile quebram em duas linhas usando `<tspan>` SVG
- Desktop mantem formato em linha unica
- Outline CSS removido via style no PieChart
- `stroke="none"` ja esta nas `<Cell>`, manter

