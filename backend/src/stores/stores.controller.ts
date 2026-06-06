import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../common/current-user.decorator';
import { Role } from '../common/roles';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { CreateStoreDto } from './dto';
import { StoresService } from './stores.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() dto: CreateStoreDto) {
    return this.storesService.create(dto);
  }

  @Get()
  list(@Query() query: Record<string, string>, @CurrentUser() user: RequestUser) {
    return this.storesService.list(query as never, user.role === Role.User ? user.sub : undefined);
  }

  @Get('owner/dashboard')
  @Roles(Role.Owner)
  ownerDashboard(@CurrentUser() user: RequestUser) {
    return this.storesService.ownerDashboard(user.sub);
  }
}
