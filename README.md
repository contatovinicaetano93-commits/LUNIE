# LUNIE

Painel interno de estoque e reposição. Lê produtos e saldo no Hiper, produtos e pedidos na Nuvemshop, e cruza os dois pelo código de barras.

O painel só mostra o que veio do Hiper ou da Nuvemshop. Sem uma leitura sincronizada, as telas ficam vazias. O painel não grava saldo de volta no Hiper nem na Nuvemshop.

## Rodar

```bash
npm install
npm run dev
```

O painel sobe em [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Chaves

Copie `.env.example` para `.env.local`. Não coloque senha de usuário em lugar nenhum.

- **Hiper:** chave de segurança em Vendas, Loja virtual, Configurações, com a integração do tipo Personalizada. A conta precisa do Pacote do varejo digital, e o produto precisa estar marcado para a loja virtual.
- **Nuvemshop:** `access_token` e `store_id` (`user_id`) devolvidos ao instalar o app na loja, com os escopos `read_products` e `read_orders`. O ID e o segredo do aplicativo só servem para trocar o código de instalação por esse token.

O Hiper usa a API personalizada em `https://ms-ecommerce.hiper.com.br`: a chave de segurança gera um token e a listagem sai de `/api/v1/produtos/listagemDeProdutos`. O leitor entende a grade oficial (`variacao`, `codigoDeBarras`, `quantidadeEmEstoque`, tamanho e cor).

A sincronização aceita o Hiper, a Nuvemshop, ou os dois. Sem `HIPER_API_KEY` o saldo do ERP não entra. Sem `NUVEMSHOP_ACCESS_TOKEN` e `NUVEMSHOP_STORE_ID` os pedidos da loja não entram.

## O que a conta faz

- Saldo de planejamento: usa o Hiper quando a variante está lá; se não, o saldo da Nuvemshop.
- Entrada e saída registradas no botão Registrar ficam só neste painel e entram nessa conta. Uma saída daqui não baixa a peça na loja.
- Vendas consideradas: pedidos pagos da Nuvemshop. Cancelados aparecem no histórico e não entram na velocidade.
- Sugestão de compra: velocidade diária vezes a cobertura alvo, menos o saldo de planejamento.
- Alertas: ruptura, grade torta, estoque parado, saldo diferente entre os dois lados e código sem par.

A base local em `data/lunie.json` guarda o último snapshot ao vivo e os registros manuais. Esse arquivo não vai para o git.
