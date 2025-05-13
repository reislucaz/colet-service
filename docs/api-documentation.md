# API Colet - Documentação Completa

## Visão Geral

A API Colet é uma plataforma para gerenciamento de coleta de resíduos, conectando pessoas que têm materiais para descartar com coletores e recicladores. A plataforma oferece:

- Cadastro e autenticação de usuários
- Gerenciamento de categorias de resíduos
- Listagem de produtos/materiais para coleta
- Sistema de chat entre usuários 
- Sistema de ofertas e pagamentos integrado com Stripe

## Autenticação

Todos os endpoints protegidos requerem um token JWT no header de autorização.

### Registro de Usuário

```
POST /api/auth/register
```

**Corpo da requisição:**
```json
{
  "name": "Nome do Usuário",
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

### Login

```
POST /api/auth/login
```

**Corpo da requisição:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

## Categorias

### Listar Categorias

```
GET /api/categories
```

**Parâmetros de query:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `q` (opcional): Termo de busca

**Resposta:**
```json
{
  "items": [
    {
      "id": "clg1234abcd",
      "name": "Eletrônicos",
      "description": "Resíduos eletrônicos, como computadores, celulares, etc.",
      "iconKey": "electronics"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10
  }
}
```

### Criar Categoria (Administrador)

```
POST /api/categories
```

**Corpo da requisição:**
```json
{
  "name": "Papel",
  "description": "Resíduos de papel e papelão",
  "iconKey": "paper"
}
```

## Produtos

### Listar Produtos

```
GET /api/products
```

**Parâmetros de query:**
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `q` (opcional): Termo de busca
- `category` (opcional): ID da categoria

**Resposta:**
```json
{
  "items": [
    {
      "id": "clp1234abcd",
      "name": "Computador antigo",
      "description": "Computador funcionando, mas obsoleto",
      "price": 0,
      "recurring": false,
      "authorName": "João Silva",
      "authorEmail": "joao@exemplo.com",
      "authorPhone": "11999999999",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "category": {
        "id": "clg1234abcd",
        "name": "Eletrônicos"
      },
      "images": [
        {
          "id": "cli1234abcd",
          "key": "computador_1.jpg"
        }
      ]
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 10
  }
}
```

### Obter Produto por ID

```
GET /api/products/:id
```

**Resposta:**
```json
{
  "id": "clp1234abcd",
  "name": "Computador antigo",
  "description": "Computador funcionando, mas obsoleto",
  "price": 0,
  "recurring": false,
  "authorName": "João Silva",
  "authorEmail": "joao@exemplo.com",
  "authorPhone": "11999999999",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "category": {
    "id": "clg1234abcd",
    "name": "Eletrônicos",
    "iconKey": "electronics"
  },
  "images": [
    {
      "id": "cli1234abcd",
      "key": "computador_1.jpg"
    }
  ]
}
```

### Criar Produto

```
POST /api/products
```

**Corpo da requisição:**
```json
{
  "name": "Computador antigo",
  "description": "Computador funcionando, mas obsoleto",
  "price": 0,
  "recurring": false,
  "authorName": "João Silva",
  "authorEmail": "joao@exemplo.com",
  "authorPhone": "11999999999",
  "neighborhood": "Centro",
  "city": "São Paulo",
  "state": "SP",
  "categoryId": "clg1234abcd"
}
```

## Chats

### Listar Chats do Usuário

```
GET /api/chats
```

**Parâmetros de query:**
- `page` (opcional): Número da página (padrão: 1)

**Resposta:**
```json
{
  "items": [
    {
      "id": "clc1234abcd",
      "product": {
        "id": "clp1234abcd",
        "name": "Computador antigo",
        "images": [
          {
            "key": "computador_1.jpg"
          }
        ]
      },
      "participants": [
        {
          "id": "clu1234abcd",
          "name": "João Silva"
        },
        {
          "id": "clu5678efgh",
          "name": "Maria Souza"
        }
      ],
      "messages": [
        {
          "id": "clm1234abcd",
          "text": "Olá, tenho interesse neste computador",
          "fromUser": {
            "id": "clu5678efgh",
            "name": "Maria Souza"
          },
          "createdAt": "2023-06-15T14:30:00Z"
        }
      ]
    }
  ],
  "meta": {
    "total": 3,
    "page": 1,
    "limit": 10
  }
}
```

### Criar Chat

```
POST /api/chats
```

**Corpo da requisição:**
```json
{
  "productId": "clp1234abcd",
  "sellerId": "clu1234abcd"
}
```

### Obter Chat por ID

```
GET /api/chats/:id
```

**Resposta:**
```json
{
  "id": "clc1234abcd",
  "product": {
    "id": "clp1234abcd",
    "name": "Computador antigo",
    "images": [
      {
        "key": "computador_1.jpg"
      }
    ],
    "category": {
      "id": "clg1234abcd",
      "name": "Eletrônicos",
      "iconKey": "electronics"
    }
  },
  "participants": [
    {
      "id": "clu1234abcd",
      "name": "João Silva",
      "email": "joao@exemplo.com"
    },
    {
      "id": "clu5678efgh",
      "name": "Maria Souza",
      "email": "maria@exemplo.com"
    }
  ],
  "messages": [
    {
      "id": "clm1234abcd",
      "text": "Olá, tenho interesse neste computador",
      "fromUser": {
        "id": "clu5678efgh",
        "name": "Maria Souza"
      },
      "createdAt": "2023-06-15T14:30:00Z"
    }
  ],
  "offers": [
    {
      "id": "clo1234abcd",
      "amount": 50.0,
      "status": "PENDING",
      "sender": {
        "id": "clu5678efgh",
        "name": "Maria Souza"
      },
      "createdAt": "2023-06-15T14:45:00Z"
    }
  ]
}
```

## Mensagens

### Listar Mensagens de um Chat

```
GET /api/messages/chat/:chatId
```

**Resposta:**
```json
[
  {
    "id": "clm1234abcd",
    "text": "Olá, tenho interesse neste computador",
    "fromUser": {
      "id": "clu5678efgh",
      "name": "Maria Souza"
    },
    "createdAt": "2023-06-15T14:30:00Z"
  },
  {
    "id": "clm5678efgh",
    "text": "Certo, podemos combinar um horário para você ver?",
    "fromUser": {
      "id": "clu1234abcd",
      "name": "João Silva"
    },
    "createdAt": "2023-06-15T14:35:00Z"
  }
]
```

### Enviar Mensagem

```
POST /api/messages/chat/:chatId
```

**Corpo da requisição:**
```json
{
  "text": "Podemos marcar para amanhã à tarde?"
}
```

## Ofertas

### Criar Oferta

```
POST /api/offers/chat/:chatId
```

**Corpo da requisição:**
```json
{
  "amount": 50.0
}
```

**Resposta:**
```json
{
  "id": "clo1234abcd",
  "amount": 50.0,
  "status": "PENDING",
  "sender": {
    "id": "clu5678efgh",
    "name": "Maria Souza"
  },
  "recipient": {
    "id": "clu1234abcd",
    "name": "João Silva"
  },
  "createdAt": "2023-06-15T14:45:00Z"
}
```

### Aceitar Oferta

```
POST /api/offers/:offerId/accept
```

**Resposta:**
```json
{
  "id": "clo1234abcd",
  "amount": 50.0,
  "status": "ACCEPTED",
  "updatedAt": "2023-06-15T15:00:00Z"
}
```

### Recusar Oferta

```
POST /api/offers/:offerId/decline
```

**Resposta:**
```json
{
  "id": "clo1234abcd",
  "amount": 50.0,
  "status": "DECLINED",
  "updatedAt": "2023-06-15T15:00:00Z"
}
```

### Iniciar Pagamento

```
POST /api/offers/:offerId/pay
```

**Resposta:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

### Confirmar Pagamento (para webhooks)

```
POST /api/offers/:offerId/confirm-payment
```

**Resposta:**
```json
{
  "id": "clo1234abcd",
  "amount": 50.0,
  "status": "PAID",
  "updatedAt": "2023-06-15T15:30:00Z"
}
```

## WebSockets

A API também oferece comunicação em tempo real via WebSockets para:

- Notificações de novas mensagens
- Atualizações de status de ofertas
- Confirmações de pagamento

Para mais detalhes sobre a integração com WebSockets, consulte os documentos:
- [Exemplo de Cliente WebSocket](../src/message/websocket-client-example.md)
- [Guia de Integração de Pagamentos](../src/stripe/payment-integration-guide.md)

## Códigos de Status HTTP

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `400 Bad Request`: Dados da requisição inválidos
- `401 Unauthorized`: Falha na autenticação
- `403 Forbidden`: Não tem permissão para acessar o recurso
- `404 Not Found`: Recurso não encontrado
- `500 Internal Server Error`: Erro do servidor

## Considerações de Segurança

1. Todas as senhas são armazenadas com hash bcrypt
2. Todas as requisições devem ser feitas via HTTPS
3. Tokens JWT têm expiração de 24 horas
4. Validação rigorosa de dados é aplicada em todas as rotas 