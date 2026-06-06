import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../common/current-user.decorator';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { Role } from '../common/roles';
import { CreateUserDto, UpdatePasswordDto } from './dto';
import { UsersService } from './users.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(Role.Admin)
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(Role.Admin)
  list(@Query() query: Record<string, string>) {
    return this.usersService.list(query as never);
  }

  @Get('me')
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.detail(user.sub);
  }

  @Get(':id')
  @Roles(Role.Admin)
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.detail(id);
  }

  @Patch('me/password')
  updateMyPassword(@CurrentUser() user: RequestUser, @Body() dto: UpdatePasswordDto) {
    return this.usersService.updatePassword(user.sub, dto.password);
  }
}
