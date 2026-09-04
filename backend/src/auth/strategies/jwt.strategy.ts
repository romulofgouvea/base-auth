import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }

    const invalidation = await this.cacheManager.get<{
      time: number;
      survivorSessionId: string;
    }>(`user_sessions_invalidated_at:${payload.sub}`);

    if (invalidation && payload.iat) {
      // payload.iat is in seconds, invalidation.time is in ms
      if (payload.iat * 1000 <= invalidation.time) {
        if (payload.sessionId !== invalidation.survivorSessionId) {
          throw new UnauthorizedException('Sessão encerrada remotamente');
        }
      }
    }

    if (payload.sessionId) {
      const isRevoked = await this.cacheManager.get(
        `revoked_session:${payload.sessionId}`,
      );
      if (isRevoked) {
        throw new UnauthorizedException('Sessão encerrada');
      }
    }

    return payload;
  }
}
