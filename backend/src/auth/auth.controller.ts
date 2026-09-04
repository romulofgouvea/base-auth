import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import * as Express from 'express';

import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  LogoutDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ChangePasswordDto,
} from './dto/index';
import {
  RegisterResponseDto,
  LoginResponseDto,
  RefreshResponseDto,
  AuthMeResponseDto,
} from './responses/index';
import * as AuthInterfaces from './interfaces/jwt-payload.interface';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { LoginRateLimitGuard } from './guards/login-rate-limit.guard';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'Usuário registrado com sucesso',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito (E-mail ou Username já existe)',
  })
  async registerAsync(@Body() dto: RegisterDto, @Req() req: Express.Request) {
    return this.authService.registerAsync(
      dto,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? '',
    );
  }

  @Get('me')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Retornar roles e permissões do usuário autenticado (com cache)',
  })
  @ApiResponse({
    status: 200,
    description: 'Dados de autorização do usuário',
    type: AuthMeResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async getMeAsync(@CurrentUser() user: AuthInterfaces.JwtPayload) {
    return this.authService.getMeAsync(user.sub);
  }

  @Public()
  @UseGuards(LoginRateLimitGuard)
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Autenticar usuário e retornar tokens' })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 429, description: 'Muitas requisições' })
  async loginAsync(@Body() dto: LoginDto, @Req() req: Express.Request) {
    return this.authService.loginAsync(
      dto,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? '',
    );
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renovar access token usando refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Token renovado com sucesso',
    type: RefreshResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async refreshAsync(
    @Body() dto: RefreshTokenDto,
    @Req() req: Express.Request,
  ) {
    return this.authService.refreshAsync(
      dto.refreshToken,
      req.ip ?? 'unknown',
      req.headers['user-agent'] ?? '',
    );
  }

  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Encerrar sessão atual (invalidar refresh token)' })
  @ApiResponse({
    status: 200,
    description: 'Logout realizado com sucesso',
    type: Boolean,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async logoutAsync(
    @Body() dto: LogoutDto,
    @CurrentUser() user: AuthInterfaces.JwtPayload,
  ) {
    await this.authService.logoutAsync(user.sub, dto.refreshToken);
    return true;
  }

  @Post('logout-all')
  @HttpCode(200)
  @ApiOperation({ summary: 'Encerrar todas as sessões do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Todas as sessões foram encerradas',
    type: Boolean,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async logoutAllAsync(
    @CurrentUser() user: AuthInterfaces.JwtPayload,
    @Body() _dto: LogoutDto,
  ) {
    await this.authService.logoutAllAsync(user.sub, user.sessionId!);
    return true;
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Solicitar link de redefinição de senha' })
  @ApiResponse({
    status: 200,
    description: 'Link de redefinição enviado caso o identificador exista',
    type: Boolean,
  })
  async forgotPasswordAsync(
    @Body() dto: ForgotPasswordDto,
    @Req() req: Express.Request,
  ) {
    const origin = req.headers.origin;
    await this.authService.forgotPasswordAsync(dto.email, origin);
    return true;
  }

  @Public()
  @Post('reset-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Redefinir a senha do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Senha redefinida com sucesso',
    type: Boolean,
  })
  async resetPasswordAsync(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPasswordAsync(dto.token, dto.newPassword);
    return true;
  }

  @ApiExcludeEndpoint()
  @Public()
  @Post('verify-email')
  @HttpCode(200)
  @ApiOperation({ summary: 'Verificar o e-mail do usuário' })
  @ApiResponse({
    status: 200,
    description: 'E-mail verificado com sucesso',
    type: Boolean,
  })
  async verifyEmailAsync(@Body() dto: VerifyEmailDto) {
    await this.authService.verifyEmailAsync(dto.token);
    return true;
  }

  @ApiExcludeEndpoint()
  @Post('resend-verification')
  @HttpCode(200)
  @ApiOperation({ summary: 'Reenviar e-mail de verificação' })
  @ApiResponse({
    status: 200,
    description: 'E-mail de verificação reenviado com sucesso',
    type: Boolean,
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async resendVerificationAsync(
    @CurrentUser() user: AuthInterfaces.JwtPayload,
  ) {
    await this.authService.resendVerificationAsync(user.sub);
    return true;
  }

  @Post('change-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Alterar a senha do usuário atual' })
  @ApiResponse({
    status: 200,
    description: 'Senha alterada com sucesso',
    type: Boolean,
  })
  @ApiResponse({ status: 400, description: 'Senha atual incorreta' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  async changePasswordAsync(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: AuthInterfaces.JwtPayload,
  ) {
    await this.authService.changePasswordAsync(user.sub, dto);
    return true;
  }
}
