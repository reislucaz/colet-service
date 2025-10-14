# ♻️ Colet

Esse é o código de serviço do Colet, um aplicativo de coleta de resíduos recicláveis.

Com uma arquitetura de monolito modular, visamos a escalabilidade e a manutenibilidade do código, uma vez que o aplicativo é um projeto de longo prazo e temos um escopo de funcionalidades bem grande.

## 🚀 Tecnologias

- [Node.js](https://nodejs.org/en/)
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/)
- [PostgreSQL](https://www.postgresql.org/)
- [Docker](https://www.docker.com/)

## 📦 Instalação

Para instalar as dependências do projeto, execute o comando:

```bash
npm install
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e adicione as variáveis de ambiente:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432"
STRIPE_SECRET_KEY="sk_test_51S1p4xLTyDtUS6f2XW7lwSr6V7BUdqnezceD08CqPu5ASJhFcJscrZ9v4t490woyCMaNJbpnRpfvMdKfRreuaOzi00TI2mPTcx"
STRIPE_WEBHOOK_SECRET="whsec_t065rOVe5tkPA8brb6kYV2QQfsAqwcL4"
STRIPE_CURRENCY="brl"
```

## 🚦 Execução

Para executar o projeto, execute o comando:

```bash
npm run start:dev
```