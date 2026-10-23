import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { RestockDto } from './dto/restock.dto';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post(':id/purchase')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atomically purchase one unit of a vehicle' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle purchased successfully, quantity decremented',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  @ApiResponse({ status: 409, description: 'Vehicle is out of stock' })
  async purchase(@Param('id', ParseUUIDPipe) id: string) {
    return this.inventoryService.purchase(id);
  }

  @Post(':id/restock')
  @HttpCode(HttpStatus.OK)
  @Roles(Role.ADMIN) // Admin only endpoint
  @ApiOperation({
    summary: 'Restock vehicle inventory by specified amount (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle restocked successfully, quantity incremented',
  })
  @ApiResponse({ status: 400, description: 'Invalid restock amount' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async restock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RestockDto,
  ) {
    return this.inventoryService.restock(id, dto.amount);
  }
}
