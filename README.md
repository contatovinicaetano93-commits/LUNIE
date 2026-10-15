# LUNIE

Painel interno de estoque e reposição. Lê produtos e saldo no Hiper, produtos e pedidos na Nuvemshop, e cruza os dois pelo código de barras.

Sem as chaves, o painel abre com uma amostra da operação para a grade, as vendas e os alertas já poderem ser lidos. Com as chaves, a sincronização passa a usar as contas reais. O painel não grava saldo de volta no Hiper nem na Nuvemshop.

## Rodar

```bash
npm install
npm run dev
```

O painel sobe em [http://127.0.0.1:43123](http://127.0.0.1:43123).

## Chaves

Copie `.env.example` para `.env.local`. Não coloque senha de usuário em lugar nenhum.

- **Hiper:** chave de segurança em Vendas, Loja virtual, Configurações, com a integração do tipo Personalizada. A conta precisa do Pacote do varejo digital, e o produto precisa estar marcado para a loja virtual.
- **Nuvemshop:** `access_token` e `store_id` de um app instalado na loja, com os escopos `read_products` e `read_orders`.

O endereço do Hiper (`HIPER_API_BASE_URL` e `HIPER_PRODUCTS_PATH`) segue o formato assumido da API personalizada. Quando a documentação técnica trouxer o host e o caminho oficiais, ajuste essas duas variáveis. O leitor aceita os nomes de campo mais comuns (`nome`, `codigoDeBarras`, `estoque`, `tamanho`, `cor` e a grade aninhada).

Enquanto faltar qualquer uma das três chaves (`HIPER_API_KEY`, `NUVEMSHOP_ACCESS_TOKEN`, `NUVEMSHOP_STORE_ID`), a leitura continua na demonstração.

## O que a conta faz

- Saldo de planejamento: usa o Hiper quando a variante está lá; se não, o saldo da Nuvemshop.
- Entrada e saída registradas no botão Registrar ficam só neste painel e entram nessa conta. Uma saída daqui não baixa a peça na loja.
- Vendas consideradas: pedidos pagos da Nuvemshop. Cancelados aparecem no histórico e não entram na velocidade.
- Sugestão de compra: velocidade diária vezes a cobertura alvo, menos o saldo de planejamento.
- Alertas: ruptura, grade torta, estoque parado, saldo diferente entre os dois lados e código sem par.

A base local em `data/lunie.json` guarda o último snapshot ao vivo e os registros manuais. Esse arquivo não vai para o git.
