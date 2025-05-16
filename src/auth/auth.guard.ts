import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../config/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    const isPublic = this.reflector.get<boolean>(
      'PUBLIC_ROUTE',
      context.getHandler(),
    );

    if (isPublic) {
      return true;
    }

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      request['user'] = user;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : undefined;
  }
}
