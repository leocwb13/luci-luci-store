# Luci Luci Web App

Aplicativo web mobile-first para vendas online da Luci Luci, com:

- vitrine com busca, filtros, carrinho e checkout
- produtos com imagem, estoque minimo e observacoes internas
- kits com composicao, economia calculada e upload de foto
- clientes com historico de compras
- pedidos do site e pedidos manuais no admin
- kanban operacional de pedidos
- dashboard com vendas do dia, estoque baixo e contas a receber
- financeiro basico com receitas e despesas
- login seguro com cookie assinado e papeis de acesso
- integracao preparada para Mercado Pago
- continuidade operacional no WhatsApp
- tracking com GA4 e Meta Pixel

## Rodando localmente

1. Instale Node.js 20 ou superior.
2. Copie `.env.example` para `.env.local`.
3. Execute:

```bash
npm install
npm run dev
```

## Variaveis principais

- `AUTH_SECRET`: segredo para assinatura da sessao
- `TURSO_DATABASE_URL`: URL do banco Turso. Em local pode usar `file:./dev.db`
- `TURSO_AUTH_TOKEN`: token do Turso
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: upload de imagens
- `MERCADO_PAGO_ACCESS_TOKEN`: opcional para checkout real do Mercado Pago

## Credenciais iniciais do painel

- URL: `/admin/login`
- Email: valor de `ADMIN_EMAIL`
- Senha: valor de `ADMIN_PASSWORD`

## Observacoes

- O app inicializa a base a partir dos JSONs antigos na primeira execucao.
- Se `MERCADO_PAGO_ACCESS_TOKEN` nao estiver definido, o fluxo de pagamento funciona em modo simulado para validacao da experiencia.
- O webhook pode ser simulado por `GET /api/webhooks/mercado-pago?orderId=SEU_PEDIDO`.
- `NEXT_PUBLIC_GA4_ID` e `NEXT_PUBLIC_META_PIXEL_ID` sao opcionais e ativam tracking de conversao quando preenchidos.
