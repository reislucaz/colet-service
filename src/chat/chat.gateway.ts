import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';

@WebSocketGateway()
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(readonly prisma: PrismaService) {}

  readonly logger = new Logger(ChatGateway.name);
  connections = new Map<string, Map<string, Socket>>();
  chats = new Map<string, Map<string, Socket>>();

  @WebSocketServer()
  server: Socket;

  @SubscribeMessage('message')
  async handleEvent(
    client: Socket,
    data: { chatId: string; user: string; text: string },
  ) {
    try {
      const query = client.handshake.query;
      const chatId = query.chatId as string;
      const from = query.from as string;

      // Enviar mensagem para os clientes conectados
      this.sendMessage(chatId, from, data);

      // Buscar informações do chat para determinar o destinatário
      const chat = await this.prisma.chat.findUnique({
        where: { id: chatId },
        select: {
          participants: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!chat) {
        this.logger.error(`Chat não encontrado: ${chatId}`);
        return;
      }

      // Determinar o destinatário baseado no remetente
      const toUser = chat.participants.find(
        (participant) => participant.id !== from,
      )?.id;

      if (!toUser) {
        this.logger.error(`Destinatário não encontrado no chat ${chatId}`);
        return;
      }

      // Salvar a nova mensagem no histórico (sem deletar mensagens anteriores)
      await this.prisma.chat.update({
        data: {
          messages: {
            create: {
              text: data.text,
              fromUserId: from,
              toUserId: toUser,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        },
        where: { id: chatId },
      });

      this.logger.log(
        `Mensagem salva no chat ${chatId} de ${from} para ${toUser}`,
      );
    } catch (error) {
      this.logger.error(`Erro ao processar mensagem: ${error.message}`);
    }
  }

  sendMessage(chatId: string, fromUser: string, message: any) {
    const chatConnections = this.connections.get(chatId);
    if (!chatConnections) {
      this.logger.error(`Nenhuma conexão encontrada para o chat: ${chatId}`);
      return;
    }

    // Enviar mensagem para todos os clientes conectados no chat
    chatConnections.forEach((client, userId) => {
      if (client && client.connected) {
        client.emit('message', {
          ...message,
          fromUser,
          timestamp: new Date().toISOString(),
        });
        this.logger.log(
          `Mensagem enviada para usuário ${userId} no chat ${chatId}`,
        );
      }
    });
  }

  afterInit() {
    this.logger.log('Socket started');
  }

  async handleConnection(client: Socket) {
    const query = client.handshake.query;
    const chat = query.chatId as string;
    const from = query.from as string;

    if (!this.connections.has(chat)) {
      this.connections.set(chat, new Map());
    }
    this.connections.get(chat).set(from, client);
    this.logger.log(
      `Client connected: ${client.id} with args: ${JSON.stringify(client.handshake.query)}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.connections.forEach((connection) =>
      connection.forEach((value, key) => {
        if (value.id === client.id) {
          connection.delete(key);
        }
      }),
    );
    this.logger.log(`Client disconnected with id: ${client.id}`);
  }
}
