import { Controller, Get, Patch, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import * as AuthInterfaces from '../auth/interfaces/jwt-payload.interface';
import { ProfileService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponse } from './responses/profile.response';

@ApiTags('Profiles')
@ApiBearerAuth()
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profilesService: ProfileService) {}

  @Get()
  @Permissions('dashboard:profile:read')
  @ApiOperation({ summary: 'Get the authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Perfil retornado com sucesso',
    type: ProfileResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado — token ausente ou inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido — permissões insuficientes',
  })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async getMyProfileAsync(
    @CurrentUser() user: AuthInterfaces.JwtPayload,
  ): Promise<ProfileResponse> {
    return this.profilesService.findByUserIdCachedAsync(user.sub);
  }

  @Patch()
  @Permissions('dashboard:profile:update')
  @ApiOperation({ summary: 'Update the authenticated user profile' })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso',
    type: ProfileResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado — token ausente ou inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido — permissões insuficientes',
  })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async updateMyProfileAsync(
    @CurrentUser() user: AuthInterfaces.JwtPayload,
    @Body() dto: UpdateProfileDto,
  ): Promise<ProfileResponse> {
    return this.profilesService.updateAsync(user.sub, dto);
  }
}
