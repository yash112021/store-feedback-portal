import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/roles';
import { Rating } from '../ratings/rating.entity';
import { User } from '../users/user.entity';
import { CreateStoreDto } from './dto';
import { Store } from './store.entity';

type StoreListQuery = {
  name?: string;
  email?: string;
  address?: string;
  sortBy?: 'name' | 'email' | 'address' | 'rating';
  order?: 'ASC' | 'DESC';
};

@Injectable()
export class StoresService {
  constructor(
    @InjectRepository(Store) private readonly stores: Repository<Store>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Rating) private readonly ratings: Repository<Rating>,
  ) {}

  async create(dto: CreateStoreDto) {
    const exists = await this.stores.exist({ where: { email: dto.email.toLowerCase() } });
    if (exists) {
      throw new BadRequestException('store email is already registered');
    }

    const owner = await this.users.findOne({ where: { id: dto.ownerId } });
    if (!owner || owner.role !== Role.Owner) {
      throw new BadRequestException('ownerId must belong to a store owner');
    }

    const store = this.stores.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      address: dto.address,
      ownerId: dto.ownerId,
    });

    return this.stores.save(store);
  }

  async list(query: StoreListQuery, currentUserId?: number) {
    const qb = this.stores
      .createQueryBuilder('store')
      .leftJoin('store.ratings', 'rating')
      .select('store.id', 'id')
      .addSelect('store.name', 'name')
      .addSelect('store.email', 'email')
      .addSelect('store.address', 'address')
      .addSelect('store.ownerId', 'ownerId')
      .addSelect('COALESCE(AVG(rating.value), 0)', 'rating')
      .groupBy('store.id');

    if (query.name) qb.andWhere('LOWER(store.name) LIKE LOWER(:name)', { name: `%${query.name}%` });
    if (query.email) qb.andWhere('LOWER(store.email) LIKE LOWER(:email)', { email: `%${query.email}%` });
    if (query.address) qb.andWhere('LOWER(store.address) LIKE LOWER(:address)', { address: `%${query.address}%` });

    const sortBy = query.sortBy ?? 'name';
    qb.orderBy(sortBy === 'rating' ? 'rating' : `store.${sortBy}`, query.order ?? 'ASC');

    const stores = await qb.getRawMany();
    const userRatings = currentUserId
      ? await this.ratings.find({ where: { userId: currentUserId } })
      : [];

    const ratingsByStore = new Map(userRatings.map((rating) => [rating.storeId, rating.value]));
    return stores.map((store) => ({
      ...store,
      rating: Number(store.rating),
      userRating: ratingsByStore.get(Number(store.id)) ?? null,
    }));
  }

  async ownerDashboard(ownerId: number) {
    const store = await this.stores.findOne({ where: { ownerId } });
    if (!store) {
      throw new NotFoundException('store not found for owner');
    }

    const average = await this.ratings
      .createQueryBuilder('rating')
      .select('COALESCE(AVG(rating.value), 0)', 'average')
      .where('rating.storeId = :storeId', { storeId: store.id })
      .getRawOne<{ average: string }>();

    const submittedBy = await this.ratings.find({
      where: { storeId: store.id },
      relations: { user: true },
      order: { updatedAt: 'DESC' },
    });

    return {
      store,
      averageRating: Number(average?.average ?? 0),
      ratings: submittedBy.map((rating) => ({
        id: rating.id,
        value: rating.value,
        updatedAt: rating.updatedAt,
        user: {
          id: rating.user.id,
          name: rating.user.name,
          email: rating.user.email,
          address: rating.user.address,
        },
      })),
    };
  }
}
