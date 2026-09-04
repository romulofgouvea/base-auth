import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiExcludeEndpoint,
} from '@nestjs/swagger';
import { Permissions } from '../common/decorators/permissions.decorator';
import { PermissionService } from './permissions.service';
import { PermissionResponse } from './responses/permission.response';

@ApiTags('Permissions')
@ApiBearerAuth()
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionsService: PermissionService) {}

  @ApiExcludeEndpoint()
  @Get()
  @Permissions('dashboard:permission:read')
  @ApiOperation({ summary: 'List all permissions' })
  @ApiResponse({
    status: 200,
    description: 'Lista de permissões retornada com sucesso',
    type: [PermissionResponse],
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado — token ausente ou inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido — permissões insuficientes',
  })
  async findAllAsync(): Promise<PermissionResponse[]> {
    return this.permissionsService.findAllAsync();
  }

  @ApiExcludeEndpoint()
  @Get(':id')
  @Permissions('dashboard:permission:read')
  @ApiOperation({ summary: 'Get a permission by ID' })
  @ApiResponse({
    status: 200,
    description: 'Permissão retornada com sucesso',
    type: PermissionResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Não autorizado — token ausente ou inválido',
  })
  @ApiResponse({
    status: 403,
    description: 'Proibido — permissões insuficientes',
  })
  @ApiResponse({ status: 404, description: 'Permissão não encontrada' })
  async findOneAsync(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PermissionResponse> {
    return this.permissionsService.findOneAsync(id);
  }
}
