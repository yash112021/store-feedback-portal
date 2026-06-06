import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Role } from '../common/roles';
import { Store } from '../stores/store.entity';
import { CreateUserDto } from './dto';
import { User } from './user.entity';

type UserListQuery = {
  name?: string;
  email?: string;
  address?: string;
  role?: Role;
  sortBy?: 'name' | 'email' | 'address' | 'role';
  order?: 'ASC' | 'DESC';
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Store) private readonly stores: Repository<Store>,
  ) {}

  async create(dto: CreateUserDto, defaultRole = Role.User) {
    const exists = await this.users.exist({ where: { email: dto.email.toLowerCase() } });
    if (exists) {
      throw new BadRequestException('email is already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.users.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      address: dto.address,
      passwordHash,
      role: dto.role ?? defaultRole,
    });

    return this.sanitize(await this.users.save(user));
  }

  async findByEmail(email: string) {
    return this.users.findOne({ where: { email: email.toLowerCase() } });
  }

  async findOne(id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  async updatePassword(id: number, password: string) {
    const user = await this.findOne(id);
    user.passwordHash = await bcrypt.hash(password, 10);
    await this.users.save(user);
    return { message: 'password updated' };
  }

  async list(query: UserListQuery) {
    const qb = this.users.createQueryBuilder('user');

    if (query.name) qb.andWhere('LOWER(user.name) LIKE LOWER(:name)', { name: `%${query.name}%` });
    if (query.email) qb.andWhere('LOWER(user.email) LIKE LOWER(:email)', { email: `%${query.email}%` });
    if (query.address) qb.andWhere('LOWER(user.address) LIKE LOWER(:address)', { address: `%${query.address}%` });
    if (query.role) qb.andWhere('user.role = :role', { role: query.role });

    const sortBy = query.sortBy ?? 'name';
    qb.orderBy(`user.${sortBy}`, query.order ?? 'ASC');

    return (await qb.getMany()).map((user) => this.sanitize(user));
  }

  async detail(id: number) {
    const user = await this.findOne(id);
    const result: Record<string, unknown> = this.sanitize(user);

    if (user.role === Role.Owner) {
      const ownerStores = await this.stores
        .createQueryBuilder('store')
        .leftJoin('store.ratings', 'rating')
        .select('store.id', 'id')
        .addSelect('store.name', 'name')
        .addSelect('COALESCE(AVG(rating.value), 0)', 'rating')
        .where('store.ownerId = :id', { id: user.id })
        .groupBy('store.id')
        .getRawMany();
      result.stores = ownerStores.map((store) => ({ ...store, rating: Number(store.rating) }));
    }

    return result;
  }

  sanitize(user: User) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
