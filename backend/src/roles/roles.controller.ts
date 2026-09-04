import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import {
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Permissions } from '../common/decorators/permissions.decorator';
import { RoleService } from './roles.service';
import { RoleResponse } from './responses/role.response';

@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
export class RoleController {
  constructor(private readonly rolesService: RoleService) {}

  @ApiExcludeEndpoint()
  @Get()
  @Permissions('dashboard:role:read')
  @ApiOperation({ summary: 'Listar todos os roles' })
  @ApiResponse({
    status: 200,
    description: 'Lista de roles retornada com sucesso',
    type: [RoleResponse],
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Permissão insuficiente' })
  findAll() {
    return this.rolesService.findAllAsync();
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  @Permissions('dashboard:role:read')
  @ApiOperation({ summary: 'Buscar role por ID' })
  @ApiResponse({
    status: 200,
    description: 'Role retornado com sucesso',
    type: RoleResponse,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Permissão insuficiente' })
  @ApiResponse({ status: 404, description: 'Role não encontrado' })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOneAsync(id);
  }

  @ApiExcludeEndpoint()
  @Post(':id/permissions')
  @Permissions('dashboard:role:update')
  @ApiOperation({ summary: 'Atribuir permissão a um role' })
  @ApiResponse({
    status: 200,
    description: 'Permissão atribuída com sucesso',
    type: RoleResponse,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Permissão insuficiente' })
  @ApiResponse({ status: 404, description: 'Role ou permissão não encontrado' })
  assignPermission(
    @Param('id') roleId: string,
    @Body('permissionId') permissionId: string,
  ) {
    return this.rolesService.assignPermissionAsync(roleId, permissionId);
  }
}
