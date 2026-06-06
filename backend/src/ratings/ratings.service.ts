import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../stores/store.entity';
import { UpsertRatingDto } from './dto';
import { Rating } from './rating.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating) private readonly ratings: Repository<Rating>,
    @InjectRepository(Store) private readonly stores: Repository<Store>,
  ) {}

  async upsert(userId: number, storeId: number, dto: UpsertRatingDto) {
    const storeExists = await this.stores.exist({ where: { id: storeId } });
    if (!storeExists) {
      throw new NotFoundException('store not found');
    }

    let rating = await this.ratings.findOne({ where: { userId, storeId } });
    if (!rating) {
      rating = this.ratings.create({ userId, storeId, value: dto.value });
    } else {
      rating.value = dto.value;
    }

    if (Number.isNaN(dto.value)) {
      throw new BadRequestException('rating must be a number');
    }

    return this.ratings.save(rating);
  }
}
