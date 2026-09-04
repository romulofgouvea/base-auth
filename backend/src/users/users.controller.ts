import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserResponse } from './responses/user.response';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) {}

  @ApiExcludeEndpoint()
  @Get()
  @Permissions('dashboard:user:read')
  @ApiOperation({ summary: 'Listar todos os usuários ativos' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários retornada com sucesso',
    type: [UserResponse],
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Permissão insuficiente' })
  findAll() {
    return this.usersService.findAllAsync();
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  @Permissions('dashboard:user:read')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuário encontrado',
    type: UserResponse,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Permissão insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (id !== user.sub && !user.roles?.includes('ADMIN')) {
      throw new ForbiddenException(
        'Você só pode visualizar seus próprios dados',
      );
    }
    return this.usersService.findOneAsync(id);
  }

  @ApiExcludeEndpoint()
  @Patch(':id')
  @Permissions('dashboard:user:update')
  @ApiOperation({ summary: 'Atualizar dados do usuário' })
  @ApiResponse({
    status: 200,
    description: 'Usuário atualizado com sucesso',
    type: UserResponse,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Permissão insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 409, description: 'Email ou username já em uso' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (id !== user.sub && !user.roles?.includes('ADMIN')) {
      throw new ForbiddenException(
        'Você só pode atualizar seus próprios dados',
      );
    }
    return this.usersService.updateAsync(id, dto, user.sub);
  }

  @Delete('me/permanent')
  @Permissions('dashboard:user:update')
  @ApiOperation({
    summary: 'Solicitar exclusão permanente da conta (agendada para 30 dias)',
  })
  @ApiResponse({
    status: 200,
    description: 'Exclusão permanente agendada com sucesso',
    type: UserResponse,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  removePermanent(@CurrentUser() user: JwtPayload) {
    return this.usersService.removeUserPermanentAsync(user.sub, user.sub);
  }

  @ApiExcludeEndpoint()
  @Delete(':id')
  @Permissions('dashboard:user:delete')
  @ApiOperation({ summary: 'Remover usuário (soft-delete)' })
  @ApiResponse({
    status: 200,
    description: 'Usuário removido com sucesso',
    type: UserResponse,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Permissão insuficiente' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    if (id !== user.sub && !user.roles?.includes('ADMIN')) {
      throw new ForbiddenException('Você só pode excluir seus próprios dados');
    }
    return this.usersService.removeAsync(id, user.sub);
  }
}
