import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource, IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { UserRepository } from '../users/users.repository';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './responses/login-response.dto';
import { AuthMeResponseDto } from './responses/auth-me-response.dto';
import { RefreshResponseDto } from './responses/refresh-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

import { RoleRepository } from '../roles/roles.repository';
import { Notification } from '../common/domain/notification/notification';
import { NotificationException } from '../common/domain/notification/notification.exception';
import { MailService } from '../mail/mail.service';
import { Profile } from '../profiles/entities/profile.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  private readonly refreshTokenRepository: Repository<RefreshToken>;
  private readonly passwordResetTokenRepository: Repository<PasswordResetToken>;
  private readonly emailVerificationTokenRepository: Repository<EmailVerificationToken>;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersRepository: UserRepository,
    private readonly rolesRepository: RoleRepository,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.refreshTokenRepository = this.dataSource.getRepository(RefreshToken);
    this.passwordResetTokenRepository =
      this.dataSource.getRepository(PasswordResetToken);
    this.emailVerificationTokenRepository = this.dataSource.getRepository(
      EmailVerificationToken,
    );
  }

  async registerAsync(
    dto: RegisterDto,
    _ip: string,
    _userAgent: string,
  ): Promise<any> {
    const notification = new Notification();

    const existingByEmail = await this.usersRepository.findByEmailAsync(
      dto.email,
    );
    if (existingByEmail) {
      notification.addError({
        context: 'email',
        message: 'Email already in use',
      });
    }

    const username = dto.email.split('@')[0];
    const existingByUsername =
      await this.usersRepository.findByUsernameAsync(username);
    if (existingByUsername) {
      notification.addError({
        context: 'username',
        message: 'Username already in use',
      });
    }

    if (notification.hasErrors()) {
      throw new NotificationException(notification.getErrors());
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const userRole = await this.rolesRepository.findByNameAsync('USER');

      const user = queryRunner.manager.create(User, {
        email: dto.email,
        username,
        passwordHash,
        isEmailVerified: false,
        roles: userRole ? [userRole] : [],
      });
      const savedUser = await queryRunner.manager.save(User, user);

      const nameParts = dto.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      const profile = queryRunner.manager.create(Profile, {
        userId: savedUser.id,
        firstName,
        lastName,
        createdBy: savedUser.id,
        updatedBy: savedUser.id,
      });
      await queryRunner.manager.save(Profile, profile);

      const rawToken = crypto.randomUUID();
      const tokenHash = await bcrypt.hash(rawToken, 10);
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      const emailTokenRecord = queryRunner.manager.create(
        EmailVerificationToken,
        {
          userId: savedUser.id,
          tokenHash,
          expiresAt,
        },
      );
      await queryRunner.manager.save(EmailVerificationToken, emailTokenRecord);

      await queryRunner.commitTransaction();

      return {
        id: savedUser.id,
        username: savedUser.username,
        email: savedUser.email,
        roles: (savedUser.roles || []).map((r) => r.id),
      } as any;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async loginAsync(
    dto: LoginDto,
    ip: string,
    userAgent: string,
    deviceName?: string,
  ): Promise<LoginResponseDto> {
    const user = await this.usersRepository.findByEmailAsync(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const userWithRoles = await this.usersRepository.findByIdWithRolesAsync(
      user.id,
    );
    if (!userWithRoles) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (userWithRoles.isRemovePermanent) {
      userWithRoles.isRemovePermanent = false;
      userWithRoles.removeRequestedAt = null;
      await this.usersRepository.save(userWithRoles);
    }

    const { accessToken, refreshToken, tokenHash } =
      await this.generateTokenPairAsync(userWithRoles);

    const expirationHours = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRATION_HOURS',
      6,
    );
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    const refreshTokenRecord = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      deviceName: deviceName ?? null,
      ipAddress: ip,
      userAgent,
      expiresAt,
    });
    await this.refreshTokenRepository.save(refreshTokenRecord);

    return { accessToken, refreshToken };
  }

  async refreshAsync(
    refreshToken: string,
    ip: string,
    userAgent: string,
  ): Promise<RefreshResponseDto> {
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (_err) {
      throw new UnauthorizedException('Formato de refresh token inválido');
    }

    const { sub: userId, jti: rawRefresh } = payload;
    if (!userId || !rawRefresh) {
      throw new UnauthorizedException('Payload do refresh token inválido');
    }

    const userTokens = await this.refreshTokenRepository.find({
      where: { userId },
    });

    let matchedRecord: RefreshToken | null = null;
    let isRevoked = false;

    for (const record of userTokens) {
      const isMatch = await bcrypt.compare(rawRefresh, record.tokenHash);
      if (isMatch) {
        matchedRecord = record;
        if (record.revokedAt) {
          isRevoked = true;
        }
        break;
      }
    }

    if (!matchedRecord) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (isRevoked) {
      throw new UnauthorizedException('Reuso de token detectado');
    }

    if (matchedRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Atualização de token expirado');
    }

    matchedRecord.revokedAt = new Date();
    await this.refreshTokenRepository.save(matchedRecord);

    await this.cacheManager.set(
      `revoked_session:${rawRefresh}`,
      true,
      15 * 60 * 1000,
    ); // 15 mins

    const user = await this.usersRepository.findByIdWithRolesAsync(
      matchedRecord.userId,
    );
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      tokenHash,
    } = await this.generateTokenPairAsync(user);

    const expirationHours = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRATION_HOURS',
      6,
    );
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    const newRecord = this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      deviceName: matchedRecord.deviceName,
      ipAddress: ip,
      userAgent,
      expiresAt,
    });
    await this.refreshTokenRepository.save(newRecord);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logoutAsync(userId: string, refreshToken: string): Promise<void> {
    let payload;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch (_err) {
      return;
    }

    const { sub: tokenUserId, jti: rawRefresh } = payload;
    if (tokenUserId !== userId || !rawRefresh) return;

    const userTokens = await this.refreshTokenRepository.find({
      where: { userId, revokedAt: IsNull() },
    });

    for (const record of userTokens) {
      const isMatch = await bcrypt.compare(rawRefresh, record.tokenHash);
      if (isMatch) {
        record.revokedAt = new Date();
        await this.refreshTokenRepository.save(record);
        await this.invalidateMeCacheAsync(userId);

        await this.cacheManager.set(
          `revoked_session:${rawRefresh}`,
          true,
          15 * 60 * 1000,
        );
        return;
      }
    }
  }

  async logoutAllAsync(
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    await this.revokeOtherUserTokensAsync(userId, currentSessionId);
  }

  async forgotPasswordAsync(
    identifier: string,
    origin?: string,
  ): Promise<void> {
    const user = identifier.includes('@')
      ? await this.usersRepository.findByEmailAsync(identifier)
      : await this.usersRepository.findByUsernameAsync(identifier);

    if (!user) return;

    const rawToken = await this.createPasswordResetTokenAsync(user);
    await this.mailService.sendPasswordResetEmailAsync(
      user.email,
      rawToken,
      origin,
    );
  }

  async resetPasswordAsync(token: string, newPassword: string): Promise<void> {
    const tokenRecord = await this.findValidPasswordResetTokenAsync(token);

    if (!tokenRecord) {
      const notification = new Notification();
      notification.addError({
        context: 'token',
        message: 'Invalid or expired token',
      });
      throw new NotificationException(notification.getErrors());
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(tokenRecord.userId, { passwordHash });

    tokenRecord.usedAt = new Date();
    await this.passwordResetTokenRepository.save(tokenRecord);

    await this.revokeAllUserTokensAsync(tokenRecord.userId);
  }

  async changePasswordAsync(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      const notification = new Notification();
      notification.addError({
        context: 'user',
        message: 'Usuário não encontrado',
      });
      throw new NotificationException(notification.getErrors());
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      const notification = new Notification();
      notification.addError({
        context: 'currentPassword',
        message: 'Senha atual incorreta',
      });
      throw new NotificationException(notification.getErrors());
    }

    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.usersRepository.update(userId, {
      passwordHash: newPasswordHash,
    });

    if (dto.refreshToken) {
      await this.revokeOtherUserTokensAsync(userId, dto.refreshToken);
    } else {
      await this.revokeAllUserTokensAsync(userId);
    }
  }

  async verifyEmailAsync(token: string): Promise<void> {
    const tokenRecord = await this.findValidEmailVerificationTokenAsync(token);

    if (!tokenRecord) {
      const notification = new Notification();
      notification.addError({
        context: 'token',
        message: 'Invalid or expired token',
      });
      throw new NotificationException(notification.getErrors());
    }

    await this.usersRepository.update(tokenRecord.userId, {
      isEmailVerified: true,
    });

    tokenRecord.usedAt = new Date();
    await this.emailVerificationTokenRepository.save(tokenRecord);
  }

  async resendVerificationAsync(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      const notification = new Notification();
      notification.addError({ context: 'user', message: 'User not found' });
      throw new NotificationException(notification.getErrors());
    }

    await this.emailVerificationTokenRepository.update(
      { userId, usedAt: IsNull() },
      { usedAt: new Date() },
    );

    await this.createEmailVerificationTokenAsync(userId);
  }

  async getMeAsync(userId: string): Promise<AuthMeResponseDto> {
    const cacheKey = `auth:me:${userId}`;
    const cached = await this.cacheManager.get<AuthMeResponseDto>(cacheKey);
    if (cached) return cached;

    const user = await this.usersRepository.findByIdWithRolesAsync(userId);
    if (!user) {
      const notification = new Notification();
      notification.addError({
        context: 'user',
        message: 'Usuário não encontrado',
      });
      throw new NotificationException(notification.getErrors());
    }

    const permissions = (user.roles ?? []).flatMap((r) =>
      (r.permissions ?? []).map((p) => p.key),
    );

    const dto: AuthMeResponseDto = {
      id: user.id,
      roles: (user.roles ?? []).map((r) => r.name),
      permissions: [...new Set(permissions)],
    };

    await this.cacheManager.set(cacheKey, dto);
    return dto;
  }

  async invalidateMeCacheAsync(userId?: string): Promise<void> {
    if (userId) {
      await this.cacheManager.del(`auth:me:${userId}`);
      await this.cacheManager.del(`profile:${userId}`);
    } else {
      await this.cacheManager.clear();
    }
  }

  private async generateTokenPairAsync(
    user: User,
  ): Promise<{ accessToken: string; refreshToken: string; tokenHash: string }> {
    const permissions = (user.roles ?? []).flatMap((r) =>
      (r.permissions ?? []).map((p) => p.key),
    );

    const rawRefresh = crypto.randomUUID() + crypto.randomUUID();

    const payload: JwtPayload = {
      sub: user.id,
      roles: (user.roles ?? []).map((r) => r.name),
      permissions: [...new Set(permissions)],
      sessionId: rawRefresh,
    };

    const accessTokenExpiration =
      this.configService.get<string>('JWT_EXPIRATION') ?? '1h';
    const accessToken = this.jwtService.sign(payload as any, {
      expiresIn: accessTokenExpiration as any,
    });
    const tokenHash = await bcrypt.hash(rawRefresh, 10);
    const expirationHours = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRATION_HOURS',
      1,
    );

    const refreshToken = this.jwtService.sign(
      { sub: user.id, jti: rawRefresh },
      { expiresIn: `${expirationHours}h` },
    );

    return { accessToken, refreshToken, tokenHash };
  }

  private async revokeAllUserTokensAsync(userId: string): Promise<void> {
    const tokens = await this.refreshTokenRepository.find({
      where: { userId, revokedAt: IsNull() },
    });

    for (const record of tokens) {
      record.revokedAt = new Date();
      await this.refreshTokenRepository.save(record);
    }

    await this.cacheManager.set(
      `user_sessions_invalidated_at:${userId}`,
      {
        time: Date.now(),
        survivorSessionId: null,
      },
      15 * 60 * 1000,
    );
  }

  private async revokeOtherUserTokensAsync(
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    const userTokens = await this.refreshTokenRepository.find({
      where: { userId, revokedAt: IsNull() },
    });

    for (const record of userTokens) {
      const isMatch = await bcrypt.compare(currentSessionId, record.tokenHash);
      if (!isMatch) {
        record.revokedAt = new Date();
        await this.refreshTokenRepository.save(record);
      }
    }

    // Globally invalidate all OTHER active access tokens immediately
    await this.cacheManager.set(
      `user_sessions_invalidated_at:${userId}`,
      {
        time: Date.now(),
        survivorSessionId: currentSessionId,
      },
      15 * 60 * 1000, // Access tokens only live for 15 minutes
    );
  }

  private async createEmailVerificationTokenAsync(
    userId: string,
  ): Promise<string> {
    const rawToken = crypto.randomUUID();
    const tokenHash = await bcrypt.hash(rawToken, 10);

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getMinutes() + 10);

    const record = this.emailVerificationTokenRepository.create({
      userId,
      tokenHash,
      expiresAt,
    });
    await this.emailVerificationTokenRepository.save(record);

    return rawToken;
  }

  private async createPasswordResetTokenAsync(user: User): Promise<string> {
    const tokenId = crypto.randomUUID();
    const tokenHash = await bcrypt.hash(tokenId, 10);

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    const record = this.passwordResetTokenRepository.create({
      userId: user.id,
      tokenHash,
      expiresAt,
    });
    await this.passwordResetTokenRepository.save(record);

    const payload = {
      sub: user.id,
      email: user.email,
      jti: tokenId,
    };

    return this.jwtService.sign(payload, { expiresIn: '5m' });
  }

  private async findValidPasswordResetTokenAsync(
    token: string,
  ): Promise<PasswordResetToken | null> {
    let payload;
    try {
      payload = this.jwtService.verify(token);
    } catch (_err) {
      return null;
    }

    const tokenId = payload.jti;
    if (!tokenId) return null;

    const records = await this.passwordResetTokenRepository.find({
      where: { usedAt: IsNull(), userId: payload.sub },
    });

    for (const record of records) {
      const isMatch = await bcrypt.compare(tokenId, record.tokenHash);
      if (isMatch) {
        if (record.expiresAt < new Date()) {
          const notification = new Notification();
          notification.addError({ context: 'token', message: 'Token expired' });
          throw new NotificationException(notification.getErrors());
        }
        return record;
      }
    }

    return null;
  }

  private async findValidEmailVerificationTokenAsync(
    token: string,
  ): Promise<EmailVerificationToken | null> {
    const records = await this.emailVerificationTokenRepository.find({
      where: { usedAt: IsNull() },
    });

    for (const record of records) {
      const isMatch = await bcrypt.compare(token, record.tokenHash);
      if (isMatch) {
        if (record.expiresAt < new Date()) {
          const notification = new Notification();
          notification.addError({ context: 'token', message: 'Token expired' });
          throw new NotificationException(notification.getErrors());
        }
        return record;
      }
    }

    return null;
  }
}
