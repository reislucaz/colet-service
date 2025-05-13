# Exemplo de cliente WebSocket

Este documento fornece exemplos de como se conectar e usar o WebSocket para mensagens em tempo real.

## Conectando ao WebSocket

```javascript
import { io } from 'socket.io-client';

// Conectar ao servidor WebSocket
const socket = io('http://localhost:3000/messages', {
  auth: {
    token: 'seu_token_jwt_aqui' // O token JWT obtido no login
  }
});

// Escutar eventos de conexão
socket.on('connect', () => {
  console.log('Conectado ao servidor de mensagens');
});

socket.on('disconnect', () => {
  console.log('Desconectado do servidor de mensagens');
});

socket.on('error', (error) => {
  console.error('Erro de conexão:', error);
});
```

## Entrando em um chat específico

```javascript
// Entrar em um chat específico para receber mensagens em tempo real
socket.emit('joinChat', 'id_do_chat', (response) => {
  console.log('Entrou no chat:', response);
});

// Sair de um chat quando necessário
socket.emit('leaveChat', 'id_do_chat', (response) => {
  console.log('Saiu do chat:', response);
});
```

## Enviando mensagens

```javascript
// Enviar uma mensagem
const messageData = {
  chatId: 'id_do_chat',
  message: {
    text: 'Olá, estou interessado no seu produto!'
  }
};

socket.emit('sendMessage', messageData, (response) => {
  console.log('Mensagem enviada:', response);
});
```

## Recebendo eventos

```javascript
// Escutar novas mensagens
socket.on('newMessage', (message) => {
  console.log('Nova mensagem recebida:', message);
  // Atualizar a interface do usuário com a nova mensagem
});

// Escutar novas ofertas
socket.on('newOffer', (offer) => {
  console.log('Nova oferta recebida:', offer);
  // Atualizar a interface do usuário com a nova oferta
});

// Escutar mudanças de status em ofertas
socket.on('offerStatusChanged', (offer) => {
  console.log('Status da oferta alterado:', offer);
  // Atualizar a interface do usuário com o novo status da oferta
});
```

## Desconectando

```javascript
// Desconectar do servidor quando necessário
function disconnect() {
  socket.disconnect();
}
```

## Tratamento de reconexão

```javascript
// Configurar reconexão automática
const socket = io('http://localhost:3000/messages', {
  auth: {
    token: 'seu_token_jwt_aqui'
  },
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconectado após ${attemptNumber} tentativas`);
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`Tentativa de reconexão ${attemptNumber}`);
});

socket.on('reconnect_error', (error) => {
  console.error('Erro na reconexão:', error);
});

socket.on('reconnect_failed', () => {
  console.error('Falha na reconexão após todas as tentativas');
});
``` 