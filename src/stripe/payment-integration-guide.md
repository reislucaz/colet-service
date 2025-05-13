# Guia de Integração de Pagamentos

Este documento fornece instruções detalhadas para integrar o sistema de pagamentos do Colet com aplicações frontend.

## Visão Geral do Fluxo de Pagamento

O fluxo de pagamento no Colet funciona da seguinte forma:

1. Um usuário cria uma oferta para um produto
2. O vendedor aceita a oferta
3. O comprador inicia o processo de pagamento
4. O sistema cria uma intenção de pagamento no Stripe
5. O comprador é redirecionado para o checkout do Stripe
6. Após o pagamento, o Stripe notifica o sistema via webhook
7. O sistema atualiza o status da oferta para "pago"

## Integração no Frontend

### 1. Criando uma Oferta

Para criar uma oferta para um produto, faça uma requisição POST:

```javascript
// Criar uma oferta
async function createOffer(chatId, amount) {
  const response = await fetch(`/api/offers/chat/${chatId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount })
  });
  
  return await response.json();
}

// Exemplo de uso
const offerData = await createOffer('chat_id_123', 100.50);
console.log('Oferta criada:', offerData);
```

### 2. Aceitando uma Oferta (Vendedor)

Para aceitar uma oferta, faça uma requisição POST:

```javascript
// Aceitar uma oferta
async function acceptOffer(offerId) {
  const response = await fetch(`/api/offers/${offerId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}

// Exemplo de uso
const acceptedOffer = await acceptOffer('offer_id_123');
console.log('Oferta aceita:', acceptedOffer);
```

### 3. Iniciando o Pagamento (Comprador)

Após a aceitação da oferta, o comprador pode iniciar o pagamento:

```javascript
// Iniciar o pagamento de uma oferta
async function initiatePayment(offerId) {
  const response = await fetch(`/api/offers/${offerId}/pay`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const { checkoutUrl } = await response.json();
  return checkoutUrl;
}

// Exemplo de uso
const checkoutUrl = await initiatePayment('offer_id_123');

// Redirecionar para o checkout do Stripe
window.location.href = checkoutUrl;
```

### 4. Lidando com Retorno do Checkout

Após o pagamento, o Stripe redirecionará o usuário para as URLs de sucesso ou cancelamento. Configure handlers para estas rotas:

```javascript
// No componente que lida com a URL de sucesso
async function handlePaymentSuccess() {
  // Extrair o ID da oferta da URL
  const urlParams = new URLSearchParams(window.location.search);
  const offerId = urlParams.get('offer');
  
  // Atualizar a interface para mostrar que o pagamento foi bem-sucedido
  updateUIForSuccessfulPayment(offerId);
  
  // Opcionalmente, verificar o status do pagamento
  const offerStatus = await checkOfferStatus(offerId);
  
  if (offerStatus.status === 'PAID') {
    showPaymentConfirmation();
  } else {
    showPaymentPending();
  }
}

// No componente que lida com a URL de cancelamento
function handlePaymentCancellation() {
  const urlParams = new URLSearchParams(window.location.search);
  const offerId = urlParams.get('offer');
  
  showPaymentCancelled(offerId);
}
```

## Monitorando Status de Pagamento via WebSocket

Para receber atualizações em tempo real sobre o status do pagamento, use o WebSocket conforme mostrado no exemplo:

```javascript
// Escutar mudanças no status da oferta
socket.on('offerStatusChanged', (offer) => {
  console.log('Status da oferta alterado:', offer);
  
  if (offer.status === 'PAID') {
    showPaymentConfirmation(offer);
  } else if (offer.status === 'CANCELLED') {
    showPaymentCancelled(offer);
  }
});
```

## Implementando o Checkout do Stripe no Frontend (Alternativa ao Redirect)

Caso prefira integrar o Stripe Elements ao invés de redirecionar para o checkout:

```javascript
// 1. Adicione o script do Stripe ao seu HTML
<script src="https://js.stripe.com/v3/"></script>

// 2. Inicialize o Stripe
const stripe = Stripe('seu_publishable_key');

// 3. Crie um Payment Intent no servidor e receba o client_secret
async function createPaymentIntent(offerId) {
  const response = await fetch(`/api/offers/${offerId}/create-payment-intent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const { clientSecret } = await response.json();
  return clientSecret;
}

// 4. Monte o formulário de pagamento
const elements = stripe.elements();
const card = elements.create('card');
card.mount('#card-element');

// 5. Manipule o envio do formulário
const form = document.getElementById('payment-form');
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const clientSecret = await createPaymentIntent('offer_id_123');
  
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: card,
      billing_details: {
        name: 'Nome do Cliente'
      }
    }
  });
  
  if (result.error) {
    // Mostre erro ao cliente
    showError(result.error.message);
  } else {
    // O pagamento foi processado!
    if (result.paymentIntent.status === 'succeeded') {
      showPaymentConfirmation();
    }
  }
});
```

## Testando Pagamentos

Para testar o sistema de pagamentos:

1. Use o modo de teste do Stripe (API keys de teste)
2. Use cartões de teste do Stripe:
   - **Cartão bem-sucedido**: 4242 4242 4242 4242
   - **Cartão que requer autenticação**: 4000 0025 0000 3155
   - **Cartão recusado**: 4000 0000 0000 0002
3. Use qualquer data futura para validade e qualquer CVC de 3 dígitos

## Webhook do Stripe

O sistema já está configurado para receber webhooks do Stripe. Para configurar isso no seu ambiente:

1. Configure o webhook no dashboard do Stripe apontando para: `https://seu-dominio.com/api/webhooks/stripe`
2. Defina os eventos a serem monitorados (pelo menos `payment_intent.succeeded`)
3. Copie o signing secret e configure-o como `STRIPE_WEBHOOK_SECRET` nas variáveis de ambiente

## Tratamento de Erros

Implemente tratamento adequado de erros em seu frontend:

```javascript
async function initiatePayment(offerId) {
  try {
    const response = await fetch(`/api/offers/${offerId}/pay`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao iniciar pagamento');
    }
    
    const { checkoutUrl } = await response.json();
    return checkoutUrl;
  } catch (error) {
    console.error('Erro no pagamento:', error);
    showPaymentError(error.message);
    return null;
  }
}
```

## Fluxo de Status de Ofertas

A oferta passa pelos seguintes estados:

1. **PENDING**: Oferta criada, aguardando resposta do vendedor
2. **ACCEPTED**: Oferta aceita pelo vendedor, aguardando pagamento
3. **DECLINED**: Oferta recusada pelo vendedor
4. **PAID**: Pagamento concluído com sucesso
5. **CANCELLED**: Pagamento cancelado ou falhou

Certifique-se de que sua interface de usuário reflita esses estados adequadamente.

## Considerações de Segurança

1. **Nunca armazene** chaves secretas do Stripe no frontend
2. **Sempre verifique** a autenticação do usuário antes de processar pagamentos
3. **Sempre valide** os dados no backend antes de criar intenções de pagamento
4. **Sempre verifique** a assinatura do webhook do Stripe para evitar solicitações falsas 