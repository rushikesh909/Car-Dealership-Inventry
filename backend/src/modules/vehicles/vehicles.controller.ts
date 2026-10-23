import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehicleDto } from './dto/search-vehicle.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a new vehicle to inventory' })
  @ApiResponse({ status: 201, description: 'Vehicle successfully created' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List vehicles with pagination' })
  @ApiResponse({ status: 200, description: 'List of vehicles' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@Query() pagination: PaginationDto) {
    return this.vehiclesService.findAll(pagination);
  }

  /**
   * Route ordering is critical in Express/NestJS:
   * /vehicles/search MUST be registered BEFORE /vehicles/:id to prevent NestJS
   * from interpreting the literal string 'search' as a UUID parameter.
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search and filter vehicles by criteria' })
  @ApiResponse({ status: 200, description: 'Filtered vehicles list' })
  @ApiResponse({ status: 400, description: 'Invalid filter parameters' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async search(@Query() filters: SearchVehicleDto) {
    return this.vehiclesService.search(filters);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get vehicle by UUID' })
  @ApiResponse({ status: 200, description: 'Vehicle found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.findById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update vehicle details' })
  @ApiResponse({ status: 200, description: 'Vehicle updated' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(Role.ADMIN) // Admin only endpoint
  @ApiOperation({ summary: 'Delete a vehicle from inventory (Admin only)' })
  @ApiResponse({ status: 204, description: 'Vehicle deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  @ApiResponse({ status: 404, description: 'Vehicle not found' })
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.delete(id);
  }
}
