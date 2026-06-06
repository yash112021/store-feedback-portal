import { Body, Controller, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser, RequestUser } from '../common/current-user.decorator';
import { Role } from '../common/roles';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { UpsertRatingDto } from './dto';
import { RatingsService } from './ratings.service';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('stores/:storeId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Put('me')
  @Roles(Role.User)
  upsert(
    @CurrentUser() user: RequestUser,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() dto: UpsertRatingDto,
  ) {
    return this.ratingsService.upsert(user.sub, storeId, dto);
  }
}
