import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * WebSocket Gateway cho realtime notifications
 * Sử dụng Socket.IO để push thông báo tới client
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/notifications',
})
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  // Map userId -> socketId để gửi notification đến đúng user
  private userSocketMap = new Map<string, string[]>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway đã khởi tạo');
  }

  /**
   * Xử lý khi client kết nối - xác thực JWT từ handshake
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        this.logger.warn(`Client ${client.id} kết nối không có token`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // Lưu thông tin user vào socket data
      client.data.userId = payload.sub;
      client.data.username = payload.username;

      // Map user với socket
      const existingSockets = this.userSocketMap.get(payload.sub) || [];
      existingSockets.push(client.id);
      this.userSocketMap.set(payload.sub, existingSockets);

      // Join room theo userId để dễ gửi notification
      client.join(`user:${payload.sub}`);

      this.logger.log(
        `User ${payload.username} (${payload.sub}) đã kết nối - Socket: ${client.id}`,
      );
    } catch (error) {
      this.logger.warn(`Client ${client.id} xác thực thất bại: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  /**
   * Xử lý khi client ngắt kết nối
   */
  handleDisconnect(client: Socket) {
    const userId = client.data?.userId;

    if (userId) {
      const sockets = this.userSocketMap.get(userId) || [];
      const updatedSockets = sockets.filter((id) => id !== client.id);

      if (updatedSockets.length === 0) {
        this.userSocketMap.delete(userId);
      } else {
        this.userSocketMap.set(userId, updatedSockets);
      }

      this.logger.log(`User ${client.data.username} ngắt kết nối - Socket: ${client.id}`);
    }
  }

  /**
   * Gửi notification đến một user cụ thể
   */
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Gửi notification đến tất cả users đang online
   */
  sendToAll(event: string, data: any) {
    this.server.emit(event, {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Client đánh dấu đã đọc notification
   */
  @SubscribeMessage('markAsRead')
  handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { notificationId: string },
  ) {
    const userId = client.data?.userId;
    this.logger.log(`User ${userId} đã đọc notification ${data.notificationId}`);

    // TODO: Cập nhật trạng thái trong database
    return { success: true };
  }

  /**
   * Lấy danh sách users đang online
   */
  getOnlineUsers(): string[] {
    return Array.from(this.userSocketMap.keys());
  }
}
