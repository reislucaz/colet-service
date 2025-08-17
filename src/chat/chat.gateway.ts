import { Logger } from "@nestjs/common";
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Socket } from "socket.io";
import { PrismaService } from "src/prisma/prisma.service";

@WebSocketGateway()
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  constructor(readonly prisma: PrismaService) { }

  readonly logger = new Logger(ChatGateway.name);
  connections = new Map<string, Map<string, Socket>>();
  chats = new Map<string, Map<string, Socket>>()

  @WebSocketServer()
  server: Socket

  @SubscribeMessage('message')
  async handleEvent(client: Socket, data: { chatId: string, user: string, text: string }) {
    const query = client.handshake.query;
    const chat = query.chatId as string;
    const from = query.from as string;
    this.sendMessage(chat, from, data)
    const { messages } = await this.prisma.chat.findUnique({ where: { id: chat }, select: { messages: true } })
    const toUser = messages?.[0].toUserId
    await this.prisma.chat.update({ data: { messages: { create: { text: data.text, fromUserId: from, toUserId: toUser } } }, where: { id: chat } })
  }

  sendMessage(chat: string, user: string, message: any) {
    const client = this.connections.get(chat)?.get(user);
    if (!client) {
      this.logger.error('Client is not connected');
      return;
    }
    client?.emit('message', message);
    return client.id;
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
    this.connections.forEach(connection =>
      connection.forEach((value, key) => {
        if (value.id === client.id) {
          connection.delete(key);
        }
      }),
    );
    this.logger.log(`Client disconnected with id: ${client.id}`);
  }
}